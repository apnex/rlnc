const { parentPort, workerData } = require('worker_threads');
const BlockEncoder = require('../core/block_encoder');
const PacketSerializer = require('../network/packet_serializer');
const CodedPiece = require('../network/coded_piece');

/**
 * SHARED-MEMORY ENCODER WORKER (CON-004)
 */

// Map<GenID, BlockEncoder>
const encoders = new Map();

// 1. Map the Shared Memory
const control = new Int32Array(workerData.controlBuffer);
const data = new Uint8Array(workerData.dataBuffer);
const { numSlots, slotSize } = workerData;
const halfSlots = Math.floor(numSlots / 2);

parentPort.on('message', (msg) => {
    switch (msg.type) {
        case 'INIT':
            try {
                // v11: Input is already shared or transferred.
                const safeBuffer = Buffer.from(msg.data);
                const enc = new BlockEncoder(safeBuffer, msg.config);
                encoders.set(msg.genId, enc);
            } catch (e) {
                // Ignore
            }
            break;

        case 'PRODUCE':
            producePackets(msg.limit, msg.protocolConfig, msg.budgets);
            break;

        case 'BOOST':
            const target = encoders.get(msg.genId);
            if (target) {
                for (let i = 0; i < msg.count; i++) {
                    const fallbackConfig = { HEADER_SIZE: 8, MAGIC_BYTE: 0xAA, VERSION: 1 };
                    sendPacketViaShared(target, msg.protocolConfig || fallbackConfig, msg.genId);
                }
            }
            break;

        case 'ACK':
            encoders.delete(msg.genId);
            break;
    }
});

/**
 * Writes a packet directly into the SharedArrayBuffer.
 */
function sendPacketViaShared(encoder, protocol, genId) {
    const rawPiece = encoder.codedPiece();
    if (!rawPiece) return false;

    // v11: Tag the raw output with the orchestration genId
    const piece = new CodedPiece(genId, rawPiece.coeffs, rawPiece.data);

    // v11 Optimization: Atomic acquisition
    const slotIdx = acquireTX();
    if (slotIdx === -1) return false;

    const offset = slotIdx * slotSize;
    const slotView = data.subarray(offset, offset + slotSize);

    // Serialize directly into the Shared View
    const bytesWritten = PacketSerializer.serializeTo(piece, protocol, slotView);

    // Notify Main Thread that a slot is ready
    // Note: Main thread will reset to 0 after emission
    parentPort.postMessage({
        type: 'PACKET_SHARED',
        genId: piece.genId,
        slotIdx,
        length: bytesWritten
    });

    return true;
}

function acquireTX() {
    const maxAttempts = halfSlots;
    for (let i = 0; i < maxAttempts; i++) {
        let tail = Atomics.load(control, 1);
        let nextTail = (tail + 1) % halfSlots;
        
        if (Atomics.compareExchange(control, 1, tail, nextTail) === tail) {
            if (Atomics.compareExchange(control, 3 + tail, 0, 1) === 0) {
                return tail;
            }
        }
    }
    return -1;
}

function producePackets(limit, protocol, budgets) {
    let produced = 0;
    const stats = {};
    const activeIds = budgets ? Object.keys(budgets) : Array.from(encoders.keys());
    if (activeIds.length === 0) return;

    while (produced < limit) {
        const randomId = activeIds[Math.floor(Math.random() * activeIds.length)];
        if (randomId === undefined) break;

        if (budgets && budgets[randomId] <= 0) {
            const idx = activeIds.indexOf(randomId);
            if (idx !== -1) activeIds.splice(idx, 1);
            continue;
        }

        const encoder = encoders.get(Number(randomId));
        if (!encoder) {
            const idx = activeIds.indexOf(randomId);
            if (idx !== -1) activeIds.splice(idx, 1);
            continue;
        }

        if (sendPacketViaShared(encoder, protocol, Number(randomId))) {
            produced++;
            stats[randomId] = (stats[randomId] || 0) + 1;
            if (budgets) budgets[randomId]--;
        } else {
            break;
        }
    }

    if (produced > 0) {
        parentPort.postMessage({ type: 'STATS', stats });
    }
}
const { parentPort } = require('worker_threads');
const BlockEncoder = require('../core/block_encoder');
const PacketSerializer = require('../network/packet_serializer');

// Map<GenID, BlockEncoder>
const encoders = new Map();

parentPort.on('message', (msg) => {
    switch (msg.type) {
        case 'INIT':
            try {
                // v7 Optimization: Zero-Copy Receive
                // msg.data is an ArrayBuffer transferred from the main thread.
                // Buffer.from() simply creates a view over this memory (O(1) operation).
                const safeBuffer = Buffer.from(msg.data);
                const enc = new BlockEncoder(safeBuffer, msg.genId, msg.config);
                encoders.set(msg.genId, enc);
            } catch (e) {
                // Silently ignore errors to prevent worker crash loop
            }
            break;

        case 'PRODUCE':
            producePackets(msg.limit, msg.protocolConfig, msg.budgets);
            break;

        case 'BOOST':
            // FIX: Manual Boost Logic (Preserved from Baseline)
            // BlockEncoder is stateless; we manually drive packet generation here.
            const target = encoders.get(msg.genId);
            if (target) {
                for (let i = 0; i < msg.count; i++) {
                    // Legacy/Boost messages might lack protocol config.
                    // Fallback prevents PacketSerializer from crashing (NaN errors).
                    const fallbackConfig = { HEADER_SIZE: 8, MAGIC_BYTE: 0xAA, VERSION: 1 };
                    sendPacket(target, msg.protocolConfig || fallbackConfig);
                }
            }
            break;

        case 'ACK':
            encoders.delete(msg.genId);
            break;
    }
});

/**
 * Generates, Serializes, and TRANSFERS a packet (Zero-Copy).
 * Returns true if a packet was successfully sent.
 */
function sendPacket(encoder, protocol) {
    const piece = encoder.codedPiece();

    if (piece) {
        let buf = PacketSerializer.serialize(piece, protocol);

        // v7 Optimization: POOL DETACHMENT SAFETY
        // PacketSerializer (via Buffer.allocUnsafe) likely allocates from Node's shared 8KB pool.
        // We CANNOT transfer a shared buffer (it would detach the whole pool and crash other parts of the app).
        // Check if the buffer is a "slice" of a larger pool:
        if (buf.byteOffset !== 0 || buf.byteLength !== buf.buffer.byteLength) {
            // It is shared. We must create a dedicated copy to transfer it.
            // This 'memcpy' is small (1KB) and much cheaper than the Structured Clone of the whole pool.
            const unique = new Uint8Array(buf.byteLength);
            unique.set(buf);
            buf = unique;
        }

        // v7 Optimization: ZERO-COPY TRANSFER
        // We use the second argument of postMessage (transferList) to MOVE the underlying memory.
        // The main thread receives the buffer instantly; this worker loses access to it immediately.
        parentPort.postMessage({
            type: 'PACKET',
            genId: piece.genId,
            payload: buf
        }, [buf.buffer]); // <--- Ownership moved here
        return true;
    }
    return false;
}

function producePackets(limit, protocol, budgets) {
    let produced = 0;
    const stats = {};

    // scheduler: prioritize IDs with remaining budget
    const activeIds = budgets ? Object.keys(budgets) : Array.from(encoders.keys());
    if (activeIds.length === 0) return;

    while (produced < limit) {
        const randomId = activeIds[Math.floor(Math.random() * activeIds.length)];
        // DECENTRALIZED ENFORCEMENT
        if (budgets && budgets[randomId] <= 0) {
            const idx = activeIds.indexOf(randomId);
            activeIds.splice(idx, 1);
            if (activeIds.length === 0) break;
            continue;
        }

        const encoder = encoders.get(Number(randomId));
        if (encoder && sendPacket(encoder, protocol)) {
            produced++;
	    stats[randomId] = (stats[randomId] || 0) + 1; // Increment local stats
            if (budgets) budgets[randomId]--; // Local decrement
        } else {
            break;
        }
    }
    if (produced > 0) {
        parentPort.postMessage({ type: 'STATS', stats });
    }
}

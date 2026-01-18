const { parentPort, workerData } = require('worker_threads');
const BlockDecoder = require('../core/block_decoder');
const PacketSerializer = require('../network/packet_serializer');

/**
 * SHARED-MEMORY DECODER WORKER (CON-004)
 */

const decoders = new Map(); // GenID -> BlockDecoder

// 1. Map the Shared Memory
const control = new Int32Array(workerData.controlBuffer);
const data = new Uint8Array(workerData.dataBuffer);
const { numSlots, slotSize } = workerData;

parentPort.on('message', (msg) => {
    if (msg.type === 'ADD_PIECE') {
        handlePiece(msg.piece, msg.config);
    } 
    else if (msg.type === 'PROCESS_SLOT') {
        const { slotIdx, config } = msg;
        const offset = slotIdx * slotSize;
        const slotView = data.subarray(offset, offset + slotSize);

        const piece = PacketSerializer.deserialize(slotView, config);
        if (piece) {
            handlePiece(piece, config);
        }

        // Release slot via Subtraction (Atomic Unlock)
        Atomics.sub(control, 3 + slotIdx, 1);
    }
});

function handlePiece(piece, config) {
    if (!decoders.has(piece.genId)) {
        decoders.set(piece.genId, new BlockDecoder(config));
    }

    const decoder = decoders.get(piece.genId);
    const done = decoder.addPiece(piece);

    // v11: Notify engine of rank progression
    parentPort.postMessage({
        type: 'RANK_UPDATE',
        genId: piece.genId,
        rank: decoder.rank
    });

    if (done) {
        const result = decoder.getData();
        parentPort.postMessage({
            type: 'SOLVED',
            genId: piece.genId,
            data: result.buffer
        }, [result.buffer]);
        
        decoders.delete(piece.genId);
    }
}
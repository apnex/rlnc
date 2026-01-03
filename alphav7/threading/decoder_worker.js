const { parentPort } = require('worker_threads');
const BlockDecoder = require('../core/block_decoder');

const decoders = new Map(); // GenID -> BlockDecoder

parentPort.on('message', (msg) => {
    if (msg.type === 'ADD_PIECE') {
        const { piece, config } = msg;
        
        if (!decoders.has(piece.genId)) {
            decoders.set(piece.genId, new BlockDecoder(config));
        }

        const decoder = decoders.get(piece.genId);
        const done = decoder.addPiece(piece);

        if (done) {
            const data = decoder.getData();
            // v8 Optimization: ZERO-COPY TRANSFER
            // We transfer the ArrayBuffer back to the main thread.
            parentPort.postMessage({
                type: 'SOLVED',
                genId: piece.genId,
                data: data.buffer
            }, [data.buffer]);
            
            decoders.delete(piece.genId);
        }
    }
});

const BlockDecoder = require('../core/block_decoder');
const EventEmitter = require('events');

class GenerationDecoder extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.decoders = new Map(); // GenID -> BlockDecoder
        this.completed = new Map(); // GenID -> Buffer
    }

    static create(config) {
        return new GenerationDecoder(config);
    }

    addPiece(piece) {
        if (this.completed.has(piece.genId)) return; // Already solved

        if (!this.decoders.has(piece.genId)) {
            this.decoders.set(piece.genId, new BlockDecoder(this.config));
        }

        const decoder = this.decoders.get(piece.genId);
        const done = decoder.addPiece(piece);

        if (done) {
            this.completed.set(piece.genId, decoder.getData());
            this.decoders.delete(piece.genId); // Free memory
            this.emit('generation_ready', piece.genId);
        }
    }

    getReconstructedFile() {
        // Sort generations and concat
        const keys = Array.from(this.completed.keys()).sort((a, b) => a - b);
        if (keys.length === 0) return null;
        
        // Check for gaps? (Assuming sequential for now)
        const chunks = keys.map(k => this.completed.get(k));
        return Buffer.concat(chunks);
    }
}
module.exports = GenerationDecoder;

const EventEmitter = require('events');
const WorkerPool = require('./worker_pool');

class GenerationDecoder extends EventEmitter {
    constructor(config, pool = null) {
        super();
        this.config = config;
        this.completed = new Map(); // GenID -> Buffer

        // v8 Structural: Dependency Injection
        if (pool) {
            this.pool = pool;
        } else {
            // v8 Velocity: Multi-Threaded Decoding (Adaptive Default)
            this.pool = new WorkerPool(this.config.SYSTEM.THREADS || 0, 'decoder_worker.js');
        }

        this.pool.on('solved', (genId, data) => {
            if (!this.completed.has(genId)) {
                this.completed.set(genId, data);
                this.emit('generation_ready', genId);
            }
        });
    }

    terminate() {
        this.pool.terminate();
    }

    static create(config, pool = null) {
        return new GenerationDecoder(config, pool);
    }

    addPiece(piece) {
        if (this.completed.has(piece.genId)) return;
        
        // Sharded Dispatch: The Pool handles routing GenID to the correct worker
        this.pool.dispatch(piece.genId, {
            type: 'ADD_PIECE',
            piece,
            config: this.config.TRANSCODE
        });
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

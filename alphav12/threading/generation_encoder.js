const EventEmitter = require('events');
const WorkerPool = require('./worker_pool');
const SlidingWindow = require('./sliding_window');
const CodedPiece = require('../network/coded_piece');

/**
 * GENERATION ENCODER (CON-004)
 * Orchestrates WorkerPool production based on SlidingWindow state.
 */
class GenerationEncoder extends EventEmitter {
    constructor(data, config, pool, window) {
        super();
        this.data = data;
        this.config = config;
        this.pool = pool;
        this.window = window; // SlidingWindow reference

        this.transcodeConfig = config.TRANSCODE;
        this.netConfig = config.NETWORK;
        this.protocolConfig = config.PROTOCOL;

        this.pieceCount = this.transcodeConfig.PIECE_COUNT;
        this.pieceSize = this.transcodeConfig.PIECE_SIZE;
        this.blockSize = this.pieceCount * this.pieceSize;
        this.totalGenerations = Math.ceil(data.length / this.blockSize);

        this.sentCounts = new Map();
        this.activeGenerations = new Set();

        // 1. Sync Window
        this.window.on('slide', (activeGens) => {
            for (const id of activeGens) {
                if (!this.activeGenerations.has(id)) {
                    this._activateGeneration(id);
                }
            }
        });

        // 2. Worker Signaling
        this.pool.on('packet', (buffer) => {
            this.emit('packet', buffer);
        });

        this.pool.on('stats', (workerStats) => {
            for (const [genId, count] of Object.entries(workerStats)) {
                const id = Number(genId);
                const current = this.sentCounts.get(id) || 0;
                this.sentCounts.set(id, current + count);
            }
        });
    }

    static create(data, config, pool, window) {
        return new GenerationEncoder(data, config, pool, window);
    }

    produce(packetLimit) {
        const budgets = {};
        let eligibleCount = 0;

        for (const id of this.window.window) {
            const sent = this.sentCounts.get(id) || 0;
            const limit = Math.ceil(this.pieceCount * this.netConfig.REDUNDANCY) + 5;
            const remaining = limit - sent;
            if (remaining > 0) {
                budgets[id] = remaining;
                eligibleCount++;
            }
        }

        if (eligibleCount > 0) {
            this.pool.produce(packetLimit, this.protocolConfig, budgets);
        }
    }

    _activateGeneration(genId) {
        const start = genId * this.blockSize;
        const end = Math.min(start + this.blockSize, this.data.length);
        const view = this.data.subarray(start, end);
        const chunk = Buffer.allocUnsafe(view.length);
        view.copy(chunk);

        const blockConfig = {
            PIECE_COUNT: this.pieceCount,
            PIECE_SIZE: this.pieceSize,
            REDUNDANCY: this.netConfig.REDUNDANCY,
            SYSTEMATIC: this.transcodeConfig.SYSTEMATIC
        };

        this.pool.addJob(genId, chunk, blockConfig);
        this.activeGenerations.add(genId);
    }

    terminate() {
        this.pool.terminate();
    }
}

module.exports = GenerationEncoder;
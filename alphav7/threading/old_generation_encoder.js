const EventEmitter = require('events');
const WorkerPool = require('./worker_pool');

class GenerationEncoder extends EventEmitter {
    constructor(data, config) {
        super();
        this.data = data;
        this.config = config;
        
        this.transcodeConfig = config.TRANSCODE;
        this.netConfig = config.NETWORK;
        this.windowConfig = config.WINDOW;
        this.protocolConfig = config.PROTOCOL;

        this.pieceCount = this.transcodeConfig.PIECE_COUNT;
        this.pieceSize = this.transcodeConfig.PIECE_SIZE;
        this.blockSize = this.pieceCount * this.pieceSize;
        this.totalGenerations = Math.ceil(data.length / this.blockSize);
        
        this.currentGenId = 0;
        this.window = new Set(); 
        this.ackedGenerations = new Set();
        
        this.pool = new WorkerPool(4); 
        
        this.pool.on('packet', (buffer) => {
            this.emit('packet', buffer);
            this._checkWatchdog(); 
        });

        this.watchdogTimer = null;
        this._fillWindow();
    }

    static create(data, config) {
        return new GenerationEncoder(data, config);
    }

    produce(packetLimit) {
        if (this.isFinished()) return;
        this._fillWindow();
        this.pool.produce(packetLimit, this.protocolConfig);
        this._checkWatchdog();
    }

    acknowledge(genId) {
        if (this.ackedGenerations.has(genId)) return;
        
        this.ackedGenerations.add(genId);
        this.window.delete(genId);
        this.pool.ack(genId);
        
        if (genId === this.currentGenId) {
            this.currentGenId++;
            while(this.ackedGenerations.has(this.currentGenId)) {
                this.currentGenId++;
            }
            this._resetWatchdog();
        }
        this._fillWindow();
    }

    isFinished() {
        return this.ackedGenerations.size === this.totalGenerations;
    }

    terminate() {
        this.pool.terminate();
    }

    _fillWindow() {
        let checkId = this.currentGenId;
        const windowSize = this.windowConfig.SIZE;

        while (this.window.size < windowSize && checkId < this.totalGenerations) {
            if (!this.window.has(checkId) && !this.ackedGenerations.has(checkId)) {
                this._activateGeneration(checkId);
            }
            checkId++;
        }
    }

    _activateGeneration(genId) {
        const start = genId * this.blockSize;
        const end = Math.min(start + this.blockSize, this.data.length);
        const chunk = this.data.subarray(start, end);

        const blockConfig = {
            PIECE_COUNT: this.pieceCount,
            PIECE_SIZE: this.pieceSize,
            REDUNDANCY: this.netConfig.REDUNDANCY,
            SYSTEMATIC: this.transcodeConfig.SYSTEMATIC
        };

        this.pool.addJob(genId, chunk, blockConfig);
        this.window.add(genId);
    }

    _checkWatchdog() {
        if (this.watchdogTimer) return;
        if (this.isFinished()) return;

        this.watchdogTimer = setTimeout(() => {
            this.emit('watchdog_slide', this.currentGenId);
            this.pool.boost(this.currentGenId, 4); 
            this.watchdogTimer = null; 
        }, this.windowConfig.TIMEOUT);
    }

    _resetWatchdog() {
        if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
        }
    }
}
module.exports = GenerationEncoder;

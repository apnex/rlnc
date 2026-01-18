const EventEmitter = require('events');

/**
 * DECOUPLED SLIDING WINDOW CONTROLLER (CON-004)
 * Manages Generation IDs, Ranks, and Solvability.
 */
class SlidingWindow extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.pieceCount = config.TRANSCODE.PIECE_COUNT;
        this.windowSize = config.WINDOW.SIZE;
        
        this.activeGens = new Set();
        this.solvedGens = new Set();
        this.ackedGens = new Set();
        
        this.totalGens = 0;
        this.head = 0; // Next generation to add to window
    }

    setTotalGenerations(total) {
        this.totalGens = total;
        this._slide();
    }

    _slide() {
        while (this.activeGens.size < this.windowSize && this.head < this.totalGens) {
            this.activeGens.add(this.head++);
        }
        this.emit('slide', Array.from(this.activeGens));
    }

    acknowledge(genId) {
        if (this.activeGens.has(genId)) {
            this.activeGens.delete(genId);
            this.ackedGens.add(genId);
            this._slide();
            return true;
        }
        return false;
    }

    markSolved(genId) {
        this.solvedGens.add(genId);
    }

    isFinished() {
        return this.ackedGens.size === this.totalGens;
    }

    get window() {
        return this.activeGens;
    }
}

module.exports = SlidingWindow;

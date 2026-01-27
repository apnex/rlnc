const { TuiWidget } = require('../framework/widget');
const { TuiCell } = require('../framework/cell');

/**
 * Rank Integrity Blade: Visualizes subspace dimensionality (R) vs Piece Count (P).
 */
class RankIntegrityBlade extends TuiWidget {
    constructor(options = {}) {
        super({ id: 'rank-integrity', ...options });
        this.history = new Array(40).fill(0);
        this.rank = 0;
        this.pieces = 0;
        this.target = 0;
    }

    update(fabricState) {
        const slot = fabricState.slots[0];
        if (!slot || slot.status === 'DORMANT') return;

        this.rank = slot.rank || 0;
        this.pieces = slot.pieceCount; 
        this.target = slot.pieceCount;
        
        this.markDirty();
    }

    render() {
        const barWidth = 40;
        const pct = (this.target > 0) ? this.rank / this.target : 0;
        const filled = Math.floor(pct * barWidth);
        const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
        
        const rankStr = `RANK: ${String(this.rank).padStart(3)}/${String(this.target).padStart(3)}`;
        return [` ${rankStr} [${bar}] ${Math.floor(pct * 100).toString().padStart(3)}%`];
    }
}

module.exports = RankIntegrityBlade;

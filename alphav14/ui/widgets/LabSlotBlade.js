const { TuiWidget } = require('../framework/widget');
const { TuiCell } = require('../framework/cell');

/**
 * LabSlotBlade: A sovereign row representing one phase of the laboratory.
 * @pillar Pillar 4: Symmetric Perception
 */
class LabSlotBlade extends TuiWidget {
    constructor(slotIndex, options = {}) {
        super({ id: `lab-slot-${slotIndex}`, ...options });
        this.slotIndex = slotIndex;
        this.phaseNames = ["N/A", "SYS-PASS", "CODED-STRESS", "LINEAR-DEP", "BIT-FIDELITY"];
        this.data = { status: 'DORMANT' };
    }

    update(slotData) {
        this.data = slotData;
        this.markDirty();
    }

    render() {
        const slotData = this.data;
        if (!slotData || slotData.status === 'DORMANT' || !slotData.sessionId || slotData.sessionId === '0x0') return [""];

        const { phaseId, rank, pieceCount, bytes, startTime, endTime, verifyState, status } = slotData;
        const name = this.phaseNames[phaseId] || "UNKNOWN";
        
        // 1. Phase Status Icon
        const isDone = status === 'IDLE' || status === 'DONE';
        const icon = (verifyState === 'MATCH' && isDone) ? '\x1B[32m✔\x1B[0m' : 
                     (verifyState === 'FAIL') ? '\x1B[31m✘\x1B[0m' : 
                     (status === 'RUNNING') ? '\x1B[34m▶\x1B[0m' : '\x1B[90m○\x1B[0m';

        // 2. Rank Bar
        const barWidth = 30;
        // Safety: Prevent !!! if pieceCount or rank is undefined
        const safeRank = rank || 0;
        const safeN = pieceCount || 128;
        const pct = safeRank / safeN;
        const filled = Math.min(barWidth, Math.max(0, Math.floor(pct * barWidth)));
        const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
        const rankStr = `${String(safeRank).padStart(3)}/${String(safeN).padStart(3)}`;

        // 3. Velocity Cell
        // Logic: Use performance.now() only if running, otherwise use physical end time
        const bootTime = this.pcb ? this._getBoot() : 0;
        const nowMicros = (performance.now() - bootTime) * 1000;
        const currentTime = (status === 'RUNNING') ? nowMicros : endTime;
        const elapsed = (currentTime > startTime) ? (currentTime - startTime) / 1000000 : 0;
        
        // Safety: bytes is U64 reassembled in Scraper
        const bps = (elapsed > 0) ? (bytes / elapsed) : 0;
        const velCell = TuiCell.render(bps, 'DNA_BYTERATE');

        return [` [SLOT ${String(this.slotIndex).padStart(2, '0')}] ${icon} ${name.padEnd(12)} | [${bar}] ${rankStr} | ${velCell}`];
    }

    _getBoot() {
        if (!this.pcb) return 0;
        const lo = this.pcb.getPortRegister(16) >>> 0; // P0_BOOT_LO
        const hi = this.pcb.getPortRegister(20) >>> 0; // P0_BOOT_HI
        return Number((BigInt(hi) << 32n) | BigInt(lo));
    }
}

module.exports = LabSlotBlade;

/**
 * Aether Blade: High-Density Slot Widget
 * @warden-purpose Render sovereign session state in a single-line primitive.
 * @warden-scope TUI / VIL
 */
const { TuiWidget } = require("../framework/widget");
const { TuiHorizontalLayout } = require("../framework/layout");
const { TuiCell } = require("../framework/cell");
const utils = require("../framework/utils");

class AetherBlade extends TuiWidget {
  constructor(slotIndex, options = {}) {
    super({ id: `blade-${slotIndex}`, ...options });
    this.slotIndex = slotIndex;
    this.data = { status: 'DORMANT' };
  }

  update(data) {
    this.data = data;
    this.markDirty();
  }

  render() {
    const width = this.getWidth() || 100;
    const { status, sessionId, solved, total, intensity, verifyState, bytes, startTime, endTime } = this.data;

    // 1. Identity (Slot + Session)
    const slotId = `[SLOT ${String(this.slotIndex).padStart(2, '0')}]`;
    const sessId = status === 'DORMANT' ? '----' : sessionId.replace('0x', '');
    const identity = `${slotId} ID:${sessId.padEnd(4)}`;

    // 2. Velocity (Atomic Cell)
    const bootTime = this.pcb ? this._getBoot() : 0;
    const nowMicros = (performance.now() - bootTime) * 1000;
    const currentTime = (status === 'RUNNING') ? nowMicros : endTime;
    const elapsed = (currentTime > startTime) ? (currentTime - startTime) / 1000000 : 0;
    const mbps = (elapsed > 0) ? (bytes / elapsed) : 0; // Bytes/sec for DNA_BYTERATE
    const velocityCell = TuiCell.render(mbps, 'DNA_BYTERATE');
    const velocity = `${velocityCell}`;

    // 3. Progress Bar (Unicode Block)
    const barWidth = 30;
    const pct = (total > 0) ? solved / total : 0;
    const filled = Math.min(barWidth, Math.max(0, Math.floor(pct * barWidth)));
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    
    // Progress Cell
    const pctCell = TuiCell.render(pct, 'DNA_PCT');
    const progress = `[${bar}] ${pctCell}`;

    // 4. Intensity Pulse (UBI Normalized)
    const intensityPct = Math.floor((intensity || 0) * 100);
    let intensityColor = '\x1B[32m'; // Green
    if (intensityPct > 50) intensityColor = '\x1B[33m'; // Yellow
    if (intensityPct > 90) intensityColor = '\x1B[31m'; // Red
    const intensityPulse = `${intensityColor}(●) ${intensityPct.toString().padStart(3)}%\x1B[0m`;

    // 5. Status & Verify
    const vStates = { 'PENDING': '...', 'HASHING': 'HASH', 'MATCH': 'PASS', 'FAIL': 'FAIL' };
    const vColor = verifyState === 'MATCH' ? '\x1B[32m' : (verifyState === 'FAIL' ? '\x1B[31m' : '');
    const statusBlock = `${status.padEnd(8)} | V:${vColor}${vStates[verifyState] || '...'}\x1B[0m`;

    const line = `${identity} ${progress} | ${velocity} | INT: ${intensityPulse} | ${statusBlock}`;
    
    // Absolute Visibility Law: Dormant slots consume zero vertical space.
    if (status === 'DORMANT') {
        return [];
    }

    return [line];
  }

  _getBoot() {
    if (!this.pcb) return 0;
    const lo = this.pcb.getPortRegister(16) >>> 0; // P0_BOOT_LO
    const hi = this.pcb.getPortRegister(20) >>> 0; // P0_BOOT_HI
    return Number((BigInt(hi) << 32n) | BigInt(lo));
  }
}

module.exports = AetherBlade;

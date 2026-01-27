const { TuiWidget } = require('./framework/widget');
const { TuiCell } = require('./framework/cell');

/**
 * Integrity Ribbon: High-Fidelity Performance Monitor
 * @version 2.2.0 - NUCLEAR-BURN
 * @warden-purpose Visualize JOB vs FABRIC vs BURN velocity vectors.
 */
class IntegrityRibbon extends TuiWidget {
  constructor(options = {}) {
    super({ id: 'integrity-ribbon', ...options });
    this.data = {
      instant: 0,
      jobAvg: 0,
      fabricAvg: 0,
      burnRate: 0,
      load: 0
    };
    this.startTime = Date.now();
    this.lastTime = Date.now();
    this.markBytes = 0;
    this.markFabricMicros = 0;
  }

  update(fabricState = {}) {
    const meta = fabricState.metadata || {};
    const slots = fabricState.slots || [];

    // 1. Calculate Aggregate Bytes/sec (JOB Vector)
    const currentBytes = meta.totalBytes || 0;
    const now = Date.now();
    const deltaSec = Math.max(0.001, (now - this.lastTime) / 1000);
    const totalSec = Math.max(0.001, (now - this.startTime) / 1000);
    const deltaBytes = currentBytes - this.markBytes;

    this.data.instant = deltaBytes / deltaSec;
    this.data.jobAvg = currentBytes / totalSec;

    // 2. Aggregate Load and Fabric Velocity (PHYSICS Vector)
    let totalLoad = 0;
    let activeSlots = 0;
    let totalFabricMicros = 0;
    let pieceCount = 128; // Default

    slots.forEach(s => {
        if (s.status !== 'DORMANT' && s.sessionId !== '0x0') {
            totalLoad += (s.intensity || 0) * 100;
            activeSlots++;
            totalFabricMicros += (s.fabricMicros || 0);
            pieceCount = s.pieceCount || 128;
        }
    });

    // 3. Instantaneous Fabric & Burn Velocity
    const deltaMicros = totalFabricMicros - this.markFabricMicros;
    if (deltaMicros > 0) {
        this.data.fabricAvg = (deltaBytes / (deltaMicros / 1000000));
        // BURN RATE = Fabric Payload Rate * Piece Count (N)
        // This is the physical burn throughput of the kernel
        this.data.burnRate = this.data.fabricAvg * pieceCount;
    } else if (deltaBytes > 0) {
        this.data.fabricAvg = this.data.instant;
        this.data.burnRate = this.data.fabricAvg * pieceCount;
    }

    this.data.load = activeSlots > 0 ? Math.floor(totalLoad / activeSlots) : 0;
    
    this.lastTime = now;
    this.markBytes = currentBytes;
    this.markFabricMicros = totalFabricMicros;
    
    this.markDirty();
  }

  render() {
    const instCell = TuiCell.render(this.data.instant, 'DNA_BYTERATE');
    const jobCell = TuiCell.render(this.data.jobAvg, 'DNA_BYTERATE');
    const fabCell = TuiCell.render(this.data.fabricAvg, 'DNA_BYTERATE');
    const burnCell = TuiCell.render(this.data.burnRate, 'DNA_BYTERATE');
    const loadCell = TuiCell.render(this.data.load / 100, 'DNA_PCT');

    return [` >> GOODPUT: | ${instCell} [INST] | ${jobCell} [JOB] | ${fabCell} [FABRIC] | ${burnCell} [BURN] | LOAD: ${loadCell}`];
  }
}

module.exports = IntegrityRibbon;

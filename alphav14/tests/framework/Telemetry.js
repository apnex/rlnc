/**
 * UTA Telemetry Accumulator
 * @warden-purpose High-resolution performance tracking.
 * @warden-scope Testing Framework
 */
class Telemetry {
  constructor() {
    this.startTime = process.hrtime.bigint();
    this.events = [];
    this.totalBytes = 0;
    this.totalDurationNs = 0n;
  }

  /**
   * Record a data point
   * @param {number} bytes - Bytes processed in this event
   * @param {bigint} [duration_ns] - Optional actual work duration
   */
  record(bytes, duration_ns) {
    const ts = process.hrtime.bigint();
    this.events.push({ ts, bytes, duration_ns });
    this.totalBytes += bytes;
    if (duration_ns !== undefined) {
      this.totalDurationNs += duration_ns;
    }
  }

  /**
   * Calculate Goodput (MB/s)
   */
  getGoodput() {
    const now = process.hrtime.bigint();
    const wallElapsedSec = Number(now - this.startTime) / 1_000_000_000;
    
    if (wallElapsedSec === 0) return 0;

    // 1. Instant: Last 1 second of events
    const oneSecAgo = now - 1_000_000_000n;
    const recentEvents = this.events.filter(e => e.ts > oneSecAgo);
    const instantBytes = recentEvents.reduce((sum, e) => sum + e.bytes, 0);
    
    // Use actual duration if available for instant
    const instantDurationNs = recentEvents.reduce((sum, e) => sum + (e.duration_ns || 0n), 0n);
    const instantSec = (instantDurationNs > 0n) ? Number(instantDurationNs) / 1_000_000_000 : 1.0;

    // 2. Average: Use total work duration if available, else wall clock
    const avgSec = (this.totalDurationNs > 0n) ? Number(this.totalDurationNs) / 1_000_000_000 : wallElapsedSec;

    return {
      instant: (instantBytes / (1024 * 1024) / (instantSec || 1)).toFixed(2),
      average: (this.totalBytes / (1024 * 1024) / avgSec).toFixed(2)
    };
  }

  reset() {
    this.startTime = process.hrtime.bigint();
    this.events = [];
    this.totalBytes = 0;
  }
}

module.exports = Telemetry;

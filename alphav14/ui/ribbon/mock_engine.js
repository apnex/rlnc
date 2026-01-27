/**
 * Mock Transfer Engine
 * Simulates the getStats() API of a real RLNC Engine.
 */
class MockTransferEngine {
  constructor(options = {}) {
    this.id = options.id || "Gen 000";
    this.total = options.total || 100.0;
    this.unit = options.unit || "MB";
    this.transferred = 0;
    this.velocity = 0;
    this.loss = 0;
    this.status = 'IDLE';
    this.startTime = null;
  }

  start() {
    this.status = 'ACTIVE';
    this.startTime = Date.now();
  }

  stop() {
    this.status = 'IDLE';
    this.velocity = 0;
  }

  /**
   * Simulates a step in the transfer process.
   */
  tick(deltaBytes = 1.0, lossRate = 0.0) {
    if (this.status !== 'ACTIVE') return;

    this.transferred = Math.min(this.total, this.transferred + deltaBytes);
    this.velocity = deltaBytes * 10; // Simple velocity simulation (e.g., bytes per tick)
    this.loss = lossRate;

    if (this.transferred >= this.total) {
      this.status = 'COMPLETE';
      this.velocity = 0;
    }
  }

  /**
   * The Stable API expected by RibbonInstance.
   */
  getStats() {
    return {
      id: this.id,
      transferred: this.transferred,
      total: this.total,
      unit: this.unit,
      velocity: this.velocity,
      velocityUnit: this.unit + "/s",
      loss: this.loss,
      status: this.status
    };
  }
}

module.exports = MockTransferEngine;

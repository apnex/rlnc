/**
 * SessionStats Aggregator
 * Pulls operational snapshots from RLNC core components.
 */
class SessionStats {
  constructor(options = {}) {
    this.mode = options.mode || 'unified';
    this.encoder = options.encoder || null;
    this.decoder = options.decoder || null;
    this.window = options.window || null;
    this.transport = options.transport || null;
    this.config = options.config || {};
    this.meta = options.meta || { filename: 'N/A', hash: 'N/A' };
    
    this.lastTime = Date.now();
    this.history = new Map(); // id -> currentVal
  }

  getSnapshot() {
    const now = Date.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    let generations = [];
    
    // 1. Collect Generation Stats
    if (this.encoder) {
      const stats = this.encoder.getStats();
      stats.forEach(g => {
        const velocityKey = `${g.id}-src`;
        const velocity = this._calculateVelocity(velocityKey, g.transferred, deltaTime);
        generations.push({ ...g, mode: 'source', velocity });
      });
    }
    
    if (this.decoder) {
      const stats = this.decoder.getStats();
      stats.forEach(g => {
        const velocityKey = `${g.id}-snk`;
        const velocity = this._calculateVelocity(velocityKey, g.transferred, deltaTime);
        generations.push({ ...g, mode: 'sink', velocity });
      });
    }

    // 2. Sort by numeric ID
    generations.sort((a, b) => a.id - b.id);

    // 3. Robust Completion & Window Tracking
    let solvedCount = 0;
    let totalGens = 0;
    let isGlobalComplete = false;

    if (this.window) {
        const winStats = this.window.getStats();
        const activeIds = winStats.active;
        
        // We use the window's total but we can also use decoder's if available
        totalGens = winStats.total;
        
        // A transfer is globally complete only when solved == total 
        // AND the window has acked everything (active is empty)
        solvedCount = this.decoder ? this.decoder.completed.size : winStats.solved;
        isGlobalComplete = (solvedCount >= totalGens && activeIds.length === 0 && totalGens > 0);

        if (!isGlobalComplete) {
            const activeIds = winStats.active;

            // Strict Pipeline Filtering: Only show what is ACTIVE in the window
            const srcGens = generations.filter(g => g.mode === 'source');
            const filteredSrc = srcGens.filter(g => activeIds.includes(g.id));

            const snkGens = generations.filter(g => g.mode === 'sink');
            const filteredSnk = snkGens.filter(g => activeIds.includes(g.id));

            generations = [...filteredSrc, ...filteredSnk];
        } else {
            // When globally complete, all ribbons are retired
            generations = [];
        }
    }

    // 4. Metric Polishing
    generations.forEach(g => {
        if (g.status === 'COMPLETE') {
            g.transferred = g.total;
            g.velocity = 0;
        }
    });

    // 5. Global Metrics
    const transportStats = this.transport ? this.transport.getStats() : { txSent: 0, txDropped: 0 };
    const loss = transportStats.txSent > 0 ? (transportStats.txDropped / transportStats.txSent) * 100 : 0;

    return {
      config: this.config,
      meta: this.meta,
      generations,
      metrics: {
        solved: solvedCount,
        totalGens,
        txMB: this.transport ? this.transport.getStats().txMB : 0,
        rxMB: this.transport ? this.transport.getStats().rxMB : 0,
        loss,
        sourceHash: this.meta.hash,
        finalHash: null
      }
    };
  }

  _calculateVelocity(id, currentVal, deltaTime) {
    const prev = this.history.get(id);
    this.history.set(id, currentVal);
    
    if (prev === undefined || deltaTime <= 0) return 0;
    return (currentVal - prev) / deltaTime;
  }
}

module.exports = SessionStats;

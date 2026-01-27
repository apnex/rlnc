const { TuiWidget } = require('../framework/widget');
const { TuiCell } = require('../framework/cell');

/**
 * Velocity Heatmap Blade: High-density kinetic velocity monitor.
 */
class VelocityHeatmapBlade extends TuiWidget {
    constructor(options = {}) {
        super({ id: 'velocity-heatmap', ...options });
        this.history = new Array(40).fill(0);
        this.maxVelocity = 6000; // 6GB/s
        this.currentMBps = 0;
    }

    update(fabricState) {
        const slot = fabricState.slots[0];
        if (!slot || slot.status === 'DORMANT') return;

        const bytes = slot.bytes;
        const startTime = slot.startTime;
        const endTime = slot.endTime || (performance.now() * 1000); // Approximate if not finished
        
        const elapsed = (endTime > startTime) ? (endTime - startTime) / 1000000 : 0;
        const bps = (elapsed > 0) ? (bytes / elapsed) : 0;

        this.currentBps = bps;
        this.history.push(bps / 1048576); // Keep history in MB/s for sparkline scale
        this.history.shift();
        this.markDirty();
    }

    render() {
        const blocks = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
        const sparkline = this.history.map(v => {
            const idx = Math.min(blocks.length - 1, Math.floor((v / this.maxVelocity) * blocks.length));
            let color = '\x1B[32m'; // Green
            if (v > 3000) color = '\x1B[33m'; // Yellow
            if (v > 5000) color = '\x1B[31m'; // Red
            return `${color}${blocks[idx]}\x1B[0m`;
        }).join('');

        const velCell = TuiCell.render(this.currentBps, 'DNA_BYTERATE');
        return [` VELOCITY: [${sparkline}] ${velCell}`];
    }
}

module.exports = VelocityHeatmapBlade;

/**
 * ALPHAv6 Visual Dashboard (Static Header / Sticky Footer)
 */
class VisualDashboard {
    constructor(config, sourceHash, dataName, dataSize) {
        this.config = config;
        this.sourceHash = sourceHash;
        this.dataName = dataName || "RandomBytes";
        this.dataSize = dataSize || 0;
        this.receivedHash = "Pending...";
        
        this.startTime = Date.now();
        this.generations = new Map();
        this.allIds = []; 
        this.headerPrinted = false;
        this.lastDynamicHeight = 0; 
        
        this.stats = { totalPackets: 0, boosts: 0, txBytes: 0, rxBytes: 0 };
        this.contentWidth = 70; 
    }

    initGen(genId, totalPieces) {
        if (this.generations.has(genId)) return;
        this.generations.set(genId, {
            id: genId,
            total: totalPieces,
            sent: 0, recv: 0,
            acked: false, boosted: false, boostCount: 0,
            logged: false 
        });
        this.allIds.push(genId);
        this.allIds.sort((a, b) => a - b);
    }

    updateGen(genId, changes) {
        const gen = this.generations.get(genId);
        if (gen) Object.assign(gen, changes);
    }

    addGlobalStat(key, value = 1) {
        if (this.stats[key] !== undefined) this.stats[key] += value;
    }

    registerTraffic(bytes, direction) {
        if (direction === 'tx') this.stats.txBytes += bytes;
        if (direction === 'rx') this.stats.rxBytes += bytes;
    }

    setFinalHash(hash) { this.receivedHash = hash; }

    render() {
        if (!this.headerPrinted) {
            console.log(this._generateHeaderString());
            this.headerPrinted = true;
        }

        const termWidth = process.stdout.columns || 80;

        if (this.lastDynamicHeight > 0) {
            process.stdout.write(`\x1B[${this.lastDynamicHeight}A`);
        }
        process.stdout.write(`\x1B[0J`);

        for (const id of this.allIds) {
            const gen = this.generations.get(id);
            if (gen.acked && !gen.logged) {
                const line = this._drawRow(gen);
                console.log(this._truncate(line, termWidth));
                gen.logged = true; 
            }
        }

        const frameLines = [];
        for (const id of this.allIds) {
            const gen = this.generations.get(id);
            if (!gen.logged) {
                const line = this._drawRow(gen);
                frameLines.push(this._truncate(line, termWidth));
            }
        }
        frameLines.push(...this._getFooterLines());

        if (frameLines.length > 0) {
            process.stdout.write(frameLines.join('\n') + '\n');
        }

        this.lastDynamicHeight = frameLines.length; 
    }

    _truncate(str, width) {
        if (!str) return "";
        return str.length > width ? str.substring(0, width - 1) : str;
    }

    _formatBytes(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
    }

    _generateHeaderString() {
        const c = this.config;
        const separator = "-".repeat(this.contentWidth);
        const name = this.config.DATA?.INPUT_PATH || this.dataName; 

        let lines = [
            `=== ALPHAv6 CONCURRENCY VISUALIZER ===`,
            ``,
            `CONFIG`,
            `  Transcode: ${c.TRANSCODE.PIECE_SIZE}B x ${c.TRANSCODE.PIECE_COUNT} (${c.TRANSCODE.SYSTEMATIC ? 'Systematic' : 'Coded'})`,
            `  Network:   Loss ${(c.NETWORK.LOSS_RATE * 100).toFixed(0)}% | Redundancy ${c.NETWORK.REDUNDANCY}x`,
            `  Window:    Size ${c.WINDOW.SIZE} | Timeout ${c.WINDOW.TIMEOUT}ms`,
            ``,
            `TARGET`,
            `  Generations: ${c.TOTAL_GENS || 'Calculating...'}`,
            ``,
            `SOURCE`,
            `  Data: ${name}`,
            `  Size: ${this._formatBytes(this.dataSize)}`,
            `  Hash: \x1B[32m${this.sourceHash}\x1B[0m`,
            separator
        ];
        return lines.join('\n');
    }

    _getFooterLines() {
        let solved = 0;
        for (const gen of this.generations.values()) {
            if (gen.acked) solved++;
        }
        const total = this.config.TOTAL_GENS;
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        const efficiency = ((solved * this.config.TRANSCODE.PIECE_COUNT) / (this.stats.totalPackets || 1) * 100).toFixed(1);
        
        const tx = this._formatBytes(this.stats.txBytes);
        const rx = this._formatBytes(this.stats.rxBytes);
        const separator = "-".repeat(this.contentWidth);

        let lines = [
            separator,
            `STATUS`,
            `  Progress:   ${solved}/${total} Solved`,
            `  Time:       ${elapsed}s`,
            `  Efficiency: ${efficiency}%`,
            `  Boosts:     ${this.stats.boosts}`,
            `  Traffic:    Tx: ${tx} | Rx: ${rx}`,
            ``,
            `RECV`
        ];
        
        let hashColor = "\x1B[33m"; 
        if (this.receivedHash !== "Pending...") {
            hashColor = (this.receivedHash === this.sourceHash) ? "\x1B[32m" : "\x1B[31m";
        }
        lines.push(`  Hash: ${hashColor}${this.receivedHash}\x1B[0m`);
        return lines;
    }

    _drawRow(gen) {
        const width = 15;
        const pct = gen.acked ? 100 : Math.min(99, Math.floor((gen.recv / gen.total) * 100));
        const filled = Math.floor((pct / 100) * width);
        const bar = "█".repeat(filled) + ".".repeat(width - filled);
        
        let statusIcon = "🔄";
        let color = "\x1B[36m"; 

        if (gen.acked) { statusIcon = "✅"; color = "\x1B[32m"; }
        else if (gen.boosted) { statusIcon = "⚠️ "; color = "\x1B[33m"; }
        else if (gen.recv > 0) { statusIcon = "⚡"; }

        const reset = "\x1B[0m";
        const idStr = `Gen ${String(gen.id).padStart(2, '0')}`;
        return `${color}[${idStr}] [${bar}] ${String(pct).padStart(3)}% | Sent: ${String(gen.sent).padEnd(3)} | Recv: ${String(gen.recv).padEnd(3)} | Bsts: ${String(gen.boostCount).padEnd(3)} | ${statusIcon}${reset}`;
    }
}
module.exports = VisualDashboard;

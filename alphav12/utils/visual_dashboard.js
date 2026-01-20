/**
 * MODULAR TUI DASHBOARD (CON-016) - ROBUST ASCII EDITION
 * @warden-purpose Assembles decoupled UI widgets into a strategic dashboard with perfect alignment.
 * @warden-scope Utilities
 */

function stripAnsi(str) {
    return str.replace(/\x1B\[[0-9;]*[mGJK]/g, "");
}

/**
 * Standard width calculation for ASCII-safe strings.
 */
function visualWidth(str) {
    return stripAnsi(str).length;
}

function padBox(content, width) {
    const vWidth = visualWidth(content);
    const spaceCount = width - vWidth - 4;
    const space = " ".repeat(Math.max(0, spaceCount));
    return "| " + content + space + " |";
}

class HeaderWidget {
    constructor(config, sourceHash, dataName, dataSize, mode, width) {
        this.config = config;
        this.sourceHash = sourceHash;
        this.dataName = dataName;
        this.dataSize = dataSize;
        this.mode = mode;
        this.width = width;
    }

    render() {
        const c = this.config;
        const top = "+" + "-".repeat(this.width - 2) + "+";
        const title = this.mode.toUpperCase() + " NODE | RLNC DECOUPLED FRAMEWORK (v12)";
        const conf = `CONFIG  | Transcode: ${String(c.TRANSCODE.PIECE_SIZE).padEnd(4)}B x ${String(c.TRANSCODE.PIECE_COUNT).padEnd(2)} | Window: ${String(c.WINDOW.SIZE).padEnd(2)}`;
        const source = `SOURCE  | Data: ${String(this.dataName).padEnd(15)}`;

        return [
            top,
            padBox(`\x1B[1m${title}\x1B[0m`, this.width),
            top,
            padBox(conf, this.width),
            padBox(source, this.width),
            top
        ].join('\n');
    }
}

class RibbonWidget {
    constructor(gen, mode) {
        this.gen = gen;
        this.mode = mode;
    }

    render() {
        const g = this.gen;
        const width = 20;
        const rank = g.rank || 0;
        const pct = g.acked ? 100 : Math.floor((rank / g.total) * 100);

        let barColor = "\x1B[32m";
        let statusIcon = "[R]"; // Receiving

        if (g.stalled) {
            barColor = "\x1B[31m"; 
            statusIcon = "[S]"; // Stalled
        } else if (g.acked) {
            statusIcon = "[OK]";
        }

        const filled = Math.floor((pct / 100) * width);
        const bar = barColor + "#".repeat(filled) + "\x1B[90m" + ".".repeat(width - filled) + "\x1B[0m";

        const idStr = `Gen ${String(g.id).padStart(3, '0')}`;
        const pctStr = String(pct).padStart(3) + "%" ;

        const rateVal = Math.min(999.9, Math.abs(g.rate || 0)).toFixed(1).padStart(5);
        const rateStr = `${rateVal}M`;

        const lossStr = `L: ${(g.loss || 0).toFixed(1).padStart(4)}%`;
        const sentStr = `Sent: ${String(g.sent || 0).padStart(4)}`;

        if (this.mode === 'source') {
            return `[${idStr}] <${bar}> ${pctStr} | ${sentStr} | ${statusIcon.padEnd(4)}`;
        } else {
            return `[${idStr}] <${bar}> ${pctStr} | ${rateStr} | ${lossStr} | ${statusIcon.padEnd(4)}`;
        }
    }
}

class FooterWidget {
    constructor(stats, receivedHash, isMatch, mode, width) {
        this.stats = stats;
        this.receivedHash = receivedHash;
        this.isMatch = isMatch;
        this.mode = mode;
        this.width = width;
    }

    render() {
        const s = this.stats;
        const elapsed = ((Date.now() - s.startTime) / 1000).toFixed(1);
        const rx = (s.rxBytes / (1024 * 1024)).toFixed(2).padStart(5);
        const tx = (s.txBytes / (1024 * 1024)).toFixed(2).padStart(5);
        const sep = "+" + "-".repeat(this.width - 2) + "+";

        const status = `STATUS  | Progress: ${String(s.solved).padStart(2)}/${String(s.total || 0).padEnd(2)} | Time: ${elapsed.padStart(5)}s | Boosts: ${s.boosts || 0}`;
        const traffic = this.mode === 'source' ? `TRAFFIC | Tx: ${tx} MB` : `TRAFFIC | Rx: ${rx} MB`;

        let hashColor = "\x1B[33m"; // Pending (Yellow)
        if (this.receivedHash !== "Pending...") {
            if (this.mode === 'source') {
                hashColor = "\x1B[32m"; // Source is definitive (Green)
            } else {
                // Sink mode: Match if sourceHash available, else Green for success
                if (this.sourceHash !== "Pending...") {
                    hashColor = this.isMatch ? "\x1B[32m" : "\x1B[31m";
                } else {
                    hashColor = "\x1B[32m"; // Successful reconstruction (Green)
                }
            }
        }
        const hashLine = `HASH    | ${hashColor}${this.receivedHash}\x1B[0m`;

        return [
            sep,
            padBox(status, this.width),
            padBox(traffic, this.width),
            sep,
            padBox(hashLine, this.width),
            sep
        ].join('\n');
    }
}

class VisualDashboard {
    constructor(config, sourceHash, dataName, dataSize, mode = 'unified') {
        this.config = config;
        this.sourceHash = sourceHash;
        this.dataName = dataName;
        this.dataSize = dataSize;
        this.mode = mode;
        this.receivedHash = (mode === 'source') ? sourceHash : "Pending...";
        this.startTime = Date.now();
        this.generations = new Map();
        this.allIds = [];
        this.lastFrameHeight = 0;
        this.stats = { boosts: 0, txBytes: 0, rxBytes: 0, solved: 0 };
        this.width = 80;
    }

    initGen(genId, totalPieces) {
        if (this.generations.has(genId)) return;
        this.generations.set(genId, {
            id: genId, total: totalPieces,
            sent: 0, recv: 0, rank: 0, rate: 0, loss: 0,
            acked: false, stalled: false, logged: false
        });
        this.allIds.push(genId);
        this.allIds.sort((a, b) => a - b);
    }

    updateGen(genId, changes) {
        const gen = this.generations.get(genId);
        if (gen) {
            const alreadyAcked = gen.acked;
            Object.assign(gen, changes);
            if (changes.acked && !alreadyAcked) {
                this.stats.solved++;
            }
        }
    }

    registerTraffic(bytes, direction) {
        if (direction === 'tx') this.stats.txBytes += bytes;
        if (direction === 'rx') this.stats.rxBytes += bytes;
    }

    addGlobalStat(key, value) {
        if (this.stats[key] !== undefined) {
            this.stats[key] += value;
        } else {
            this.stats[key] = value;
        }
    }

    setFinalHash(hash) { this.receivedHash = hash; }

    render() {
        // 1. Atomic Clear: Remove the entire previous frame (Header + Ribbons + Footer)
        if (this.lastFrameHeight > 0) {
            process.stdout.write(`\x1B[${this.lastFrameHeight}A\x1B[0J`);
        }

        // 2. Build current frame: Static Header -> Active Ribbons (Fixed Height) -> Footer
        const frame = [];
        const header = new HeaderWidget(this.config, this.sourceHash, this.dataName, this.dataSize, this.mode, this.width);
        frame.push(header.render());

        const windowSize = (this.config.WINDOW && this.config.WINDOW.SIZE) || 4;
        let renderedCount = 0;

        // Render active (not yet acked) generations
        for (const id of this.allIds) {
            const gen = this.generations.get(id);
            if (!gen.acked) {
                const ribbon = new RibbonWidget(gen, this.mode);
                frame.push(padBox(ribbon.render(), this.width));
                renderedCount++;
                if (renderedCount >= windowSize) break;
            }
        }

        // Fill remaining slots with IDLE placeholders to maintain FIXED body height
        while (renderedCount < windowSize) {
            const slotId = renderedCount + 1;
            frame.push(padBox(`\x1B[90m[Slot ${String(slotId).padStart(2, '0')}] <....................>  IDLE\x1B[0m`, this.width));
            renderedCount++;
        }

        const footer = new FooterWidget(
            { ...this.stats, startTime: this.startTime, total: this.config.TOTAL_GENS },
            this.receivedHash,
            this.receivedHash === this.sourceHash,
            this.mode,
            this.width
        );
        frame.push(footer.render());

        // 3. Atomic Print
        const output = frame.join('\n');
        process.stdout.write(output + '\n');
        this.lastFrameHeight = output.split('\n').length;
    }
}

module.exports = VisualDashboard;

/**
 * TUI Framework: Atomic Cell Primitive
 * @warden-purpose Sovereign formatting engine for 7-char sizes and 9-char rates.
 * @pillar Pillar 5: Declarative Governance
 * @version 2.0.0 - DUAL MODE
 */
const utils = require('./utils');

const DNA_REGISTRY = {
    DNA_BYTERATE: { base: 1000, multi: 1, suffix: [" B/s", "KB/s", "MB/s", "GB/s", "TB/s"], width: 9 },
    DNA_BITRATE:  { base: 1000, multi: 8, suffix: [" b/s", "Kb/s", "Mb/s", "Gb/s", "Tb/s"], width: 9 },
    DNA_SIZE:     { base: 1024, multi: 1, suffix: [" B", "KB", "MB", "GB", "TB", "PB"], width: 7 },
    DNA_PCT:      { base: 1,    multi: 100, suffix: [" %"], width: 7 },
    DNA_TIME:     { base: 1,    multi: 1,   suffix: [" s"], width: 7 },
    DNA_RAW:      { base: 1,    multi: 1,   suffix: [""], width: 5 }
};

class TuiCell {
    /**
     * Renders a fixed-width data atom based on sealed DNA.
     * @param {number} val - The raw value.
     * @param {string} dnaKey - The DNA key from registry.
     */
    static render(val, dnaKey = 'DNA_SIZE') {
        const dna = DNA_REGISTRY[dnaKey];
        if (!dna) return "!!!!!";

        // 1. Handle Semantic States
        if (val === null || val === undefined) return "-".repeat(dna.width);
        if (isNaN(val)) return "!".repeat(dna.width);

        // 2. Initial Scaling
        let nVal = val * dna.multi;

        // 3. Find SI Magnitude
        let unitIdx = 0;
        if (dna.base > 1) {
            while (nVal >= dna.base && unitIdx < dna.suffix.length - 1) {
                nVal /= dna.base;
                unitIdx++;
            }
        }
        const suffix = dna.suffix[unitIdx] || dna.suffix[0];

        // 4. 3-Significant-Figure Algorithm
        let vStr = "";
        if (nVal === 0) {
            vStr = "  0.0";
        } else if (nVal >= 100) {
            vStr = Math.floor(nVal).toString().padStart(5);
        } else if (nVal >= 10) {
            vStr = nVal.toFixed(1).padStart(5);
        } else if (nVal >= 1) {
            vStr = nVal.toFixed(2).padStart(5);
        } else {
            vStr = nVal.toFixed(3).padStart(5);
        }

        // Final Truncation safety
        return vStr.substring(0, 5) + suffix;
    }
}

module.exports = { TuiCell, DNA_REGISTRY };

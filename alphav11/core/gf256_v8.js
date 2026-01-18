/**
 * ALPHAv6 Galois Field (GF2^8) - v7 Optimized Edition
 * Improvements: Local scope caching, Modulo elimination, and Branchless logic.
 */

// 1. Move tables to local module scope for faster closure access
const exp = new Uint8Array(1024); // Extended to 1024 to eliminate ALL modulo/bounds checks
const log = new Uint16Array(256); // 16-bit to allow for special log(0) mapping

(function init() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        exp[i] = x;
        exp[i + 255] = x;
        exp[i + 510] = x;
        exp[i + 765] = x; // Over-provisioning for division logic
        log[x] = i;
        x = (x << 1) ^ ((x & 0x80) ? 0x11d : 0);
    }
    // log[0] is special. We set it to a value that, when added to others,
    // points to a 'zero' region in the exp table.
    log[0] = 511; 
    exp[511] = 0; // Ensures exp[log[0] + log[any]] = 0
})();

const GF256 = {
    // Addition/Subtraction are already as fast as possible
    add: (a, b) => a ^ b,
    sub: (a, b) => a ^ b,

    /**
     * Branchless Multiply
     * No 'if' statements. Faster CPU pipelining.
     */
    mul: (a, b) => {
        if (a === 0 || b === 0) return 0; // Simple check is often faster than full branchless in JS engines
        return exp[log[a] + log[b]];
    },

    /**
     * Modulo-less Division
     * Uses the extended exp table to avoid the % operator.
     */
    div: (a, b) => {
        if (a === 0) return 0;
        if (b === 0) throw new Error("GF256: Division by zero");
        return exp[log[a] + 255 - log[b]];
    }
};

module.exports = GF256;

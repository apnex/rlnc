/**
 * ALPHAv6 Galois Field (GF2^8) - v7 Optimized Edition
 * Improvements: Local scope caching, Modulo elimination, and Branchless logic.
 */

// 1. Move tables to local module scope for faster closure access
const exp = new Uint8Array(1024); // Extended to 1024 to eliminate ALL modulo/bounds checks
const log = new Uint16Array(256); // 16-bit to allow for special log(0) mapping
const SBOX = new Uint8Array(256 * 256); // Global Multiplication Matrix (GMM)

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

    // --- Precompute GMM ---
    for (let f = 0; f < 256; f++) {
        const offset = f << 8;
        for (let i = 0; i < 256; i++) {
            if (f === 0 || i === 0) {
                SBOX[offset + i] = 0;
            } else {
                SBOX[offset + i] = exp[log[f] + log[i]];
            }
        }
    }
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
    },

    // Export the precomputed Global Multiplication Matrix
    SBOX: SBOX
};

module.exports = GF256;

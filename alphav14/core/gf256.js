/**
 * RLNC Math Nucleus
 * @warden-purpose High-performance Galois Field arithmetic (GF256).
 * @pillar Pillar 2: Sovereignty
 */
const exp = new Uint8Array(1024);
const log = new Uint16Array(256);
const SBOX = new Uint8Array(256 * 256);
const SBOX_VIEWS = new Array(256);

(function init() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        exp[i] = x;
        exp[i + 255] = x;
        exp[i + 510] = x;
        exp[i + 765] = x;
        log[x] = i;
        x = (x << 1) ^ ((x & 0x80) ? 0x11d : 0);
    }
    log[0] = 511; 
    exp[511] = 0;

    // --- Precompute Global Multiplication Matrix (GMM) ---
    for (let f = 0; f < 256; f++) {
        const offset = f << 8;
        for (let i = 0; i < 256; i++) {
            if (f === 0 || i === 0) {
                SBOX[offset + i] = 0;
            } else {
                SBOX[offset + i] = exp[log[f] + log[i]];
            }
        }
        // Anchor 2: Sovereign Sub-View Pre-Caching
        SBOX_VIEWS[f] = SBOX.subarray(offset, offset + 256);
    }
})();

const GF256 = {
    add: (a, b) => a ^ b,
    sub: (a, b) => a ^ b,

    mul: (a, b) => {
        if (a === 0 || b === 0) return 0;
        return exp[log[a] + log[b]];
    },

    div: (a, b) => {
        if (a === 0) return 0;
        if (b === 0) throw new Error("GF256: Division by zero");
        return exp[log[a] + 255 - log[b]];
    },

    SBOX: SBOX,
    SBOX_VIEWS: SBOX_VIEWS // Exported for Matrix Physics
};

module.exports = GF256;

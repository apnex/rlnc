/**
 * ALPHAv6 Galois Field (GF2^8) Implementation
 * Optimized for RLNC performance using Log/Exp lookup tables.
 * Primitive Polynomial: x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
 */
class GF256 {
    constructor() {
        this.exp = new Uint8Array(512);
        this.log = new Uint8Array(256);
        this._init();
    }

    _init() {
        let x = 1;
        for (let i = 0; i < 255; i++) {
            this.exp[i] = x;
            this.exp[i + 255] = x; // Duplicate for overflow handling
            this.log[x] = i;
            // Multiply by 2 (shift left). If overflow, XOR with primitive polynomial
            x = (x << 1) ^ ((x & 0x80) ? 0x11d : 0);
        }
        this.log[0] = 0; // Log(0) is technically undefined, setting to 0 for safety
    }

    add(a, b) {
        return a ^ b;
    }

    sub(a, b) {
        return a ^ b; // Subtraction is identical to addition in GF(2^8)
    }

    mul(a, b) {
        if (a === 0 || b === 0) return 0;
        return this.exp[this.log[a] + this.log[b]];
    }

    div(a, b) {
        if (a === 0) return 0;
        if (b === 0) throw new Error("GF256: Division by zero");
        // We use the duplicate part of the exp table to handle wrapping (mod 255) implicitly
        return this.exp[(this.log[a] + 255 - this.log[b]) % 255];
    }
}

// Export singleton instance for performance
module.exports = new GF256();

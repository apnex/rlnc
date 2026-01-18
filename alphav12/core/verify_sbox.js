const GF = require('./core/gf256');

let errors = 0;
for (let f = 0; f < 256; f++) {
    for (let i = 0; i < 256; i++) {
        const expected = GF.mul(f, i);
        const actual = GF.SBOX[(f << 8) | i];
        if (expected !== actual) {
            if (errors < 10) console.log(`Error at f=${f}, i=${i}: Expected ${expected}, Actual ${actual}`);
            errors++;
        }
    }
}

if (errors === 0) {
    console.log("SBOX validation PASSED: All 65,536 entries match GF.mul()");
} else {
    console.log(`SBOX validation FAILED: ${errors} errors detected.`);
}

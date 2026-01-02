const GF = require('../core/gf256');
const assert = require('assert');

console.log("Verifying Math...");
assert.strictEqual(GF.add(10, 20), 10 ^ 20);
assert.strictEqual(GF.mul(0, 50), 0);
assert.strictEqual(GF.mul(1, 50), 50);
console.log("[PASS] GF256 Math OK");

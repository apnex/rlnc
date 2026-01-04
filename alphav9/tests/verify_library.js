const lib = require('../index');
const assert = require('assert');

console.log("Verifying Library Index (Module Sampler)...");

const expected = [
    'Engine',
    'GenerationEncoder',
    'GenerationDecoder',
    'PacketSerializer',
    'Transport',
    'NetworkSimulator',
    'WorkerPool',
    'VisualDashboard'
];

for (const component of expected) {
    assert.ok(lib[component], `Missing component in index: ${component}`);
    console.log(`[PASS] Component Found: ${component}`);
}

console.log("\n[SUCCESS] Module Sampler is valid.");

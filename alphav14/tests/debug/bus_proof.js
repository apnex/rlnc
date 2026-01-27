const { Worker } = require('worker_threads');
const path = require('path');

const sab = new SharedArrayBuffer(256);
const registers = new Int32Array(sab);

console.log('[Hub] Initializing Register 1 with 0xABCD');
Atomics.store(registers, 1, 0xABCD);

console.log('[Hub] Spawning Worker...');
const worker = new Worker(path.resolve(__dirname, 'worker_proof.js'), {
  workerData: { sab }
});

setTimeout(() => {
  console.log('[Hub] Updating Register 1 to 0x1234 (Dynamic Update)');
  Atomics.store(registers, 1, 0x1234);
}, 1200);

worker.on('exit', () => console.log('[Hub] Worker exited. Test Complete.'));

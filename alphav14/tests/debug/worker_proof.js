const { workerData } = require('worker_threads');
const sab = workerData.sab;
const registers = new Int32Array(sab);

console.log('[Worker] Started. Checking Register 1...');

let iterations = 0;
const interval = setInterval(() => {
  const val = Atomics.load(registers, 1);
  console.log(`[Worker] Tick ${iterations}: Register 1 = 0x${val.toString(16).toUpperCase()}`);
  
  iterations++;
  if (iterations > 5) {
    clearInterval(interval);
    process.exit(0);
  }
}, 500);

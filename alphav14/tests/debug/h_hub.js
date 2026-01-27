const { Worker } = require('worker_threads');
const path = require('path');

const sab = new SharedArrayBuffer(256);
const registers = new Int32Array(sab);

const worker = new Worker(path.resolve(__dirname, 'h_worker.js'), {
  workerData: { sab }
});

async function runInduction(id, n, s) {
  console.log(`\n[Hub] >>> Pushing Config: N=${n}, S=${s}B`);
  Atomics.store(registers, 1, id);
  Atomics.store(registers, 2, n);
  Atomics.store(registers, 3, s);
  
  Atomics.store(registers, 20, 1); // START

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (Atomics.load(registers, 10) === id) {
        console.log(`[Hub] Worker Inducted successfully.`);
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

async function main() {
  await new Promise(r => setTimeout(r, 500));
  
  // Session 1: Lightweight
  await runInduction(0x7777, 64, 1024);
  await new Promise(r => setTimeout(r, 1000));
  
  // Reset
  Atomics.store(registers, 20, 2);
  await new Promise(r => setTimeout(r, 500));

  // Session 2: Titan
  await runInduction(0xBBBB, 1024, 16384);
  await new Promise(r => setTimeout(r, 1000));

  Atomics.store(registers, 20, 3); // STOP
}

main();

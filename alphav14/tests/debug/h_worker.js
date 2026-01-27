const { workerData } = require('worker_threads');
const registers = new Int32Array(workerData.sab);

console.log('[Worker] Config-Aware Engine Online.');

let alive = true;
while (alive) {
  const cmd = Atomics.load(registers, 20);

  if (cmd === 1) { // START
    const sid = Atomics.load(registers, 1);
    const n = Atomics.load(registers, 2);
    const s = Atomics.load(registers, 3);
    
    console.log(`[Worker] INDUCTING: ID=0x${sid.toString(16).toUpperCase()} | N=${n} | S=${s}B`);
    
    // Simulate matrix allocation
    console.log(`[Worker] Math Kernel initialized for ${n} x ${n+s} augmented matrix.`);
    
    Atomics.store(registers, 10, sid); // Feedback ID
    Atomics.store(registers, 20, 0);   // ACK
  } 
  
  else if (cmd === 2) { // RESET
    console.log('[Worker] Matrix cleared. Ready for next induction.');
    Atomics.store(registers, 10, 0); 
    Atomics.store(registers, 20, 0); 
  }

  else if (cmd === 3) { // STOP
    alive = false;
  }
}

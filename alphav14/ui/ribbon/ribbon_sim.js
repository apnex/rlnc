const RibbonStack = require('./stack');
const MockTransferEngine = require('./mock_engine');
const TuiFrame = require('../framework/frame');
const styles = require('../framework/styles');

styles.setGlobal('StyleA');

const stack = new RibbonStack({ capacity: 5, layout: 'StandardEngineer' });
const frame = new TuiFrame({ title: "RIBBON TUI SIMULATOR", width: 100 });
frame.setContent(stack);

const engines = [
  new MockTransferEngine({ id: "Gen 001", total: 100, unit: "MB" }),
  new MockTransferEngine({ id: "Gen 002", total: 50, unit: "MB" }),
  new MockTransferEngine({ id: "Gen 003", total: 200, unit: "MB" })
];

engines.forEach(e => e.start());

console.log("Starting Ribbon TUI Simulation...");
let ticks = 0;

const interval = setInterval(() => {
  ticks++;
  
  // Update engines
  engines.forEach((e, i) => {
    const delta = (i + 1) * 2.5;
    const loss = Math.random() * 0.5;
    e.tick(delta, loss);
  });

  // Sync stack
  stack.sync(engines.map(e => e.getStats()));

  // Render using frame
  process.stdout.write('\x1Bc'); // Clear screen
  frame.draw();
  console.log(`Tick: ${ticks} | Press Ctrl+C to stop.`);

  if (engines.every(e => e.status === 'COMPLETE' || e.status === 'IDLE')) {
    clearInterval(interval);
    setTimeout(() => {
      process.stdout.write('\x1Bc');
      frame.draw();
      console.log(`Tick: ${ticks} | Simulation Complete.`);
    }, 500);
  }
}, 200);

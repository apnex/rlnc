const fs = require("fs");
const path = require("path");
const { Worker } = require("worker_threads");
const crypto = require("crypto");
const AetherBackplane = require("../infra/aether/AetherBackplane");
const AetherAdapter = require("../infra/aether/AetherAdapter");
const RLNCDashboard = require("../ui/rlnc_dashboard");

async function run() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error("Usage: node tests/runner.js <manifest_path>");
    process.exit(1);
  }

  const absolutePath = path.resolve(manifestPath);
  let config;

  if (absolutePath.endsWith(".json")) {
    config = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } else {
    config = require(absolutePath);
  }

  const pcb = new AetherBackplane();
  const isJsonMode = process.argv.includes("--json");
  const dashboard = isJsonMode ? null : new RLNCDashboard({ pcb });
  const scraper = new (require("../ui/framework/FabricScraper"))(pcb);

  const numWorkers = 1; 
  const numSlots = config.orchestration?.session_count || 1;
  const baseSessionId = config.orchestration?.session_id || 0xABCD;
  const activeSlots = [];

  // --- 1. Authoritative Setup (Hub) ---
  for (let i = 0; i < numSlots; i++) {
    const sessionId = baseSessionId + i;
    const slot = pcb.registerSession(sessionId);
    activeSlots.push(slot);

    const driverMap = { "PHYSICS": 0, "MASS": 1, "CODEC": 2, "METABOLISM": 3, "ENGINE": 8, "TRANSPORT": 10, "ASSEMBLY": 11, "QUADRANT": 12, "FIDELITY": 14, "SCALE": 15 };
    const rawDriver = config.orchestration?.driver_type || "PHYSICS";
    const driverType = driverMap[rawDriver] ?? 0;

    const pieceCount = config.math?.n || 128;
    const pieceSize = config.math?.s || 1024;
    const dataSize = config.data?.size || 0;
    const totalGens = Math.ceil(dataSize / (pieceCount * pieceSize)) || 1;
    const systematic = config.math?.hasOwnProperty('systematic_flag') ? config.math.systematic_flag : true;

    pcb.setRegister(slot, pcb.REG_STATUS, 1); 
    pcb.setRegister(slot, pcb.REG_SESSION_ID, sessionId);
    pcb.setRegister(slot, pcb.REG_DRIVER_TYPE, driverType);
    pcb.setRegister(slot, pcb.REG_PIECE_COUNT, pieceCount);
    pcb.setRegister(slot, pcb.REG_PIECE_SIZE, pieceSize);
    pcb.SLICE_SIZE = pieceSize; // Synchronize ATU with manifest
    pcb.setRegister(slot, pcb.REG_TOTAL_GENS, totalGens);
    pcb.setRegister(slot, pcb.REG_SYSTEMATIC, systematic ? 1 : 0);
    
    // Assign Phase ID to Slot (1-indexed)
    pcb.setRegister(slot, pcb.REG_PHASE_ID, i + 1);
    pcb.setRegister(slot, pcb.REG_SIGNAL, 0); 
  }

  const meta = { filename: "DUMMY", filesize: 0, testId: config.orchestration?.layer_id || "L0" };

  // --- 2. Spawn Worker ---
  new Worker(
    path.resolve(__dirname, "../threading/coder_worker.js"),
    { workerData: { sab: pcb.sab, SESSION_ID: baseSessionId, SLOTS: activeSlots, MATH_CONFIG: config.math } },
  );

  const startTime = Date.now();
  let trueStartTime;

  // --- 3. High-Density TUI Loop ---
  const interval = setInterval(() => {
    const fabricState = scraper.scrape();
    if (!isJsonMode) dashboard.sync(null, { pcb }, config, meta);

    // Completion Logic: Check if ALL active slots are signaled DONE (3)
    const allDone = activeSlots.every(s => pcb.getRegister(s, pcb.REG_WORKER_SIG) === 3);
    
    if (allDone) {
      clearInterval(interval);
      activeSlots.forEach(s => pcb.setRegister(s, pcb.REG_STATUS, 0)); 

      setTimeout(() => {
        const finalState = scraper.scrape();
        if (isJsonMode) {
            console.log("###[FINAL_FABRIC_STATE_START]###");
            console.log(JSON.stringify(finalState, null, 2));
            console.log("###[FINAL_FABRIC_STATE_END]###");
        }
        process.exit(0);
      }, 100);
    }

    if (Date.now() - startTime > 300000) { // Increased for High-Density Stress Tests
        console.error(`###[TIMEOUT]### ${meta.testId} Execution exceeded 300s barrier.`);
        process.exit(1);
    }
  }, 100);

  // --- 4. Induction Trigger ---
  setTimeout(() => {
    trueStartTime = Date.now();
    // Signal only the first slot; the worker will ripple through the rest
    pcb.setRegister(activeSlots[0], pcb.REG_SIGNAL, 1);
  }, 500);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

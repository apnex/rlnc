/**
 * UTA Coder Engine (Sequential Slot Edition)
 * @version 2.1.0 - PROJECT UNITY
 */
const { workerData, threadId } = require("worker_threads");
const AetherBackplane = require("../infra/aether/AetherBackplane");
const AetherAdapter = require("../infra/aether/AetherAdapter");

const { sab, MATH_CONFIG } = workerData;
const pcb = new AetherBackplane(sab);

async function start() {
  console.log(`[WORKER] Single-Thread Sequential Execution Starting.`);

  // 0. Wait for Global Induction Barrier
  while (pcb.getPortRegister(0) !== 1) { 
      await new Promise(r => setTimeout(r, 10));
  }

  // 1. Iterate through all slots sequentially
  const maxSlots = pcb.MAX_SLOTS;
  
  for (let slot = 1; slot <= maxSlots; slot++) {
      const sessionId = pcb.getRegister(slot, pcb.REG_SESSION_ID);
      if (sessionId === 0) continue;

      // --- CAS-Latch Induction (The Atomic Dispatch Law) ---
      const latchIndex = (pcb.OFF_CAM / 4) + 8 + (slot - 1); 
      const prev = Atomics.compareExchange(pcb.registers, latchIndex, 0, threadId);
      
      if (prev !== 0 && prev !== threadId) {
          // Slot already taken by another worker (should not happen in single-threaded mode)
          continue;
      }

      console.log(`[WORKER] Thread ${threadId} latched Slot [${slot}] Session 0x${sessionId.toString(16).toUpperCase()}`);

      // 2. Wait for Start Signal on THIS slot
      // The Hub will signal Slot 1, and the worker will signal itself for subsequent slots
      pcb.waitSignal(slot, pcb.REG_SIGNAL, 1); 

      // 3. DNA Induction via Semantic Proxy
      const adapter = new AetherAdapter(pcb, slot, 0x02);
      const pieceCount = adapter.get('FLOW_PIECE_COUNT');
      const pieceSize = adapter.get('FLOW_PIECE_SIZE');
      const totalGens = adapter.get('FLOW_RANK_TARGET');
      const driverType = adapter.get('FLOW_DRIVER_TYPE');

      const driverLookup = { 
        0: "l0_physics", 
        1: "l1_mass", 
        2: "l2_codec_stress", 
        3: "l3_metabolism",
        8: "l8_network_physics",
        11: "l2_assembly",
        12: "l0_quadrant",
        14: "l6_fidelity",
        15: "l4_scale"
      };

      const DriverClass = require(`../tests/drivers/${driverLookup[driverType] || "l0_calibration"}`);

      const driver = new DriverClass({
        SLOT_INDEX: slot,
        math: { n: pieceCount, s: pieceSize, kernel: MATH_CONFIG?.kernel },
        data: { size: pieceCount * pieceSize * totalGens }
      }, adapter);

      console.log(`[WORKER] Executing Slot [${slot}] Phase [${adapter.get('PULSE_PHASE')}]`);
      await driver.init();
      await driver.start();

      // 4. Signal completion for THIS slot (Reg 33)
      adapter.set('PULSE_SIGNAL', 3); 
      adapter.commit();
      console.log(`[WORKER] Slot [${slot}] Completed.`);

      // 5. Atomic Link: Signal the NEXT slot in the sequence
      if (slot < maxSlots) {
          const nextSession = pcb.getRegister(slot + 1, pcb.REG_SESSION_ID);
          if (nextSession !== 0) {
              pcb.setRegister(slot + 1, pcb.REG_SIGNAL, 1);
          }
      }
  }

  console.log(`[WORKER] All sequential phases complete.`);
  process.exit(0);
}

start().catch((err) => {
  console.error(`[WORKER-CRASH] ${err.stack}`);
  process.exit(1);
});

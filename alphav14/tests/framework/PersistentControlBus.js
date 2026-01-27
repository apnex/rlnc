/**
 * Persistent Control Bus (PCB) Infrastructure
 * @warden-purpose Core Hardware Abstraction Layer (HAL) for RLNC Pipeline.
 * @warden-scope Infrastructure / IPC
 */
class PersistentControlBus {
  constructor(sab) {
    this.sab = sab || new SharedArrayBuffer(1024); // 1KB Register Map
    this.registers = new Int32Array(this.sab);

    // --- Topology Constraints ---
    this.SLOT_COUNT = 4;
    this.STRIDE = 32; // 32 registers (128 bytes) per slot

    // --- Segment Offsets (Local to Slot) ---
    this.SEG_A_CONTROL = 0; // 0-7    (Control: Driver Write / Worker Read)
    this.SEG_B_TELEMETRY = 8; // 8-15   (Telemetry: Worker Write / Driver Read)
    this.SEG_C_COMMAND = 16; // 16-23  (Command: Atomic Signals)

    // --- Register Mapping (Segment A: Control) ---
    this.REG_PIECE_COUNT = 0;
    this.REG_PIECE_SIZE = 1;
    this.REG_TOTAL_GENS = 2;
    this.REG_STATUS = 3;
    this.REG_SESSION_ID = 4;

    // --- Register Mapping (Segment B: Telemetry) ---
    this.REG_SOLVED_COUNT = 0;
    this.REG_BYTES_XFER = 1;
    this.REG_LOAD = 2;
    this.REG_VERIFY_CODE = 3;
    this.REG_DENSITY = 4; // Ops/Byte or E_Ratio

    // --- Register Mapping (Segment C: Command) ---
    this.REG_SIGNAL = 0;
  }

  // --- HAL Primitives (Explicit Slot Addressing) ---

  /**
   * Set a Control Register (Driver Duty)
   */
  setControl(slot, reg, value) {
    const offset = slot * this.STRIDE + this.SEG_A_CONTROL + reg;
    Atomics.store(this.registers, offset, value);
  }

  getControl(slot, reg) {
    const offset = slot * this.STRIDE + this.SEG_A_CONTROL + reg;
    return Atomics.load(this.registers, offset);
  }

  /**
   * Set a Telemetry Register (Worker/Driver Duty)
   */
  setTelemetry(slot, reg, value) {
    const offset = slot * this.STRIDE + this.SEG_B_TELEMETRY + reg;
    Atomics.store(this.registers, offset, value);
  }

  /**
   * Atomic Addition to Telemetry (Worker Duty)
   */
  atomicAddTelemetry(slot, reg, value) {
    const offset = slot * this.STRIDE + this.SEG_B_TELEMETRY + reg;
    Atomics.add(this.registers, offset, value);
  }

  getTelemetry(slot, reg) {
    const offset = slot * this.STRIDE + this.SEG_B_TELEMETRY + reg;
    return Atomics.load(this.registers, offset);
  }

  /**
   * Signal/Command Interface (Segment C)
   */
  setSignal(slot, value) {
    const offset = slot * this.STRIDE + this.SEG_C_COMMAND + this.REG_SIGNAL;
    Atomics.store(this.registers, offset, value);
    Atomics.notify(this.registers, offset);
  }

  getSignal(slot) {
    const offset = slot * this.STRIDE + this.SEG_C_COMMAND + this.REG_SIGNAL;
    return Atomics.load(this.registers, offset);
  }

  waitSignal(slot, expected, timeout = 100) {
    const offset = slot * this.STRIDE + this.SEG_C_COMMAND + this.REG_SIGNAL;
    while (Atomics.load(this.registers, offset) !== expected) {
      Atomics.wait(this.registers, offset, expected === 0 ? 1 : 0, timeout);
    }
  }

  // --- Topology Helpers ---

  clearSlotTelemetry(slot) {
    for (let i = 0; i < 8; i++) {
      this.setTelemetry(slot, i, 0);
    }
  }

  // --- High-Fidelity Snapshot (TUI/Observer Duty) ---

  getSnapshot(slot = 0) {
    const V_STATES = ["PENDING", "HASHING", "MATCH", "FAIL"];
    return {
      sessionID: this.getControl(slot, this.REG_SESSION_ID),
      pieceCount: this.getControl(slot, this.REG_PIECE_COUNT),
      pieceSize: this.getControl(slot, this.REG_PIECE_SIZE),
      solved: this.getTelemetry(slot, this.REG_SOLVED_COUNT),
      total: this.getControl(slot, this.REG_TOTAL_GENS),
      bytes: this.getTelemetry(slot, this.REG_BYTES_XFER),
      load: this.getTelemetry(slot, this.REG_LOAD),
      density: this.getTelemetry(slot, this.REG_DENSITY),
      verifyState:
        V_STATES[this.getTelemetry(slot, this.REG_VERIFY_CODE)] || "PENDING",
      status: this.getControl(slot, this.REG_STATUS) === 1 ? "RUNNING" : "IDLE",
    };
  }
}

module.exports = PersistentControlBus;

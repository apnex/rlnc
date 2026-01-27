/**
 * Aether Backplane: Software-Defined Backplane - CONVERGED EDITION
 * @warden-purpose Sovereign MMIO fabric including the Data Plane (Memory Pool).
 */
class AetherBackplane {
  constructor(sab) {
    this.MAGIC_HEADER_VAL = 0xae78;
    this.VERSION_VAL = 0x00020000;

    // --- Global Topology (Byte Offsets) ---
    this.OFF_MAGIC    = 0;
    this.OFF_VERSION  = 4;
    this.OFF_PORT_0   = 32; 
    this.OFF_CAM      = 128;    
    this.OFF_SLOTS    = 1024; 
    this.OFF_POOL_CTL = 3072;
    this.OFF_POOL_DAT = 4096; // Byte-aligned start for Contiguous Data Pool

    this.STRIDE_BYTES = 256; 
    this.MAX_SLOTS    = 8;

    // --- Memory Networking Topology (v7.1.0 Byte-Centric) ---
    this.MAX_PIECES   = 1024;     

    // --- Port 0 (Management) ---
    this.P0_STATUS    = 0;  this.P0_ERRV      = 4;
    this.P0_HB        = 8;  this.P0_SLTS      = 12;
    this.P0_BOOT_LO   = 16; this.P0_BOOT_HI   = 20;

    // --- Slot Map (Relative Byte Offsets) ---
    this.REG_PIECE_COUNT = 0;  this.REG_PIECE_SIZE  = 4;
    this.REG_TOTAL_GENS  = 8;  this.REG_STATUS      = 12;
    this.REG_SESSION_ID  = 16; this.REG_DRIVER_TYPE = 20;
    this.REG_SYSTEMATIC  = 24;

    this.REG_SOLVED_CNT  = 64; 
    this.REG_BYTES_LO    = 72; this.REG_BYTES_HI    = 76;
    this.REG_START_LO    = 80; this.REG_START_HI    = 84;
    this.REG_END_LO      = 88; this.REG_END_HI      = 92;
    this.REG_DENSITY     = 96;
    this.REG_PHASE_ID    = 100;
    this.REG_VERIFY_CODE = 104;
    this.REG_RANK        = 108;
    this.REG_FABRIC_LO   = 112; // High-resolution active physics timer
    this.REG_FABRIC_HI   = 116;
 
    // --- NSF Structural Mapping (Anchors) ---
    this.UID_NSF_TOPOLOGY     = 0x1001; // ANCHOR_STRIDE_ORTHO
    this.NSF_STRIDE_L0 = 16;
    this.NSF_STRIDE_L1 = 64;
    this.NSF_STRIDE_L2 = 256;
    this.UID_NSF_KERNEL_ID    = 0x1002; // ANCHOR_KERNEL_UNITY
    this.UID_NSF_KERNEL_BLAST = 0x1003; // ANCHOR_GATE_BLAST

    // --- NSF MMIO Registers ---
    this.REG_NSF_STREAMS_ACTIVE = 120;
    this.REG_NSF_THROUGHPUT_MB   = 124;
    this.REG_NSF_S_L_RATIO       = 136;

    this.REG_HUB_SIG     = 128; 
    this.REG_WORKER_SIG  = 132;
    this.REG_SIGNAL      = 128; // Alias for Hub Signal (Induction Barrier)

    this.sab = sab || new SharedArrayBuffer(160 * 1024 * 1024); // 160MB for 128MB Data Plane + Segments
    this.registers = new Int32Array(this.sab); 

    if (!sab) this._bootstrap();
  }

  _bootstrap() {
    this.view = new DataView(this.sab); 
    this.view.setUint32(this.OFF_MAGIC, this.MAGIC_HEADER_VAL, true);
    this.view.setUint32(this.OFF_VERSION, this.VERSION_VAL, true);
    this.setPortRegister(this.P0_SLTS, this.MAX_SLOTS);
    this.setPortRegister(this.P0_STATUS, 1);
    const now = BigInt(Math.floor(performance.now()));
    this.setPortRegister(this.P0_BOOT_LO, Number(now & 0xFFFFFFFFn));
    this.setPortRegister(this.P0_BOOT_HI, Number(now >> 32n));
  }

  setPortRegister(off, val) { Atomics.store(this.registers, (this.OFF_PORT_0 + off) / 4, val); }
  getPortRegister(off) { return Atomics.load(this.registers, (this.OFF_PORT_0 + off) / 4); }

  setRegister(slot, reg, value) {
    const idx = (this.OFF_SLOTS + ((slot - 1) * this.STRIDE_BYTES) + reg) / 4;
    Atomics.store(this.registers, idx, value);
    // Hardened Signaling: Notify waiters if this is a Command or Lifecycle register
    if (reg === this.REG_HUB_SIG || reg === this.REG_WORKER_SIG || reg === this.REG_STATUS) {
        Atomics.notify(this.registers, idx);
    }
  }

  getRegister(slot, off) {
    return Atomics.load(this.registers, (this.OFF_SLOTS + ((slot - 1) * this.STRIDE_BYTES) + off) / 4);
  }

  atomicAdd(slot, off, val) {
    Atomics.add(this.registers, (this.OFF_SLOTS + ((slot - 1) * this.STRIDE_BYTES) + off) / 4, val);
  }

  waitSignal(slot, regOff, expected, timeout = 1000) {
    const idx = (this.OFF_SLOTS + ((slot - 1) * this.STRIDE_BYTES) + regOff) / 4;
    while (true) {
        const val = Atomics.load(this.registers, idx);
        if (val === expected) break;
        // Wait only if current value is NOT expected
        const waitRes = Atomics.wait(this.registers, idx, val, timeout);
        if (waitRes === 'timed-out') {
            // Optional: log or handle timeout
        }
    }
  }

  registerSession(sessionId) {
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const idx = (this.OFF_CAM + (i * 4)) / 4;
      const prev = Atomics.compareExchange(this.registers, idx, 0, sessionId);
      if (prev === 0 || prev === sessionId) return i + 1;
    }
    throw new Error("Aether: Fabric Exhausted");
  }

  getSnapshot(slot) {
    const V_STATES = ["PENDING", "HASHING", "MATCH", "FAIL"];
    const read64 = (loOff, hiOff) => {
        const lo = this.getRegister(slot, loOff) >>> 0;
        const hi = this.getRegister(slot, hiOff) >>> 0;
        return Number((BigInt(hi) << 32n) | BigInt(lo));
    };
    return {
      slot,
      sessionId: "0x" + (this.getRegister(slot, this.REG_SESSION_ID) >>> 0).toString(16).toUpperCase(),
      pieceCount: this.getRegister(slot, this.REG_PIECE_COUNT),
      pieceSize: this.getRegister(slot, this.REG_PIECE_SIZE),
      solved: this.getRegister(slot, this.REG_SOLVED_CNT),
      total: this.getRegister(slot, this.REG_TOTAL_GENS),
      bytes: read64(this.REG_BYTES_LO, this.REG_BYTES_HI),
      intensity: this.getRegister(slot, this.REG_DENSITY) / 100,
      phaseId: this.getRegister(slot, this.REG_PHASE_ID),
      startTime: read64(this.REG_START_LO, this.REG_START_HI),
      endTime: read64(this.REG_END_LO, this.REG_END_HI),
      verifyState: V_STATES[this.getRegister(slot, this.REG_VERIFY_CODE)] || "PENDING",
      rank: this.getRegister(slot, this.REG_RANK),
      status: this.getRegister(slot, this.REG_STATUS) === 1 ? "RUNNING" : "IDLE"
    };
  }
}

module.exports = AetherBackplane;

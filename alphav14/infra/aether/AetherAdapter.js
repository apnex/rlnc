/**
 * Aether Adapter: Sovereign Semantic Proxy
 * @version 2.0.0 - UNIFIED
 */
class AetherAdapter {
  constructor(backplane, slotIndex, origin = 0x02) {
    this.pcb = backplane;
    this.slot = slotIndex;
    this.origin = origin;

    // Sovereignty Tokens
    this.AUTH_HUB = 0x01;
    this.AUTH_WORKER = 0x02;
    this.AUTH_SUPERVISOR = 0x03;

    // High-Performance Local Shadow State
    this.local = {
        solved: 0,
        throughput: 0,
        dirty: false
    };

    // --- High-Fidelity Semantic Registry ---
    // [Relative Byte Offset, Scaling, Sovereignty Mask]
    this.REGISTRY = {
      'FLOW_PIECE_COUNT': [this.pcb.REG_PIECE_COUNT, 'DIRECT',  0x01],
      'FLOW_PIECE_SIZE':  [this.pcb.REG_PIECE_SIZE,  'DIRECT',  0x01],
      'FLOW_RANK_TARGET': [this.pcb.REG_TOTAL_GENS,  'DIRECT',  0x01],
      'FLOW_LIFECYCLE':   [this.pcb.REG_STATUS,      'DIRECT',  0x01],
      'FLOW_SESSION_ID':  [this.pcb.REG_SESSION_ID,  'DIRECT',  0x01],
      'FLOW_DRIVER_TYPE': [this.pcb.REG_DRIVER_TYPE, 'DIRECT',  0x01],
      'FLOW_SYSTEMATIC':  [this.pcb.REG_SYSTEMATIC,  'DIRECT',  0x01],

      'PULSE_SOLVED':     [this.pcb.REG_SOLVED_CNT,  'DIRECT',  0x02],
      'PULSE_RANK':       [this.pcb.REG_RANK,        'DIRECT',  0x02],
      'PULSE_THROUGHPUT': [this.pcb.REG_BYTES_LO,    'DIRECT64',0x02],
      'PULSE_LOAD':       [this.pcb.REG_LOAD,        'PERCENT', 0x02],
      'PULSE_VERIFY':     [this.pcb.REG_VERIFY_CODE, 'DIRECT',  0x02],
      'PULSE_DENSITY':    [this.pcb.REG_DENSITY,     'PERCENT', 0x02],
      'PULSE_PHASE':      [this.pcb.REG_PHASE_ID,    'DIRECT',  0x02],
      'PULSE_START_TS':   [this.pcb.REG_START_LO,    'DIRECT64',0x02],
      'PULSE_END_TS':     [this.pcb.REG_END_LO,      'DIRECT64',0x02],
      'PULSE_FABRIC_TIME':[this.pcb.REG_FABRIC_LO,   'DIRECT64',0x02],
      'NSF_STREAMS_ACTIVE': [this.pcb.REG_NSF_STREAMS_ACTIVE, 'DIRECT',  0x02],
      'NSF_THROUGHPUT_MB':  [this.pcb.REG_NSF_THROUGHPUT_MB,   'DIRECT',  0x02],
      'NSF_S_L_RATIO':      [this.pcb.REG_NSF_S_L_RATIO,       'PERCENT', 0x02],
      'PULSE_ENCODE_FIRST_STRIKE_MISS': [this.pcb.REG_ERR_VECTOR, 'DIRECT', 0x02], // Overloading Err Vector for now or add new reg if available

      'INTENT_SIGNAL':    [this.pcb.REG_HUB_SIG,     'DIRECT',  0x01],
      'PULSE_SIGNAL':     [this.pcb.REG_WORKER_SIG,  'DIRECT',  0x02],
      'FLOW_LIFECYCLE':   [this.pcb.REG_STATUS,      'DIRECT',  0x03] // Supervisor/Shared access for lifecycle
    };

    // --- Memory Networking State ---
    this.SESSION_OFFSET = 0; // To be mapped during session init
  }

  /**
   * MEM_RESOLVE_POINTER: The Address Translation Unit (ATU)
   * High-velocity resolution returning a singular byte offset for the manifold.
   * ZERO-ADMIN: Returns a raw U32 offset to prevent pointer-array overhead.
   */
  resolvePieceOffset(handle) {
    const index = handle - this.SESSION_OFFSET;
    if (index < 0 || index >= this.pcb.MAX_PIECES) {
        throw new Error(`Aether ATU: Sovereignty Violation (Handle: ${handle})`);
    }

    const dataBaseIdx = this.pcb.OFF_POOL_DAT | 0;
    const pieceSize = this.get('FLOW_PIECE_SIZE') | 0;
    const pieceIdx = index | 0;

    return (dataBaseIdx + (pieceIdx * pieceSize)) | 0;
  }

  /**
   * MEM_RESERVE_STRIDE: Lease a physical coordinate from the Memory Network.
   */
  reservePiece() {
    const maskBase = this.pcb.OFF_POOL_CTL / 4;
    const numRegs = this.pcb.MAX_PIECES / 32;
    for (let r = 0; r < numRegs; r++) { 
        const reg = maskBase + r;
        while (true) {
            const current = Atomics.load(this.pcb.registers, reg);
            if (current === -1) break; // Full

            let bit = -1;
            for (let b = 0; b < 32; b++) {
                if ((current & (1 << b)) === 0) {
                    bit = b;
                    break;
                }
            }
            if (bit === -1) break;

            const next = current | (1 << bit);
            if (Atomics.compareExchange(this.pcb.registers, reg, current, next) === current) {
                return (r * 32) + bit;
            }
        }
    }
    throw new Error("Aether Memory Network: Fabric Exhausted");
  }

  /**
   * MEM_RELEASE_STRIDE: Return a physical coordinate to the Memory Network.
   */
  releasePiece(handle) {
    const index = handle - this.SESSION_OFFSET;
    const r = Math.floor(index / 32);
    const b = index % 32;
    const reg = (this.pcb.OFF_POOL_CTL / 4) + r;
    
    while (true) {
        const current = Atomics.load(this.pcb.registers, reg);
        const next = current & ~(1 << b);
        if (Atomics.compareExchange(this.pcb.registers, reg, current, next) === current) {
            break;
        }
    }
  }

  get(key) {
    const entry = this.REGISTRY[key];
    if (!entry) throw new Error(`Aether: Unknown Key [${key}]`);
    const [off, scale] = entry;
    if (scale === 'DIRECT64') {
        const lo = this.pcb.getRegister(this.slot, off) >>> 0;
        const hi = this.pcb.getRegister(this.slot, off + 4) >>> 0;
        return Number((BigInt(hi) << 32n) | BigInt(lo));
    }
    const raw = this.pcb.getRegister(this.slot, off);
    return (scale === 'PERCENT') ? (raw >>> 0) / 100 : (raw >>> 0);
  }

  set(key, value) {
    const entry = this.REGISTRY[key];
    if (!entry) throw new Error(`Aether: Unknown Key [${key}]`);
    const [off, scale, mask] = entry;
    this._validateSovereignty(mask);
    if (scale === 'DIRECT64') {
        const val = BigInt(Math.floor(value));
        this.pcb.setRegister(this.slot, off, Number(val & 0xFFFFFFFFn));
        this.pcb.setRegister(this.slot, off + 4, Number(val >> 32n));
        return;
    }
    let processed = value;
    if (scale === 'PERCENT') processed = Math.floor(value * 100);
    this.pcb.setRegister(this.slot, off, processed | 0);
  }

  pulseLocal(solvedDelta, byteDelta) {
    this.local.solved += solvedDelta;
    this.local.throughput += byteDelta;
    this.local.dirty = true;
  }

  commit() {
    if (!this.local.dirty) return;
    this._validateSovereignty(0x02);
    if (this.local.solved > 0) {
        this.pcb.atomicAdd(this.slot, this.pcb.REG_SOLVED_CNT, this.local.solved); 
        this.local.solved = 0;
    }
    if (this.local.throughput > 0) {
        // Atomic Add to ensure cumulative throughput parity
        this.pcb.atomicAdd(this.slot, this.pcb.REG_BYTES_LO, this.local.throughput);
        this.local.throughput = 0;
    }
    this.local.dirty = false;
  }

  markStart() {
    const boot = this._getBoot();
    this.set('PULSE_START_TS', Math.floor((performance.now() - boot) * 1000));
  }

  markEnd() {
    const boot = this._getBoot();
    this.set('PULSE_END_TS', Math.floor((performance.now() - boot) * 1000));
  }

  /**
   * PULSE_FABRIC_TIME: Induct active physics microseconds into the backplane.
   * @param {number} micros - Duration of the kernel burn in microseconds.
   */
  pulseFabricTime(micros) {
    const val = BigInt(Math.floor(micros));
    const off = this.pcb.REG_FABRIC_LO;
    this.pcb.atomicAdd(this.slot, off, Number(val & 0xFFFFFFFFn));
    // Note: Simple 32-bit atomic add for now, HI increment needs 64-bit atomic or CAS loop
    // Given micros scale, 32-bit (4000s) is sufficient for a single test run.
  }

  _getBoot() {
    const lo = this.pcb.getPortRegister(6) >>> 0;
    const hi = this.pcb.getPortRegister(7) >>> 0;
    return Number((BigInt(hi) << 32n) | BigInt(lo));
  }

  _validateSovereignty(required) {
    if ((this.origin & required) === 0) { // Bitmask check
      this.pcb.setPortRegister(this.pcb.P0_ERRV, 0x20); // ERR_SOVEREIGNTY_FLT
      throw new Error(`Aether: Sovereignty Violation (Origin: ${this.origin}, Required: ${required})`);
    }
  }
}

module.exports = AetherAdapter;

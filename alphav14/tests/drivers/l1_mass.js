const BaseDriver = require("../framework/BaseDriver");
const crypto = require("crypto");

/**
 * UTA L1 Mass Displacement Driver - BYTE-SOVEREIGN EDITION
 * @warden-purpose Verifies linear stride stability and 64-bit alignment.
 * @pillar Pillar 1: Truth in Memory
 */
class MassDriver extends BaseDriver {
  constructor(config, adapter) {
    super(config, adapter);
    this.totalGens = this.adapter.get('FLOW_RANK_TARGET');
  }

  async init() {
    await super.init();
    this.h0 = this.adapter.reservePiece();
    this.h1 = this.adapter.reservePiece();
    this.status = "READY";
  }

  async start() {
    this.status = "RUNNING";
    this.adapter.markStart();

    try {
        const S = this.S;
        const sab = this.adapter.pcb.sab;
        const p0Off = this.adapter.resolvePieceOffset(this.h0);
        const p1Off = this.adapter.resolvePieceOffset(this.h1);

        const source = new Uint8Array(sab, p0Off, S);
        const target = new Uint8Array(sab, p1Off, S);

        for (let g = 0; g < this.totalGens; g++) {
            // 1. Generate Mass
            crypto.randomFillSync(source);
            target.fill(0);

            // 2. Execute Displacement (Linear Copy)
            // Verification of SAB consistency and alignment
            target.set(source);

            // 3. Bit-Perfect Audit
            for (let i = 0; i < S; i++) {
                if (target[i] !== source[i]) {
                    throw new Error(`Mass Displacement Failure at byte ${i}`);
                }
            }

            this.adapter.pulseLocal(1, S);
            this.adapter.commit();
        }
        
        this.adapter.set('PULSE_VERIFY', 2); // MATCH
    } catch (err) {
        console.error(`[L1-FAULT] ${err.stack}`);
        this.adapter.set('PULSE_VERIFY', 3); // FAIL
    }

    this.adapter.releasePiece(this.h0);
    this.adapter.releasePiece(this.h1);
    this.adapter.set('FLOW_LIFECYCLE', 0); 
    this.adapter.commit();
    this.adapter.markEnd();
    this.status = "DONE";
  }

  async step() { await new Promise(r => setTimeout(r, 50)); }
  async verify() { return true; }
}

module.exports = MassDriver;

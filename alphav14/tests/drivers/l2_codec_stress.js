const BaseDriver = require("../framework/BaseDriver");
const BlockEncoder = require("../../core/block_encoder");
const BlockDecoder = require("../../core/block_decoder");
const crypto = require("crypto");

/**
 * UTA L2 Logic Driver - BYTE-SOVEREIGN EDITION
 * @warden-purpose Executes contiguous byte-block coding via sovereign memory handles.
 * @pillar Pillar 4: Symmetric Perception
 */
class BlockLogicDriver extends BaseDriver {
  constructor(config, adapter) {
    super(config, adapter);
    this.totalGens = this.adapter.get('FLOW_RANK_TARGET');
    this.phaseId = 0; 
    this.encoder = null;
    this.decoder = null;
    
    // Physical handles for the source block
    this.sourceHandles = new Int32Array(this.N);
    this.sourceData = null;
  }

  async init() {
    await super.init();
    this.phaseId = this.adapter.get('PULSE_PHASE');
    
    const blockBytes = this.N * this.S;
    this.sourceData = Buffer.allocUnsafe(blockBytes);
    crypto.randomFillSync(this.sourceData);

    const sab = this.adapter.pcb.sab;

    // 1. Ingress: Reserve handles and fill source data
    for (let i = 0; i < this.N; i++) {
        this.sourceHandles[i] = this.adapter.reservePiece();
        const offset = this.adapter.resolvePieceOffset(this.sourceHandles[i]);
        const piece = this.sourceData.subarray(i * this.S, (i + 1) * this.S);
        new Uint8Array(sab, offset, this.S).set(piece);
    }

    this.encoder = new BlockEncoder(this.adapter, {
      PIECE_COUNT: this.N,
      PIECE_SIZE: this.S,
      SYSTEMATIC: true
    });
    this.encoder.bind(this.sourceHandles);

    this.decoder = new BlockDecoder(this.adapter, {
      PIECE_COUNT: this.N,
      PIECE_SIZE: this.S
    });

    this.status = "READY";
  }

  async start() {
    this.status = "RUNNING";
    this.adapter.markStart();

    try {
        const gens = this.totalGens;
        switch (this.phaseId) {
            case 1: await this._phase1_SYS_PASS(gens); break;
            case 2: await this._phase2_CODED_STRESS(gens); break;
            case 3: await this._phase3_LINEAR_DEP(gens); break;
            case 4: await this._phase4_BIT_FIDELITY(gens); break;
            default: await this._phase1_SYS_PASS(gens);
        }
        this.adapter.set('PULSE_VERIFY', 2); // MATCH
    } catch (err) {
        console.error(`[L2-FAULT-PHASE-${this.phaseId}] ${err.stack}`);
        this.adapter.set('PULSE_VERIFY', 3); // FAIL
    }

    // Release source handles
    for (let h of this.sourceHandles) this.adapter.releasePiece(h);

    this.adapter.set('FLOW_LIFECYCLE', 0);
    this.adapter.commit();
    this.adapter.markEnd();
    
    // Final reset to release all handles
    this.decoder.reset();
    
    this.status = "DONE";
  }

  async _phase1_SYS_PASS(gens) {
    this.adapter.set('PULSE_DENSITY', 0.25);
    for (let g = 0; g < gens; g++) {
        this.decoder.reset();
        this.encoder.nextSystematicIndex = 0;
        this.encoder.systematic = true;
        for (let i = 0; i < this.N; i++) {
            const piece = this.encoder.produceSystematic();
            this.decoder.addPiece(piece.handle, piece.manifest);
            this.adapter.set('PULSE_RANK', this.decoder.rank);
            this.adapter.pulseLocal(0, this.S);
            this.adapter.commit();
        }
        if (!this.decoder.solved) throw new Error("Systematic Reconstruction Failed");
        this.adapter.pulseLocal(1, 0);
        this.adapter.commit();
    }
  }

  async _phase2_CODED_STRESS(gens) {
    this.adapter.set('PULSE_DENSITY', 0.50);
    for (let g = 0; g < gens; g++) {
        this.decoder.reset();
        this.encoder.systematic = false;
        for (let i = 0; i < this.N; i++) {
            const piece = this.encoder.produceCoded();
            this.decoder.addPiece(piece.handle, piece.manifest);
            this.adapter.set('PULSE_RANK', this.decoder.rank);
            this.adapter.pulseLocal(0, this.S);
            this.adapter.commit();
        }
        if (!this.decoder.solved) throw new Error("Coded Reconstruction Failed");
        this.adapter.pulseLocal(1, 0);
        this.adapter.commit();
    }
  }

  async _phase3_LINEAR_DEP(gens) {
    this.adapter.set('PULSE_DENSITY', 0.75);
    for (let g = 0; g < gens; g++) {
        this.decoder.reset();
        this.encoder.systematic = false;
        for (let i = 0; i < this.N - 1; i++) {
            const piece = this.encoder.produceCoded();
            this.decoder.addPiece(piece.handle, piece.manifest);
            this.adapter.set('PULSE_RANK', this.decoder.rank);
            this.adapter.pulseLocal(0, this.S);
            this.adapter.commit();
        }
        // Inject Dependency
        const lastPiece = this.encoder.produceCoded();
        this.decoder.addPiece(lastPiece.handle, lastPiece.manifest); // Independent
        this.adapter.set('PULSE_RANK', this.decoder.rank);
        
        // Add same piece again
        this.decoder.addPiece(lastPiece.handle, lastPiece.manifest); // Redundant
        this.adapter.set('PULSE_RANK', this.decoder.rank);
        
        let extra = 0;
        while (!this.decoder.solved && extra++ < 32) {
            const piece = this.encoder.produceCoded();
            this.decoder.addPiece(piece.handle, piece.manifest);
            this.adapter.set('PULSE_RANK', this.decoder.rank);
            this.adapter.pulseLocal(0, this.S);
            this.adapter.commit();
        }
        if (!this.decoder.solved) throw new Error("Rank Law Stall");
        this.adapter.pulseLocal(1, 0);
        this.adapter.commit();
    }
  }

  async _phase4_BIT_FIDELITY(gens) {
    this.adapter.set('PULSE_DENSITY', 1.00);
    const sab = this.adapter.pcb.sab;
    for (let g = 0; g < gens; g++) {
        this.decoder.reset();
        this.encoder.systematic = false;
        for (let i = 0; i < this.N; i++) {
            const piece = this.encoder.produceCoded();
            this.decoder.addPiece(piece.handle, piece.manifest);
            this.adapter.set('PULSE_RANK', this.decoder.rank);
            this.adapter.pulseLocal(0, this.S);
            this.adapter.commit();
        }
        
        // Egress: Compare contiguous buffers
        for (let i = 0; i < this.N; i++) {
            const offset = this.adapter.resolvePieceOffset(this.decoder.decodedHandles[i]);
            const decoded = new Uint8Array(sab, offset, this.S);
            const original = this.sourceData.subarray(i * this.S, (i + 1) * this.S);
            for (let k = 0; k < this.S; k++) {
                if (decoded[k] !== original[k]) {
                    throw new Error(`Bit-Fidelity Violation at piece ${i} byte ${k}`);
                }
            }
        }
        this.adapter.pulseLocal(1, 0);
        this.adapter.commit();
    }
  }

  async step() { await new Promise(r => setTimeout(r, 50)); }
  async verify() { return true; }
}

module.exports = BlockLogicDriver;

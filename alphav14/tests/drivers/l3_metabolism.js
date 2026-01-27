const BaseDriver = require("../framework/BaseDriver");
const StreamSlicer = require("../../core/stream_slicer");
const StreamAssembler = require("../../core/stream_assembler");
const BlockEncoder = require("../../core/block_encoder");
const BlockDecoder = require("../../core/block_decoder");
const crypto = require("crypto");

/**
 * UTA L2 Stream Assembly Driver
 * @warden-purpose Verify multi-generation assembly using sovereign slicer/assembler units.
 */
class SequentialMappingDriver extends BaseDriver {
  constructor(config, adapter) {
    super(config, adapter);
    this.totalSize = config.data?.size || 1024 * 1024 * 64;
    this.genIdx = 0;
    this.totalGens = this.adapter.get('FLOW_RANK_TARGET');
    this.parity = false;
    
    this.slicer = null;
    this.assembler = null;
    this.encoder = null;
    this.decoder = null;
    this.sourceHash = null;
  }

  async init() {
    await super.init();
    const sourceData = Buffer.alloc(this.totalSize);
    for (let i = 0; i < sourceData.length; i += 4) {
        sourceData.writeUInt32LE(i, i);
    }
    this.sourceHash = crypto.createHash("sha256").update(sourceData).digest("hex");

    this.slicer = new StreamSlicer(sourceData, {
        PIECE_COUNT: this.N,
        PIECE_SIZE: this.S
    });
    this.assembler = new StreamAssembler(this.totalSize, {
        PIECE_COUNT: this.N,
        PIECE_SIZE: this.S
    });

    this.encoder = new BlockEncoder(null, {
      PIECE_COUNT: this.N,
      PIECE_SIZE: this.S,
      SYSTEMATIC: this.systematic,
    });
    this.decoder = new BlockDecoder({
      PIECE_COUNT: this.N,
      PIECE_SIZE: this.S,
    });

    this.status = "READY";
  }

  async start() {
    this.status = "RUNNING";
    const N = this.N;
    const S = this.S;

    // Pre-allocate transfer buffers
    const coeffs = new Uint8Array(N);
    const codedData = new Uint8Array(S);

    this.adapter.markStart();

    while (this.genIdx < this.totalGens) {
        const genBuffer = this.slicer.getGeneration(this.genIdx);
        const currentGenSize = genBuffer.length;
        
        this.encoder.bind(genBuffer);
        this.decoder.reset();

        for (let i = 0; i < N; i++) {
          if (this.systematic) {
              this.decoder.addPiece(this.encoder.codedPiece());
          } else {
              crypto.getRandomValues(coeffs);
              this.encoder.encodeInto(codedData, coeffs);
              this.decoder.addPiece({ coeffs, data: codedData });
          }
        }

        const solvedBlock = this.decoder.getData();
        if (solvedBlock) {
            this.assembler.addBlock(this.genIdx, solvedBlock);
        }

        this.adapter.pulseLocal(1, currentGenSize);
        this.genIdx++;
    }

    this.adapter.commit();
    this.adapter.markEnd();
    this.adapter.set('PULSE_DENSITY', 0.95);
    
    await this.verify();
    this.status = "DONE";
  }

  async step() {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async verify() {
    const reconstructed = this.assembler.finalize();
    const hash = crypto.createHash("sha256").update(reconstructed).digest("hex");
    this.parity = (hash === this.sourceHash);
    this.adapter.set('PULSE_VERIFY', this.parity ? 2 : 3);
    return this.parity;
  }
}

module.exports = SequentialMappingDriver;

const BaseDriver = require("../framework/BaseDriver");
const StreamSlicer = require("../../core/stream_slicer");
const StreamAssembler = require("../../core/stream_assembler");
const BlockEncoder = require("../../core/block_encoder");
const BlockDecoder = require("../../core/block_decoder");
const PacketSerializer = require("../../network/packet_serializer");
const SharedBufferPool = require("../../utils/shared_buffer_pool");
const crypto = require("crypto");

/**
 * UTA L4 Packet Geometry Driver - SOVEREIGN PIPELINE EDITION
 * @warden-purpose Verify the full Math -> Wire -> Reassembly pipeline.
 */
class PacketGeometryDriver extends BaseDriver {
  constructor(config, adapter) {
    super(config, adapter);
    this.totalSize = config.data?.size || 1024 * 1024 * 16;
    this.genIdx = 0;
    this.totalGens = this.adapter.get('FLOW_RANK_TARGET');
    this.parity = true;
    
    this.slicer = null;
    this.assembler = null;
    this.pool = null;
    this.encoder = null;
    this.decoder = null;
    this.sourceHash = null;
  }

  async init() {
    await super.init();
    
    // 1. Initialize Data Plane
    const sourceData = Buffer.alloc(this.totalSize);
    for (let i = 0; i < sourceData.length; i += 4) { sourceData.writeUInt32LE(i, i); }
    this.sourceHash = crypto.createHash("sha256").update(sourceData).digest("hex");

    // 2. Initialize Sovereign Units
    this.slicer = new StreamSlicer(sourceData, { PIECE_COUNT: this.N, PIECE_SIZE: this.S });
    this.assembler = new StreamAssembler(this.totalSize, { PIECE_COUNT: this.N, PIECE_SIZE: this.S });
    
    // Pool size must accommodate Header + Coeffs + Symbol
    const packetSize = 16 + this.N + this.S;
    this.pool = new SharedBufferPool(this.adapter.pcb, this.N, packetSize);

    this.encoder = new BlockEncoder(null, { PIECE_COUNT: this.N, PIECE_SIZE: this.S, SYSTEMATIC: this.systematic });
    this.decoder = new BlockDecoder({ PIECE_COUNT: this.N, PIECE_SIZE: this.S });

    this.status = "READY";
  }

  async start() {
    this.status = "RUNNING";
    const N = this.N;

    this.adapter.markStart();

    while (this.genIdx < this.totalGens) {
        // --- Layer 2: Slicing ---
        const genBuffer = this.slicer.getGeneration(this.genIdx);
        this.encoder.bind(genBuffer);
        this.decoder.reset();

        const packetSlots = [];

        // --- Layer 1 & 4: Encoding & Serialization ---
        for (let i = 0; i < N; i++) {
            const piece = this.encoder.codedPiece();
            piece.genId = this.genIdx;
            
            const slotIdx = this.pool.acquireTX();
            if (slotIdx !== -1) {
                const slotView = this.pool.getSlotView(slotIdx);
                PacketSerializer.serialize(piece, this.adapter, slotView, i);
                packetSlots.push(slotIdx);
            }
        }

        // --- Layer 4 & 1: Deserialization & Decoding ---
        for (const slotIdx of packetSlots) {
            const slotView = this.pool.getSlotView(slotIdx);
            const packet = PacketSerializer.deserialize(slotView, this.adapter);
            this.decoder.addPiece(packet);
            this.pool.release(slotIdx);
        }

        // --- Layer 2: Reassembly ---
        if (this.decoder.solved) {
            const solvedBlock = this.decoder.getData();
            const added = this.assembler.addBlock(this.genIdx, solvedBlock);
            if (!added) console.error(`[DRIVER] FAILED to add Gen ${this.genIdx} to Assembler.`);
        } else {
            console.error(`[DRIVER] Gen ${this.genIdx} NOT SOLVED. Rank: ${this.decoder.rank}/${N}`);
            this.parity = false;
        }

        this.adapter.pulseLocal(1, genBuffer.length);
        this.genIdx++;
        
        await new Promise(r => setImmediate(r));
    }

    this.adapter.commit();
    this.adapter.markEnd();
    this.adapter.set('PULSE_DENSITY', 0.95);
    
    await this.verify();
    this.adapter.set('PULSE_SIGNAL', 3); // Signal FINISHED to Hub
    this.status = "DONE";
  }

  async step() {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async verify() {
    const reconstructed = this.assembler.finalize();
    if (!reconstructed) {
        console.error(`[L4] Reassembly Incomplete. Solved ${this.assembler.completedGens.size}/${this.totalGens} gens.`);
        this.parity = false;
        this.adapter.set('PULSE_VERIFY', 3);
        return false;
    }
    const hash = crypto.createHash("sha256").update(reconstructed).digest("hex");
    this.parity = (this.parity && hash === this.sourceHash);
    this.adapter.set('PULSE_VERIFY', this.parity ? 2 : 3);
    return this.parity;
  }
}

module.exports = PacketGeometryDriver;

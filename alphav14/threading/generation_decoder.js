const StreamAssembler = require('../core/stream_assembler');

/**
 * GENERATION DECODER - AETHER NATIVE
 * @warden-purpose Orchestrate multi-generation reassembly via the Aether Backplane.
 * @warden-scope Threading / Egress
 */
class GenerationDecoder {
    constructor(totalSize, config, adapter) {
        this.adapter = adapter;
        
        // Internalize Assembler for Zero-Copy Data Plane
        this.assembler = new StreamAssembler(totalSize, {
            PIECE_COUNT: config.math.n,
            PIECE_SIZE: config.math.s
        });

        this.totalGens = this.assembler.totalGenerations;
    }

    /**
     * Monitor the backplane and ingest solved blocks.
     */
    sync(fabricState) {
        fabricState.slots.forEach(slot => {
            // If slot reports MATCH, ingest the reassembled block
            if (slot.verifyState === 'MATCH') {
                const genId = this.pcb.getRegister(slot.slot, this.pcb.REG_GEN_ID); // Mock mapping for L6
                this.assembler.addBlock(genId, slot.data);
            }
        });
    }

    isSolved() {
        return this.assembler.isSolved();
    }

    finalize() {
        return this.assembler.finalize();
    }
}

module.exports = GenerationDecoder;

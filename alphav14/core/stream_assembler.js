/**
 * ALPHAv13 Stream Assembler
 * @warden-purpose Sovereign Zero-Copy buffer reassembly for multi-generation decoding.
 * @warden-scope Core Implementation
 */
class StreamAssembler {
    constructor(totalSize, config) {
        this.pieceCount = config.PIECE_COUNT;
        this.pieceSize = config.PIECE_SIZE;
        this.blockSize = this.pieceCount * this.pieceSize;
        this.totalSize = totalSize;
        
        // Final reassembly buffer
        this.target = Buffer.allocUnsafe(this.totalSize).fill(0);
        this.completedGens = new Set();
    }

    /**
     * Commits a solved generation to the target buffer.
     * @param {number} genId - The logical index of the generation.
     * @param {Uint8Array} data - The reconstructed block.
     * @returns {boolean} - True if block was successfully integrated.
     */
    addBlock(genId, data) {
        if (this.completedGens.has(genId)) return false;

        const offset = genId * this.blockSize;
        const remaining = this.totalSize - offset;
        const clipSize = Math.min(this.blockSize, remaining);

        // [Constraint: Physics Alignment]
        // Clip incoming data to the actual remaining file size (removes math padding)
        data.subarray(0, clipSize).copy(this.target, offset);
        
        this.completedGens.add(genId);
        return true;
    }

    /**
     * Checks if the entire stream is assembled.
     */
    isSolved() {
        const expectedCount = Math.ceil(this.totalSize / this.blockSize);
        return this.completedGens.size === expectedCount;
    }

    /**
     * Returns the finalized bit-perfect data.
     */
    finalize() {
        if (!this.isSolved()) return null;
        return this.target;
    }
}

module.exports = StreamAssembler;

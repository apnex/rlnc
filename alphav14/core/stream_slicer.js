/**
 * ALPHAv13 Stream Slicer
 * @warden-purpose Sovereign Zero-Copy buffer slicing for multi-generation encoding.
 * @warden-scope Core Implementation
 */
class StreamSlicer {
    constructor(data, config) {
        this.pieceCount = config.PIECE_COUNT;
        this.pieceSize = config.PIECE_SIZE;
        this.blockSize = this.pieceCount * this.pieceSize;
        
        if (data) this.bind(data);
    }

    /**
     * Direct Binding API: Snaps the slicer to a memory segment.
     */
    bind(data) {
        this.data = data;
        this.totalGenerations = Math.ceil(this.data.length / this.blockSize);
    }

    /**
     * Extracts a high-fidelity generation block.
     * @param {number} genId - The logical generation index.
     * @returns {Uint8Array} - A zero-copy view of the block (padded if necessary).
     */
    getGeneration(genId) {
        const start = genId * this.blockSize;
        const end = Math.min(start + this.blockSize, this.data.length);
        const rawSlice = this.data.subarray(start, end);

        // [Constraint: Physics Alignment]
        // If slice is smaller than block size, return it as-is.
        // The BlockEncoder is responsible for padding during the XOR loop.
        return rawSlice;
    }
}

module.exports = StreamSlicer;

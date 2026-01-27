const crypto = require('crypto');
const GaloisMatrix = require('./galois_matrix');
const QuadrantMatrix = require('./quadrant_matrix');

/**
 * ALPHAv13 Bit-Sovereign Block Encoder (APPLIANCE)
 * @warden-purpose Stateless orchestration of block-sliced linear combinations.
 * @pillar Pillar 2: Sovereignty
 */
class BlockEncoder {
    constructor(adapter, config) {
        this.adapter = adapter;
        this.pieceCount = config.PIECE_COUNT;
        this.pieceSize = config.PIECE_SIZE;
        this.systematic = config.SYSTEMATIC || false;
        
        // Select Matrix Kernel (Sovereign Injection)
        this.Matrix = config.MATH_KERNEL === 'QUADRANT' ? QuadrantMatrix : GaloisMatrix;
        
        // Handles for the source pieces in this block
        this.sourceHandles = new Int32Array(this.pieceCount);
        this.nextSystematicIndex = 0;
    }

    /**
     * Bind the encoder to a set of physical piece handles.
     */
    bind(handles) {
        this.sourceHandles.set(handles);
        this.nextSystematicIndex = 0;
    }

    /**
     * Generates a coded piece handle via Nuclear Flush.
     * @returns {object} - { handle, manifest }
     */
    produceCoded() {
        const { adapter, pieceCount, sourceHandles } = this;
        const targetHandle = adapter.reservePiece();
        
        const manifest = new Uint8Array(pieceCount);
        crypto.randomFillSync(manifest);

        // Execute Nuclear Stride via Gateway
        this.Matrix.fuse(manifest, adapter, targetHandle, sourceHandles);

        return { handle: targetHandle, manifest };
    }

    /**
     * Generates a systematic piece (Identity)
     * @returns {object} - { handle, manifest }
     */
    produceSystematic() {
        const { adapter, pieceCount, sourceHandles, nextSystematicIndex } = this;
        if (nextSystematicIndex >= pieceCount) return this.produceCoded();

        const idx = this.nextSystematicIndex++;
        const targetHandle = adapter.reservePiece();
        
        // Identity Manifest
        const manifest = new Uint8Array(pieceCount).fill(0);
        manifest[idx] = 1;

        // Execute Nuclear Stride via Gateway (Identity Bypass)
        this.Matrix.fuse(manifest, adapter, targetHandle, sourceHandles);

        return { handle: targetHandle, manifest };
    }
}

module.exports = BlockEncoder;

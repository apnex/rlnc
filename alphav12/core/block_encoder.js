const GF = require('./gf256');
const CodedPiece = require('../network/coded_piece');

/**
 * ALPHAv10 Block Encoder
 * Pure atomic math primitive focused on linear combinations.
 */
class BlockEncoder {
    constructor(data, config) {
        this.data = data;
        this.pieceCount = config.PIECE_COUNT;
        this.pieceSize = config.PIECE_SIZE;
        this.systematic = config.SYSTEMATIC;
        
        this.pieces = [];
        this.nextSystematicIndex = 0;
        
        // Internal caching for Vectorization
        this.vectorizedPieces = []; // 64-bit aligned views
        this.tailPieces = [];       // Remainder bytes for non-8-byte aligned sizes

        for (let i = 0; i < this.pieceCount; i++) {
            const start = i * this.pieceSize;
            let chunk = this.data.subarray(start, start + this.pieceSize);
            
            // Handle padding if the last chunk is smaller than pieceSize
            if (chunk.length < this.pieceSize) {
                const padding = Buffer.alloc(this.pieceSize - chunk.length);
                chunk = Buffer.concat([chunk, padding]);
            }
            this.pieces.push(chunk);

            // --- Safe Alignment Logic ---
            const num8ByteBlocks = Math.floor(this.pieceSize / 8);
            const alignedLength = num8ByteBlocks * 8;

            // v10: Only create vectorized view if 8-byte aligned
            if (chunk.byteOffset % 8 === 0) {
                this.vectorizedPieces.push(new BigUint64Array(
                    chunk.buffer, 
                    chunk.byteOffset, 
                    num8ByteBlocks
                ));
            } else {
                this.vectorizedPieces.push(null);
            }

            // Store the "tail" (remaining 0-7 bytes) for scalar processing
            this.tailPieces.push(chunk.subarray(alignedLength));
        }
    }

    /**
     * Produces a context-blind coded piece.
     * @returns {Object} result - Contains coeffs and data.
     */
    codedPiece() {
        // 1. Systematic Phase
        if (this.systematic && this.nextSystematicIndex < this.pieceCount) {
            const idx = this.nextSystematicIndex++;
            const coeffs = new Uint8Array(this.pieceCount).fill(0);
            coeffs[idx] = 1;
            return { coeffs, data: this.pieces[idx] };
        }

        // 2. Coded Phase (Optimized Path)
        const coeffs = new Uint8Array(this.pieceCount);
        const output = Buffer.allocUnsafe(this.pieceSize); 
        output.fill(0);
        
        const num8ByteBlocks = Math.floor(this.pieceSize / 8);
        const outputIsAligned = output.byteOffset % 8 === 0;
        const outputVec = outputIsAligned ? new BigUint64Array(output.buffer, output.byteOffset, num8ByteBlocks) : null;
        const outputTail = output.subarray(num8ByteBlocks * 8);

        // v10 Optimization: Bulk random generation
        crypto.getRandomValues(coeffs);

        for (let i = 0; i < this.pieceCount; i++) {
            const c = coeffs[i];
            
            if (c === 0) continue;

            // Zero-allocation: Retrieve S-Box view from GMM
            const mulTable = GF.SBOX.subarray(c << 8, (c << 8) + 256);
            
            const piece = this.pieces[i];
            const pVec = this.vectorizedPieces[i];
            
            if (c === 1 && pVec && outputVec) {
                // Vectorized Path: Process 8 bytes at a time
                for (let v = 0; v < outputVec.length; v++) {
                    outputVec[v] ^= pVec[v];
                }
                // Handle the remainder bytes
                const pTail = this.tailPieces[i];
                for (let t = 0; t < outputTail.length; t++) {
                    outputTail[t] ^= pTail[t];
                }
            } else {
                // Scalar Path: Cache-friendly table lookup
                for (let j = 0; j < this.pieceSize; j++) {
                    output[j] ^= mulTable[piece[j]];
                }
            }
        }

        return { coeffs, data: output };
    }
}

module.exports = BlockEncoder;
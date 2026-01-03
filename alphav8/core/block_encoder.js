const GF = require('./gf256');
const CodedPiece = require('../network/coded_piece');

/**
 * ALPHAv7 Block Encoder
 * Optimized with Pseudo-SIMD vectorization and Safe Memory Alignment.
 */
class BlockEncoder {
    constructor(data, genId, config) {
        this.data = data;
        this.genId = genId;
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

            // Store the 64-bit view for the bulk of the data
            this.vectorizedPieces.push(new BigUint64Array(
                chunk.buffer, 
                chunk.byteOffset, 
                num8ByteBlocks
            ));

            // Store the "tail" (remaining 0-7 bytes) for scalar processing
            this.tailPieces.push(chunk.subarray(alignedLength));
        }
    }

    codedPiece() {
        // 1. Systematic Phase (Unchanged)
        if (this.systematic && this.nextSystematicIndex < this.pieceCount) {
            const idx = this.nextSystematicIndex++;
            const coeffs = new Uint8Array(this.pieceCount).fill(0);
            coeffs[idx] = 1;
            return new CodedPiece(this.genId, coeffs, this.pieces[idx]);
        }

        // 2. Coded Phase (Optimized Path)
        const coeffs = new Uint8Array(this.pieceCount);
        const output = Buffer.allocUnsafe(this.pieceSize); 
        output.fill(0);
        
        const num8ByteBlocks = Math.floor(this.pieceSize / 8);
        const outputVec = new BigUint64Array(output.buffer, output.byteOffset, num8ByteBlocks);
        const outputTail = output.subarray(num8ByteBlocks * 8);

        for (let i = 0; i < this.pieceCount; i++) {
            const c = Math.floor(Math.random() * 256);
            coeffs[i] = c;
            
            if (c === 0) continue;

            // Generate Multiplication S-Box for the current coefficient
            const mulTable = new Uint8Array(256);
            for (let v = 0; v < 256; v++) mulTable[v] = GF.mul(c, v);
            
            const piece = this.pieces[i];
            
            if (c === 1) {
                // Vectorized Path: Process 8 bytes at a time
                const pVec = this.vectorizedPieces[i];
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

        return new CodedPiece(this.genId, coeffs, output);
    }
}

module.exports = BlockEncoder;

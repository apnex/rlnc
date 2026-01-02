const GF = require('./gf256');
const CodedPiece = require('../network/coded_piece');

class BlockEncoder {
    constructor(data, genId, config) {
        this.data = data;
        this.genId = genId;
        this.pieceCount = config.PIECE_COUNT;
        this.pieceSize = config.PIECE_SIZE;
        this.systematic = config.SYSTEMATIC;
        
        this.pieces = [];
        this.nextSystematicIndex = 0;
        
        // Internal caching for Vectorization (8-byte chunks)
        this.vectorizedPieces = [];

        for (let i = 0; i < this.pieceCount; i++) {
            const start = i * this.pieceSize;
            let chunk = this.data.subarray(start, start + this.pieceSize);
            if (chunk.length < this.pieceSize) {
                const padding = Buffer.alloc(this.pieceSize - chunk.length);
                chunk = Buffer.concat([chunk, padding]);
            }
            this.pieces.push(chunk);
            // Create a 64-bit view of the same memory for the hot-path
            this.vectorizedPieces.push(new BigUint64Array(chunk.buffer, chunk.byteOffset, this.pieceSize / 8));
        }
    }

    codedPiece() {
        // 1. Systematic Phase (Unchanged for API consistency)
        if (this.systematic && this.nextSystematicIndex < this.pieceCount) {
            const idx = this.nextSystematicIndex++;
            const coeffs = new Uint8Array(this.pieceCount).fill(0);
            coeffs[idx] = 1;
            return new CodedPiece(this.genId, coeffs, this.pieces[idx]);
        }

        // 2. Coded Phase (Optimized Path)
        const coeffs = new Uint8Array(this.pieceCount);
        const output = Buffer.allocUnsafe(this.pieceSize); // allocUnsafe is faster, but we must zero it
        output.fill(0);
        
        const outputVec = new BigUint64Array(output.buffer, output.byteOffset, this.pieceSize / 8);

        for (let i = 0; i < this.pieceCount; i++) {
            const c = Math.floor(Math.random() * 256);
            coeffs[i] = c;
            
            if (c === 0) continue;

            // --- THE MULTIPLICATION TABLE CACHE ---
            // Instead of millions of GF.mul(c, byte) calls, we pre-calculate all 256 possibilities for 'c'
            const mulTable = new Uint8Array(256);
            for (let v = 0; v < 256; v++) mulTable[v] = GF.mul(c, v);
            
            const piece = this.pieces[i];
            
            // IF c is 1, we just do a raw 64-bit XOR (No GF math needed)
            if (c === 1) {
                const pVec = this.vectorizedPieces[i];
                for (let v = 0; v < outputVec.length; v++) {
                    outputVec[v] ^= pVec[v];
                }
            } else {
                // Otherwise, use the table (Scalar path, but cache-friendly)
                // Note: Full 64-bit GF multiplication requires WASM/SIMD. 
                // In pure JS, this table lookup is our current ceiling.
                for (let j = 0; j < this.pieceSize; j++) {
                    output[j] ^= mulTable[piece[j]];
                }
            }
        }

        return new CodedPiece(this.genId, coeffs, output);
    }
}

module.exports = BlockEncoder;

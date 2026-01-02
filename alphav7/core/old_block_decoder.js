const GF = require('./gf256');
const GaloisMatrix = require('./galois_matrix');

class BlockDecoder {
    constructor(config) {
        this.pieceCount = config.PIECE_COUNT;
        this.pieceSize = config.PIECE_SIZE;
        
        // Augmented Matrix: [Coeffs | Data]
        // Rows = pieceCount, Cols = pieceCount + pieceSize
        this.matrix = new GaloisMatrix(this.pieceCount, this.pieceCount + this.pieceSize);
        this.filledRows = 0;
        this.solved = false;
        
        // Optimization: Pre-allocate a swap buffer to avoid GC during row swaps
        this.rowSize = this.pieceCount + this.pieceSize;
        this.swapBuf = new Uint8Array(this.rowSize);
    }

    addPiece(piece) {
        if (this.solved) return true;

        if (this.filledRows < this.pieceCount) {
            const row = this.filledRows;
            
            // Optimization: Direct array access for speed
            // Matrix layout is flat: [row0...][row1...]
            const offset = row * this.rowSize;
            const data = this.matrix.data;

            // Copy Coeffs
            for (let i = 0; i < this.pieceCount; i++) {
                data[offset + i] = piece.coeffs[i];
            }
            
            // Copy Data
            for (let i = 0; i < this.pieceSize; i++) {
                data[offset + this.pieceCount + i] = piece.data[i];
            }
            
            this.filledRows++;
        }

        if (this.filledRows >= this.pieceCount) {
            return this.attemptSolve();
        }
        return false;
    }

    attemptSolve() {
        // PERFORMANCE OVERRIDE: 
        // We bypass standard this.matrix.solve() to use S-Box optimization.
        // This keeps the optimization local to the Decoder without breaking GaloisMatrix.
        this._gaussianEliminationOptimized();
        
        // Verify identity matrix on the left
        let isIdentity = true;
        for (let i = 0; i < this.pieceCount; i++) {
            // Check diagonal is 1
            if (this.matrix.get(i, i) !== 1) {
                isIdentity = false;
                break;
            }
        }
        
        if (isIdentity) {
            this.solved = true;
            return true;
        }
        return false;
    }

    /**
     * Optimized Gaussian Elimination with S-Box Caching
     * Replaces standard GF.mul loop with cached Uint8Array lookups.
     */
    _gaussianEliminationOptimized() {
        const rows = this.pieceCount;
        const cols = this.rowSize;
        const data = this.matrix.data;

        let pivotRow = 0;
        for (let col = 0; col < this.pieceCount && pivotRow < rows; col++) {
            // 1. Find the best pivot (Swap)
            let maxRow = pivotRow;
            // Optimization: Only check the column we are targeting
            for (let i = pivotRow + 1; i < rows; i++) {
                if (data[i * cols + col] > data[maxRow * cols + col]) {
                    maxRow = i;
                }
            }

            // Swap rows if necessary
            if (maxRow !== pivotRow) {
                const pOffset = pivotRow * cols;
                const mOffset = maxRow * cols;
                
                // Fast swap using TypedArrays
                this.swapBuf.set(data.subarray(pOffset, pOffset + cols));   // Save Pivot
                data.set(data.subarray(mOffset, mOffset + cols), pOffset);  // Move Max to Pivot
                data.set(this.swapBuf, mOffset);                            // Move Saved to Max
            }

            const pivotVal = data[pivotRow * cols + col];
            if (pivotVal === 0) continue; 
            
            // 2. Normalize the pivot row (make pivot = 1)
            // Divide row by pivotVal (Multiplying by inverse)
            if (pivotVal !== 1) {
                const invPivot = GF.div(1, pivotVal);
                
                // --- S-BOX CACHE GENERATION (Normalization) ---
                const normTable = new Uint8Array(256);
                for(let k = 0; k < 256; k++) normTable[k] = GF.mul(k, invPivot);
                
                const pOffset = pivotRow * cols;
                // Optimization: Start from 'col' because previous cols are 0
                for (let k = col; k < cols; k++) {
                    data[pOffset + k] = normTable[data[pOffset + k]];
                }
            }

            // 3. Eliminate other rows
            const pOffset = pivotRow * cols;
            for (let i = 0; i < rows; i++) {
                if (i === pivotRow) continue;
                
                const tOffset = i * cols;
                const factor = data[tOffset + col];
                
                if (factor === 0) continue;

                // --- S-BOX CACHE GENERATION (Elimination) ---
                // We need to calculate: Target[k] ^= Factor * Pivot[k]
                const elimTable = new Uint8Array(256);
                for(let k = 0; k < 256; k++) elimTable[k] = GF.mul(k, factor);

                // Optimization: Hot Path Loop
                for (let k = col; k < cols; k++) {
                    data[tOffset + k] ^= elimTable[data[pOffset + k]];
                }
            }
            pivotRow++;
        }
    }

    getData() {
        if (!this.solved) return null;
        const result = Buffer.alloc(this.pieceCount * this.pieceSize);
        
        // Direct access optimization
        const data = this.matrix.data;
        const cols = this.rowSize;

        for (let i = 0; i < this.pieceCount; i++) {
            const rowOffset = i * cols;
            const dataOffset = this.pieceCount; // Skip coeffs
            
            // Copy row data into result buffer
            for (let j = 0; j < this.pieceSize; j++) {
                result[i * this.pieceSize + j] = data[rowOffset + dataOffset + j];
            }
        }
        return result;
    }
}

module.exports = BlockDecoder;

const GF = require('./gf256_v8');
const GaloisMatrix = require('./galois_matrix_v8');

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

        // FIX Part 1: Safe Entry
        // This check is now safe because attemptSolve() will reset filledRows 
        // if the buffer contains useless (dependent) rows.
        if (this.filledRows < this.pieceCount) {
            const row = this.filledRows;
            
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

        // Trigger Solve if buffer appears full
        if (this.filledRows >= this.pieceCount) {
            return this.attemptSolve();
        }
        return false;
    }

    attemptSolve() {
        // FIX Part 2: Capture Rank
        // We need to know how many rows were actually useful.
        const rank = this._gaussianEliminationOptimized();
        
        // Verify identity matrix on the left
        let isIdentity = true;
        if (rank < this.pieceCount) {
            isIdentity = false;
        } else {
            // Even if rank is full, verify the diagonal is 1s
            for (let i = 0; i < this.pieceCount; i++) {
                if (this.matrix.get(i, i) !== 1) {
                    isIdentity = false;
                    break;
                }
            }
        }
        
        if (isIdentity) {
            this.solved = true;
            return true;
        } else {
            // CRITICAL FIX Part 3: The Reset
            // If we didn't solve it, the matrix is in Row Echelon Form.
            // Any rows below 'rank' are all zeros (useless duplicates).
            // We reset filledRows to 'rank' so the next incoming packet
            // overwrites the first useless row.
            this.filledRows = rank;
            return false;
        }
    }

    /**
     * Optimized Gaussian Elimination with S-Box Caching
     * Returns: The Rank of the matrix (number of independent rows found)
     */
    _gaussianEliminationOptimized() {
        const rows = this.pieceCount;
        const cols = this.rowSize;
        const data = this.matrix.data;

        let pivotRow = 0;
        for (let col = 0; col < this.pieceCount && pivotRow < rows; col++) {
            // 1. Find the best pivot (Swap)
            let maxRow = pivotRow;
            for (let i = pivotRow + 1; i < rows; i++) {
                if (data[i * cols + col] > data[maxRow * cols + col]) {
                    maxRow = i;
                }
            }

            // Swap rows if necessary
            if (maxRow !== pivotRow) {
                const pOffset = pivotRow * cols;
                const mOffset = maxRow * cols;
                
                this.swapBuf.set(data.subarray(pOffset, pOffset + cols));   // Save Pivot
                data.set(data.subarray(mOffset, mOffset + cols), pOffset);  // Move Max to Pivot
                data.set(this.swapBuf, mOffset);                            // Move Saved to Max
            }

            const pivotVal = data[pivotRow * cols + col];
            if (pivotVal === 0) continue; 
            
            // 2. Normalize the pivot row (make pivot = 1)
            if (pivotVal !== 1) {
                const invPivot = GF.div(1, pivotVal);
                
                const normTable = new Uint8Array(256);
                for(let k = 0; k < 256; k++) normTable[k] = GF.mul(k, invPivot);
                
                const pOffset = pivotRow * cols;
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

                const elimTable = new Uint8Array(256);
                for(let k = 0; k < 256; k++) elimTable[k] = GF.mul(k, factor);

                for (let k = col; k < cols; k++) {
                    data[tOffset + k] ^= elimTable[data[pOffset + k]];
                }
            }
            pivotRow++;
        }
        
        // FIX Part 4: Return Rank
        // pivotRow now equals the number of linearly independent rows found.
        return pivotRow;
    }

    getData() {
        if (!this.solved) return null;
        const result = Buffer.alloc(this.pieceCount * this.pieceSize);
        
        const data = this.matrix.data;
        const cols = this.rowSize;

        for (let i = 0; i < this.pieceCount; i++) {
            const rowOffset = i * cols;
            const dataOffset = this.pieceCount; // Skip coeffs
            
            for (let j = 0; j < this.pieceSize; j++) {
                result[i * this.pieceSize + j] = data[rowOffset + dataOffset + j];
            }
        }
        return result;
    }
}

module.exports = BlockDecoder;

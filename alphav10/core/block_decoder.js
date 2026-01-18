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
    }

    addPiece(piece) {
        if (this.solved) return true;

        // FIX Part 1: Safe Entry
        // This check is now safe because attemptSolve() will reset filledRows 
        // if the buffer contains useless (dependent) rows.
        if (this.filledRows < this.pieceCount) {
            const row = this.filledRows;
            
            // Interaction: Direct buffer access for fast ingestion
            const cols = this.pieceCount + this.pieceSize;
            const offset = row * cols;
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
        // Delegate math to the Matrix Workhorse (Phase 2 Uplift)
        const rank = this.matrix.solve();
        
        // Verify identity matrix on the left [I | Data]
        let isIdentity = true;
        if (rank < this.pieceCount) {
            isIdentity = false;
        } else {
            // Check the diagonal for 1s to ensure full resolution
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
            // Reset filledRows to rank so next packet overwrites the first dependent row
            this.filledRows = rank;
            return false;
        }
    }

    getData() {
        if (!this.solved) return null;
        const result = Buffer.alloc(this.pieceCount * this.pieceSize);
        
        for (let i = 0; i < this.pieceCount; i++) {
            const row = this.matrix.getAugmentedRow(i);
            const dataPart = row.subarray(this.pieceCount); // Slice data from [coeffs | data]
            result.set(dataPart, i * this.pieceSize);
        }
        return result;
    }
}

module.exports = BlockDecoder;

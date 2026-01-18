const GaloisMatrix = require('./galois_matrix');

/**
 * INCREMENTAL BLOCK DECODER (CON-004)
 * Pure protocol state machine delegating math to GaloisMatrix.
 * v10 Final: Zero-dependency on finite field arithmetic logic.
 */
class BlockDecoder {
    constructor(config) {
        this.pieceCount = config.PIECE_COUNT;
        this.pieceSize = config.PIECE_SIZE;
        
        // Augmented Matrix: [Coeffs | Data]
        this.matrix = new GaloisMatrix(this.pieceCount, this.pieceCount + this.pieceSize);
        this.rank = 0;
        this.solved = false;

        // Tracks which row is the pivot for which column
        this.pivotRowMap = new Int32Array(this.pieceCount).fill(-1);

        // v10 Optimization: Reusable working row
        this.workingRow = new Uint8Array(this.pieceCount + this.pieceSize);
    }

    /**
     * Adds a piece and performs incremental elimination.
     * @param {CodedPiece} piece 
     * @returns {boolean} - True if solved
     */
    addPiece(piece) {
        if (this.solved) return true;

        const { pieceCount, matrix, pivotRowMap, workingRow } = this;

        // 1. Map into working row (Math-Agnostic ingest)
        workingRow.set(piece.coeffs, 0);
        workingRow.set(piece.data, pieceCount);

        // 2. Incremental Elimination
        for (let i = 0; i < pieceCount; i++) {
            const factor = workingRow[i];
            if (factor === 0) continue;

            const pivotRow = pivotRowMap[i];
            if (pivotRow === -1) {
                // Found a new pivot!
                this._insertRow(i, workingRow);
                this.rank++;

                if (this.rank === pieceCount) {
                    return this._finalize();
                }
                return false;
            } else {
                // Eliminate using existing pivot row
                matrix.multiplyAdd(workingRow, matrix.getAugmentedRow(pivotRow), factor, i);
            }
        }

        return false;
    }

    _insertRow(colIndex, row) {
        const { matrix, pivotRowMap } = this;
        const pivotRow = this.rank;
        
        // Finalize row into matrix and normalize
        const target = matrix.getAugmentedRow(pivotRow);
        target.set(row);
        matrix.normalizeRow(pivotRow, colIndex);
        
        pivotRowMap[colIndex] = pivotRow;
    }

    _finalize() {
        // Back-substitution to reach identity [I | Data]
        const { pieceCount, matrix, pivotRowMap } = this;

        for (let i = pieceCount - 1; i >= 0; i--) {
            const pivotRowView = matrix.getAugmentedRow(pivotRowMap[i]);
            for (let j = 0; j < i; j++) {
                const targetRowView = matrix.getAugmentedRow(pivotRowMap[j]);
                const factor = targetRowView[i];
                if (factor === 0) continue;

                matrix.multiplyAdd(targetRowView, pivotRowView, factor, i);
            }
        }

        this.solved = true;
        return true;
    }

    getData() {
        if (!this.solved) return null;
        const { pieceCount, pieceSize, matrix, pivotRowMap } = this;
        const result = Buffer.alloc(pieceCount * pieceSize);
        
        for (let i = 0; i < pieceCount; i++) {
            const rowIdx = pivotRowMap[i];
            const data = matrix.extractData(rowIdx, pieceCount);
            result.set(data, i * pieceSize);
        }
        return result;
    }
}

module.exports = BlockDecoder;

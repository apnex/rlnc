const GF = require('./gf256_v8');

class GaloisMatrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        // Flattened 1D array for better cache locality than 2D arrays
        this.data = new Uint8Array(rows * cols);
    }

    get(r, c) { return this.data[r * this.cols + c]; }
    set(r, c, val) { this.data[r * this.cols + c] = val; }

    /**
     * Gaussian Elimination to solve Ax = b
     * Used to solve the system of linear equations formed by the coded packets.
     * @param {GaloisMatrix} augmentedMatrix - The matrix to solve (modified in-place)
     */
    solve(augmentedMatrix) {
        const rows = this.rows;
        const cols = this.cols;
        const matrix = augmentedMatrix; // In-place modification

        let pivotRow = 0;
        for (let col = 0; col < cols && pivotRow < rows; col++) {
            // 1. Find the best pivot (largest value helps numerical stability in standard math, 
            //    but in GF(2^8) any non-zero value works. We swap for structural consistency).
            let maxRow = pivotRow;
            for (let i = pivotRow + 1; i < rows; i++) {
                if (matrix.get(i, col) > matrix.get(maxRow, col)) {
                    maxRow = i;
                }
            }

            // 2. Swap rows if necessary
            if (matrix.get(maxRow, col) === 0) continue; // Column is all zeros, skip
            
            if (maxRow !== pivotRow) {
                for (let k = 0; k < matrix.cols; k++) {
                    const tmp = matrix.get(pivotRow, k);
                    matrix.set(pivotRow, k, matrix.get(maxRow, k));
                    matrix.set(maxRow, k, tmp);
                }
            }

            // 3. Normalize the pivot row (Divide by pivot value)
            const pivotVal = matrix.get(pivotRow, col);
            const invPivot = GF.div(1, pivotVal);
            for (let k = col; k < matrix.cols; k++) {
                matrix.set(pivotRow, k, GF.mul(matrix.get(pivotRow, k), invPivot));
            }

            // 4. Eliminate other rows (Make column entries 0 above and below pivot)
            for (let i = 0; i < rows; i++) {
                if (i !== pivotRow) {
                    const factor = matrix.get(i, col);
                    if (factor !== 0) {
                        for (let k = col; k < matrix.cols; k++) {
                            // Row[i] = Row[i] - (factor * PivotRow)
                            // Note: Subtraction is XOR, same as Addition
                            const val = GF.sub(
                                matrix.get(i, k),
                                GF.mul(factor, matrix.get(pivotRow, k))
                            );
                            matrix.set(i, k, val);
                        }
                    }
                }
            }
            pivotRow++;
        }
        return matrix;
    }
}

module.exports = GaloisMatrix;

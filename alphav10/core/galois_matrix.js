const GF = require('./gf256');

/**
 * ALPHAv10 Galois Matrix - Multi-Path Experiment Engine
 * Used to scientifically identify the optimal instruction pattern for linear algebra.
 */
class GaloisMatrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = new Uint8Array(rows * cols);
        this.swapBuf = new Uint8Array(cols);
    }

    get(r, c) { return this.data[r * this.cols + c]; }
    set(r, c, val) { this.data[r * this.cols + c] = val; }

    // --- SHARED STRUCTURAL SUBROUTINES ---

    _findPivot(col, startRow, mode = 'first') {
        const rows = this.rows;
        const cols = this.cols;
        const data = this.data;
        if (mode === 'max') {
            let maxRow = startRow;
            for (let i = startRow + 1; i < rows; i++) {
                if (data[i * cols + col] > data[maxRow * cols + col]) {
                    maxRow = i;
                }
            }
            return data[maxRow * cols + col] === 0 ? -1 : maxRow;
        } else {
            // mode === 'first' (v10 optimized)
            for (let i = startRow; i < rows; i++) {
                if (data[i * cols + col] !== 0) return i;
            }
            return -1;
        }
    }

    _swapRows(rowA, rowB) {
        if (rowA === rowB) return;
        const cols = this.cols;
        const data = this.data;
        const offsetA = rowA * cols;
        const offsetB = rowB * cols;
        this.swapBuf.set(data.subarray(offsetA, offsetA + cols));
        data.set(data.subarray(offsetB, offsetB + cols), offsetA);
        data.set(this.swapBuf, offsetB);
    }

    // --- EXPERIMENTAL PATHS ---

    /**
     * Legacy Baseline (Functional)
     */
    solve_legacy() {
        const rows = this.rows;
        const cols = this.cols;
        const data = this.data;
        let pivotRow = 0;
        for (let col = 0; col < cols && pivotRow < rows; col++) {
            const maxRow = this._findPivot(col, pivotRow, 'max');
            if (maxRow === -1) continue;
            this._swapRows(pivotRow, maxRow);
            const pivotVal = data[pivotRow * cols + col];
            const invPivot = GF.div(1, pivotVal);
            for (let k = col; k < cols; k++) {
                data[pivotRow * cols + k] = GF.mul(data[pivotRow * cols + k], invPivot);
            }
            for (let i = 0; i < rows; i++) {
                if (i !== pivotRow) {
                    const factor = data[i * cols + col];
                    if (factor !== 0) {
                        for (let k = col; k < cols; k++) {
                            data[i * cols + k] ^= GF.mul(factor, data[pivotRow * cols + k]);
                        }
                    }
                }
            }
            pivotRow++;
        }
        return pivotRow;
    }

    /**
     * Phase 1: Vectorized (S-Box + 64-bit BigInt XOR)
     */
    solve_vectorized() {
        const rows = this.rows;
        const cols = this.cols;
        const data = this.data;
        const SBOX = GF.SBOX;
        let pivotRow = 0;
        const maxPivot = Math.min(rows, cols);

        for (let col = 0; col < maxPivot && pivotRow < rows; col++) {
            const maxRow = this._findPivot(col, pivotRow, 'first');
            if (maxRow === -1) continue;
            this._swapRows(pivotRow, maxRow);
            const pivotVal = data[pivotRow * cols + col];
            const invPivot = GF.div(1, pivotVal);

            // Normalize pivot row
            const normTable = SBOX.subarray(invPivot << 8, (invPivot << 8) + 256);
            const pOffset = pivotRow * cols;
            for (let k = col; k < cols; k++) {
                data[pOffset + k] = normTable[data[pOffset + k]];
            }

            // Eliminate other rows
            for (let i = 0; i < rows; i++) {
                if (i === pivotRow) continue;
                const tOffset = i * cols;
                const factor = data[tOffset + col];
                if (factor === 0) continue;
                if (factor === 1) {

                    // Vectorized XOR path
                    const startByte = data.byteOffset + tOffset + col;
                    const alignmentOffset = (8 - (startByte % 8)) % 8;
                    const scalarEnd = Math.min(col + alignmentOffset, cols);
                    for (let k = col; k < scalarEnd; k++) data[tOffset + k] ^= data[pOffset + k];
                    const num64 = Math.floor((cols - scalarEnd) / 8);
                    if (num64 > 0) {
                        const p64 = new BigUint64Array(data.buffer, data.byteOffset + pOffset + scalarEnd, num64);
                        const t64 = new BigUint64Array(data.buffer, data.byteOffset + tOffset + scalarEnd, num64);
                        for (let k = 0; k < num64; k++) t64[k] ^= p64[k];
                    }
                    for (let k = scalarEnd + (num64 * 8); k < cols; k++) data[tOffset + k] ^= data[pOffset + k];
                } else {
                    const elimTable = SBOX.subarray(factor << 8, (factor << 8) + 256);
                    for (let k = col; k < cols; k++) {
                        data[tOffset + k] ^= elimTable[data[pOffset + k]];
                    }
                }
            }
            pivotRow++;
        }
        return pivotRow;
    }

    /**
     * Phase 2: Fused (Normalization Skip + BigInt)
     */
    solve_fused() {
        const rows = this.rows;
        const cols = this.cols;
        const data = this.data;
        const SBOX = GF.SBOX;
        let pivotRow = 0;
        const maxPivot = Math.min(rows, cols);
        for (let col = 0; col < maxPivot && pivotRow < rows; col++) {
            const maxRow = this._findPivot(col, pivotRow, 'first');
            if (maxRow === -1) continue;
            this._swapRows(pivotRow, maxRow);
            const pivotVal = data[pivotRow * cols + col];
            const invPivot = GF.div(1, pivotVal);
            const pOffset = pivotRow * cols;
            for (let i = 0; i < rows; i++) {
                if (i === pivotRow) continue;
                const tOffset = i * cols;
                const targetFactor = data[tOffset + col];
                if (targetFactor === 0) continue;

                // Fused Factor = targetFactor * invPivot
                const fusedFactor = SBOX[(targetFactor << 8) | invPivot];

                // PERFORMANCE CRITICAL: Inner Elimination Loop
                if (fusedFactor === 1) {

                    // Optimization: Vectorized XOR Path (64-bit chunks)
                    const startByte = data.byteOffset + tOffset + col;
                    const alignmentOffset = (8 - (startByte % 8)) % 8;
                    const scalarEnd = Math.min(col + alignmentOffset, cols);
                    for (let k = col; k < scalarEnd; k++) data[tOffset + k] ^= data[pOffset + k];
                    const remaining = cols - scalarEnd;
                    const num64 = Math.floor(remaining / 8);
                    if (num64 > 0) {
                        const p64 = new BigUint64Array(data.buffer, data.byteOffset + pOffset + scalarEnd, num64);
                        const t64 = new BigUint64Array(data.buffer, data.byteOffset + tOffset + scalarEnd, num64);
                        for (let k = 0; k < num64; k++) t64[k] ^= p64[k];
                    }
                    for (let k = scalarEnd + (num64 * 8); k < cols; k++) data[tOffset + k] ^= data[pOffset + k];
                } else {

                    // Factor N Path: S-Box mapping (Unrolled 8-byte chunks)
                    const elimTable = SBOX.subarray(fusedFactor << 8, (fusedFactor << 8) + 256);
                    let k = col;
                    const end = cols - 7;
                    for (; k < end; k += 8) {
                        data[tOffset + k]     ^= elimTable[data[pOffset + k]];
                        data[tOffset + k + 1] ^= elimTable[data[pOffset + k + 1]];
                        data[tOffset + k + 2] ^= elimTable[data[pOffset + k + 2]];
                        data[tOffset + k + 3] ^= elimTable[data[pOffset + k + 3]];
                        data[tOffset + k + 4] ^= elimTable[data[pOffset + k + 4]];
                        data[tOffset + k + 5] ^= elimTable[data[pOffset + k + 5]];
                        data[tOffset + k + 6] ^= elimTable[data[pOffset + k + 6]];
                        data[tOffset + k + 7] ^= elimTable[data[pOffset + k + 7]];
                    }
                    for (; k < cols; k++) data[tOffset + k] ^= elimTable[data[pOffset + k]];
                }
            }
            if (pivotVal !== 1) {
                const normTable = SBOX.subarray(invPivot << 8, (invPivot << 8) + 256);
                for (let k = col; k < cols; k++) data[pOffset + k] = normTable[data[pOffset + k]];
            }
            pivotRow++;
        }
        return pivotRow;
    }

    /**
     * Phase 3: Direct Unrolled (Fused + Zero-Subarray + Pure Scalar)
     */
    solve_direct() {
        const rows = this.rows;
        const cols = this.cols;
        const data = this.data;
        const SBOX = GF.SBOX;
        let pivotRow = 0;
        const maxPivot = Math.min(rows, cols);
        for (let col = 0; col < maxPivot && pivotRow < rows; col++) {
            const maxRow = this._findPivot(col, pivotRow, 'first');
            if (maxRow === -1) continue;
            this._swapRows(pivotRow, maxRow);
            const pOffset = pivotRow * cols;
            const pivotVal = data[pOffset + col];
            const invPivot = GF.div(1, pivotVal);
            for (let i = 0; i < rows; i++) {
                if (i === pivotRow) continue;
                const tOffset = i * cols;
                const targetFactor = data[tOffset + col];
                if (targetFactor === 0) continue;

                // Fused Factor calculation
                const fusedFactor = SBOX[(targetFactor << 8) | invPivot];
                const sboxOffset = fusedFactor << 8;

                // PERFORMANCE: Pure Scalar Unrolled loop (8 bytes)
                // NO subarray() view creation inside the inner loop
                let k = col;
                const end = cols - 7;
                for (; k < end; k += 8) {
                    data[tOffset + k]     ^= SBOX[sboxOffset | data[pOffset + k]];
                    data[tOffset + k + 1] ^= SBOX[sboxOffset | data[pOffset + k + 1]];
                    data[tOffset + k + 2] ^= SBOX[sboxOffset | data[pOffset + k + 2]];
                    data[tOffset + k + 3] ^= SBOX[sboxOffset | data[pOffset + k + 3]];
                    data[tOffset + k + 4] ^= SBOX[sboxOffset | data[pOffset + k + 4]];
                    data[tOffset + k + 5] ^= SBOX[sboxOffset | data[pOffset + k + 5]];
                    data[tOffset + k + 6] ^= SBOX[sboxOffset | data[pOffset + k + 6]];
                    data[tOffset + k + 7] ^= SBOX[sboxOffset | data[pOffset + k + 7]];
                }
                for (; k < cols; k++) {
                    data[tOffset + k] ^= SBOX[sboxOffset | data[pOffset + k]];
                }
            }
            if (pivotVal !== 1) {
                const sboxOffset = invPivot << 8;
                for (let k = col; k < cols; k++) {
                    data[pOffset + k] = SBOX[sboxOffset | data[pOffset + k]];
                }
            }
            pivotRow++;
        }
        return pivotRow;
    }

        /**
         * Default Production Solver (Dynamic Alias)
         */
        solve() {
            return this.solve_direct();
        }

        /**
         * Extracts a full row (Coeffs + Data) from the augmented matrix.
         * @param {number} rowIndex 
         * @returns {Uint8Array}
         */
        getAugmentedRow(rowIndex) {
            const offset = rowIndex * this.cols;
            return this.data.subarray(offset, offset + this.cols);
        }
    }
    module.exports = GaloisMatrix;

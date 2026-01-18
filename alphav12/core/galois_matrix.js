const GF = require('./gf256');

/**
 * ALPHAv10 Galois Matrix
 * Hardened production kernel with stride-based 8-byte alignment.
 */
class GaloisMatrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        
        // v10 Optimization: Stride-based 8-byte padding
        this.stride = (cols + 7) & ~7;
        this.data = new Uint8Array(rows * this.stride);
        this.swapBuf = new Uint8Array(cols);

        // v10 Optimization: Row View Cache (Guaranteed Aligned)
        this.rowViews = new Array(rows);
        for (let i = 0; i < rows; i++) {
            this.rowViews[i] = this.data.subarray(i * this.stride, i * this.stride + cols);
        }
    }

    get(r, c) { return this.data[r * this.stride + c]; }
    set(r, c, val) { this.data[r * this.stride + c] = val; }

    // --- ENCAPSULATED DATA PLANE ---

    /**
     * Maps a coded piece into the matrix row.
     */
    addRow(rowIdx, coeffs, data) {
        const row = this.rowViews[rowIdx];
        row.set(coeffs, 0);
        row.set(data, coeffs.length);
    }

    /**
     * Extracts the symbol data portion of a row.
     */
    extractData(rowIdx, offset) {
        return this.rowViews[rowIdx].subarray(offset);
    }

    /**
     * Performs in-place normalization of a row so the pivot at colIdx becomes 1.
     */
    normalizeRow(rowIdx, colIdx) {
        const row = this.rowViews[rowIdx];
        const val = row[colIdx];
        if (val === 0 || val === 1) return;
        
        const inv = GF.div(1, val);
        this.normalize(row, inv, colIdx);
    }

    // --- KERNEL PRIMITIVES ---

    /**
     * Consolidated Production Solver
     */
    solve() {
        const { rows, cols, stride, data } = this;
        let pivotRow = 0;
        const maxPivot = Math.min(rows, cols);

        for (let col = 0; col < maxPivot && pivotRow < rows; col++) {
            const maxRow = this._findPivot(col, pivotRow);
            if (maxRow === -1) continue;
            this._swapRows(pivotRow, maxRow);
            
            const pOffset = pivotRow * stride;
            const pivotVal = data[pOffset + col];
            const invPivot = GF.div(1, pivotVal);

            // Normalize and Eliminate
            for (let i = 0; i < rows; i++) {
                if (i === pivotRow) continue;
                const tOffset = i * stride;
                const targetFactor = data[tOffset + col];
                if (targetFactor === 0) continue;

                const fusedFactor = GF.SBOX[(targetFactor << 8) | invPivot];
                this.multiplyAdd(this.rowViews[i], this.rowViews[pivotRow], fusedFactor, col);
            }

            if (pivotVal !== 1) {
                this.normalize(this.rowViews[pivotRow], invPivot, col);
            }
            pivotRow++;
        }
        return pivotRow;
    }

    multiplyAdd(target, source, factor, startCol = 0) {
        if (factor === 0) return;
        const SBOX = GF.SBOX;
        const len = target.length;
        let k = startCol;

        if (factor === 1) {
            const startByte = target.byteOffset + k;
            const alignmentOffset = (8 - (startByte % 8)) % 8;
            const scalarEnd = Math.min(k + alignmentOffset, len);
            for (; k < scalarEnd; k++) target[k] ^= source[k];
            
            const num64 = Math.floor((len - k) / 8);
            if (num64 > 0) {
                const t64 = new BigUint64Array(target.buffer, target.byteOffset + k, num64);
                const s64 = new BigUint64Array(source.buffer, source.byteOffset + k, num64);
                for (let i = 0; i < num64; i++) t64[i] ^= s64[i];
                k += num64 * 8;
            }
            for (; k < len; k++) target[k] ^= source[k];
        } else {
            const offset = factor << 8;
            const end = len - 15;
            for (; k < end; k += 16) {
                target[k] ^= SBOX[offset | source[k]];
                target[k+1] ^= SBOX[offset | source[k+1]];
                target[k+2] ^= SBOX[offset | source[k+2]];
                target[k+3] ^= SBOX[offset | source[k+3]];
                target[k+4] ^= SBOX[offset | source[k+4]];
                target[k+5] ^= SBOX[offset | source[k+5]];
                target[k+6] ^= SBOX[offset | source[k+6]];
                target[k+7] ^= SBOX[offset | source[k+7]];
                target[k+8] ^= SBOX[offset | source[k+8]];
                target[k+9] ^= SBOX[offset | source[k+9]];
                target[k+10] ^= SBOX[offset | source[k+10]];
                target[k+11] ^= SBOX[offset | source[k+11]];
                target[k+12] ^= SBOX[offset | source[k+12]];
                target[k+13] ^= SBOX[offset | source[k+13]];
                target[k+14] ^= SBOX[offset | source[k+14]];
                target[k+15] ^= SBOX[offset | source[k+15]];
            }
            for (; k < len; k++) target[k] ^= SBOX[offset | source[k]];
        }
    }

    normalize(target, factor, startCol = 0) {
        if (factor === 1) return;
        const SBOX = GF.SBOX;
        const offset = factor << 8;
        const len = target.length;
        let k = startCol;
        const end = len - 15;

        for (; k < end; k += 16) {
            target[k] = SBOX[offset | target[k]];
            target[k+1] = SBOX[offset | target[k+1]];
            target[k+2] = SBOX[offset | target[k+2]];
            target[k+3] = SBOX[offset | target[k+3]];
            target[k+4] = SBOX[offset | target[k+4]];
            target[k+5] = SBOX[offset | target[k+5]];
            target[k+6] = SBOX[offset | target[k+6]];
            target[k+7] = SBOX[offset | target[k+7]];
            target[k+8] = SBOX[offset | target[k+8]];
            target[k+9] = SBOX[offset | target[k+9]];
            target[k+10] = SBOX[offset | target[k+10]];
            target[k+11] = SBOX[offset | target[k+11]];
            target[k+12] = SBOX[offset | target[k+12]];
            target[k+13] = SBOX[offset | target[k+13]];
            target[k+14] = SBOX[offset | target[k+14]];
            target[k+15] = SBOX[offset | target[k+15]];
        }
        for (; k < len; k++) target[k] = SBOX[offset | target[k]];
    }

    // --- INTERNAL HELPERS ---

    _findPivot(col, startRow) {
        const { rows, stride, data } = this;
        for (let i = startRow; i < rows; i++) {
            if (data[i * stride + col] !== 0) return i;
        }
        return -1;
    }

    _swapRows(rowA, rowB) {
        if (rowA === rowB) return;
        const { stride, data, cols, swapBuf } = this;
        const offsetA = rowA * stride;
        const offsetB = rowB * stride;
        swapBuf.set(data.subarray(offsetA, offsetA + cols));
        data.set(data.subarray(offsetB, offsetB + cols), offsetA);
        data.set(swapBuf, offsetB);
    }

    getAugmentedRow(rowIndex) {
        return this.rowViews[rowIndex];
    }
}

module.exports = GaloisMatrix;

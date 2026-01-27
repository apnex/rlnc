const GF = require('./gf256');

/**
 * ALPHAv13 Scalar Matrix (Control Plane Only)
 * @warden-purpose Scalar byte-wise matrix operations for rank-quantification.
 */
class ScalarMatrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.u8 = new Uint8Array(rows * cols);
    }

    reset() { this.u8.fill(0); }

    getRow(rowIdx) {
        return this.u8.subarray(rowIdx * this.cols, (rowIdx + 1) * this.cols);
    }

    multiplyAdd(tRowIdx, sRowIdx, factor) {
        if (factor === 0) return;
        const target = this.getRow(tRowIdx);
        const source = this.getRow(sRowIdx);
        const SBOX = GF.SBOX_VIEWS[factor];
        for (let i = 0; i < this.cols; i++) {
            target[i] ^= SBOX[source[i]];
        }
    }

    normalizeRow(rowIdx, colIdx) {
        const row = this.getRow(rowIdx);
        const val = row[colIdx];
        if (val === 0 || val === 1) return;
        const inv = GF.div(1, val);
        const SBOX = GF.SBOX_VIEWS[inv];
        for (let i = 0; i < this.cols; i++) {
            row[i] = SBOX[row[i]];
        }
    }
}

module.exports = ScalarMatrix;

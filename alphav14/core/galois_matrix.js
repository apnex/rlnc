const GF = require('./gf256');

/**
 * Finite Field Matrix Primitives - ADDRESS-COUPLED (HARDENED)
 * @version 7.1.1 - NUCLEAR-SOVEREIGN (HOISTED)
 * @pillar Pillar 1: Truth in Memory
 */
class GaloisMatrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        // Strict 64-byte alignment for cache-line stability
        this.stride = (cols + 63) & ~63;
        this.bufferSize = rows * this.stride;
        
        const sab = new SharedArrayBuffer(this.bufferSize);
        this.bind(sab, 0);
    }

    /**
     * Anchor 1: Bind sovereign views to the SDB coordinates.
     */
    bind(buffer, baseOffset = 0) {
        this.buffer = buffer;
        this.baseOffset = baseOffset;
        this.u8 = new Uint8Array(buffer, baseOffset);
        
        this.rowViews = new Array(this.rows);
        for (let i = 0; i < this.rows; i++) {
            this.rowViews[i] = this.u8.subarray(i * this.stride, i * this.stride + this.cols);
        }
    }

    getAugmentedRow(rowIndex) { return this.rowViews[rowIndex]; }
    getRowOffset(rowIndex) { return rowIndex * this.stride; }
    reset() { this.u8.fill(0, 0, this.bufferSize); }

    /**
     * @pillar Pillar 2: Sovereignty
     */
    solve(recipe, sourceMatrix) {
        const N = recipe.rows;
        const SBOX_VIEWS = GF.SBOX_VIEWS;

        for (let i = 0; i < N; i++) {
            const recipeRow = recipe.getAugmentedRow(i);
            const target_off = this.getRowOffset(i);
            this.u8.fill(0, target_off, target_off + this.cols);

            for (let j = 0; j < N; j++) {
                const factor = recipeRow[j];
                if (factor === 0) continue;
                const source_off = sourceMatrix.getRowOffset(j);
                this._legacy_multiplyAdd(target_off, source_off, factor, SBOX_VIEWS[factor], this.cols, sourceMatrix.u8);
            }
        }
    }

    _legacy_multiplyAdd(tOff, sOff, factor, SBOX_VIEW, len, sourceU8 = null) {
        const u8 = this.u8;
        const sU8 = sourceU8 || this.u8;
        let k = 0;

        if (factor === 1) {
            const end = len - 15;
            for (; k < end; k += 16) {
                u8[tOff + k] ^= sU8[sOff + k]; u8[tOff + k+1] ^= sU8[sOff + k+1];
                u8[tOff + k+2] ^= sU8[sOff + k+2]; u8[tOff + k+3] ^= sU8[sOff + k+3];
                u8[tOff + k+4] ^= sU8[sOff + k+4]; u8[tOff + k+5] ^= sU8[sOff + k+5];
                u8[tOff + k+6] ^= sU8[sOff + k+6]; u8[tOff + k+7] ^= sU8[sOff + k+7];
                u8[tOff + k+8] ^= sU8[sOff + k+8]; u8[tOff + k+9] ^= sU8[sOff + k+9];
                u8[tOff + k+10] ^= sU8[sOff + k+10]; u8[tOff + k+11] ^= sU8[sOff + k+11];
                u8[tOff + k+12] ^= sU8[sOff + k+12]; u8[tOff + k+13] ^= sU8[sOff + k+13];
                u8[tOff + k+14] ^= sU8[sOff + k+14]; u8[tOff + k+15] ^= sU8[sOff + k+15];
            }
            for (; k < len; k++) u8[tOff + k] ^= sU8[sOff + k];
        } else {
            const end = len - 15;
            for (; k < end; k += 16) {
                u8[tOff + k] ^= SBOX_VIEW[sU8[sOff + k]]; u8[tOff + k+1] ^= SBOX_VIEW[sU8[sOff + k+1]];
                u8[tOff + k+2] ^= SBOX_VIEW[sU8[sOff + k+2]]; u8[tOff + k+3] ^= SBOX_VIEW[sU8[sOff + k+3]];
                u8[tOff + k+4] ^= SBOX_VIEW[sU8[sOff + k+4]]; u8[tOff + k+5] ^= SBOX_VIEW[sU8[sOff + k+5]];
                u8[tOff + k+6] ^= SBOX_VIEW[sU8[sOff + k+6]]; u8[tOff + k+7] ^= SBOX_VIEW[sU8[sOff + k+7]];
                u8[tOff + k+8] ^= SBOX_VIEW[sU8[sOff + k+8]]; u8[tOff + k+9] ^= SBOX_VIEW[sU8[sOff + k+9]];
                u8[tOff + k+10] ^= SBOX_VIEW[sU8[sOff + k+10]]; u8[tOff + k+11] ^= SBOX_VIEW[sU8[sOff + k+11]];
                u8[tOff + k+12] ^= SBOX_VIEW[sU8[sOff + k+12]]; u8[tOff + k+13] ^= SBOX_VIEW[sU8[sOff + k+13]];
                u8[tOff + k+14] ^= SBOX_VIEW[sU8[sOff + k+14]]; u8[tOff + k+15] ^= SBOX_VIEW[sU8[sOff + k+15]];
            }
            for (; k < len; k++) u8[tOff + k] ^= SBOX_VIEW[sU8[sOff + k]];
        }
    }

    normalizeRow(rowOff, colOff) {
        const u8 = this.u8;
        const val = u8[rowOff + colOff];
        if (val === 0 || val === 1) return;
        const inv = GF.div(1, val);
        const SBOX_VIEW = GF.SBOX_VIEWS[inv];
        const len = this.cols;
        const end = len - 15;
        let k = 0;
        for (; k < end; k += 16) {
            u8[rowOff + k] = SBOX_VIEW[u8[rowOff + k]]; u8[rowOff + k+1] = SBOX_VIEW[u8[rowOff + k+1]];
            u8[rowOff + k+2] = SBOX_VIEW[u8[rowOff + k+2]]; u8[rowOff + k+3] = SBOX_VIEW[u8[rowOff + k+3]];
            u8[rowOff + k+4] = SBOX_VIEW[u8[rowOff + k+4]]; u8[rowOff + k+5] = SBOX_VIEW[u8[rowOff + k+5]];
            u8[rowOff + k+6] = SBOX_VIEW[u8[rowOff + k+6]]; u8[rowOff + k+7] = SBOX_VIEW[u8[rowOff + k+7]];
            u8[rowOff + k+8] = SBOX_VIEW[u8[rowOff + k+8]]; u8[rowOff + k+9] = SBOX_VIEW[u8[rowOff + k+9]];
            u8[rowOff + k+10] = SBOX_VIEW[u8[rowOff + k+10]]; u8[rowOff + k+11] = SBOX_VIEW[u8[rowOff + k+11]];
            u8[rowOff + k+12] = SBOX_VIEW[u8[rowOff + k+12]]; u8[rowOff + k+13] = SBOX_VIEW[u8[rowOff + k+13]];
            u8[rowOff + k+14] = SBOX_VIEW[u8[rowOff + k+14]]; u8[rowOff + k+15] = SBOX_VIEW[u8[rowOff + k+15]];
        }
        for (; k < len; k++) u8[rowOff + k] = SBOX_VIEW[u8[rowOff + k]];
    }

    /**
     * @pillar Pillar 5: Declarative Governance
     * @duty Sovereign Gateway for Topologically Agnostic Math.
     */
    static fuse(manifest, adapter, targetHandle, sourceHandles) {
        const u8 = new Uint8Array(adapter.pcb.sab);
        const pieceSize = adapter.get('FLOW_PIECE_SIZE') | 0;
        const tOff = adapter.resolvePieceOffset(targetHandle);
        const N = sourceHandles.length;
        const sOffs = new Int32Array(N);
        for (let i = 0; i < N; i++) sOffs[i] = adapter.resolvePieceOffset(sourceHandles[i]);

        this._execute_fuse(u8, pieceSize, tOff, manifest, sOffs);
    }

    /**
     * TIER 1/2 HOISTED MASS BURN
     */
    static massBurn(manifestMatrix, adapter, targetHandles, sourceHandles) {
        const t0 = performance.now();
        const u8 = new Uint8Array(adapter.pcb.sab); // TIER 1: Gen-Level Hoist
        const pieceSize = adapter.get('FLOW_PIECE_SIZE') | 0;
        const N = sourceHandles.length;
        const BATCH_SIZE = 7;

        // TIER 2: Block-Level Hoist (Source Slab)
        const sOffs = new Int32Array(N);
        for (let i = 0; i < N; i++) sOffs[i] = adapter.resolvePieceOffset(sourceHandles[i]);

        for (let b = 0; b < BATCH_SIZE; b++) {
            const h = targetHandles[b];
            if (h === -1) continue;
            const tOff = adapter.resolvePieceOffset(h);
            const manifest = manifestMatrix.subarray(b * N, (b + 1) * N);
            
            // TIER 3: Kernel Execution
            this._execute_fuse(u8, pieceSize, tOff, manifest, sOffs);
        }
        adapter.pulseFabricTime((performance.now() - t0) * 1000);
    }

    /**
     * TIER 3: NUCLEAR FUSION KERNEL (ZERO ADMIN)
     */
    static _execute_fuse(u8, len, tOff, manifest, sOffs) {
        const N = manifest.length;
        const SBOX_VIEWS = GF.SBOX_VIEWS;

        let firstIdx = -1;
        for (let i = 0; i < N; i++) {
            if (manifest[i] !== 0) { firstIdx = i; break; }
        }

        if (firstIdx === -1) {
            u8.fill(0, tOff, tOff + len);
            return;
        }

        // First-Strike
        const f1 = manifest[firstIdx];
        const sOff1 = sOffs[firstIdx];
        if (f1 === 1) {
            u8.set(u8.subarray(sOff1, sOff1 + len), tOff);
        } else {
            const SBOX = SBOX_VIEWS[f1];
            let k = 0; const end = len - 15;
            for (; k < end; k += 16) {
                u8[tOff + k] = SBOX[u8[sOff1 + k]]; u8[tOff + k+1] = SBOX[u8[sOff1 + k+1]];
                u8[tOff + k+2] = SBOX[u8[sOff1 + k+2]]; u8[tOff + k+3] = SBOX[u8[sOff1 + k+3]];
                u8[tOff + k+4] = SBOX[u8[sOff1 + k+4]]; u8[tOff + k+5] = SBOX[u8[sOff1 + k+5]];
                u8[tOff + k+6] = SBOX[u8[sOff1 + k+6]]; u8[tOff + k+7] = SBOX[u8[sOff1 + k+7]];
                u8[tOff + k+8] = SBOX[u8[sOff1 + k+8]]; u8[tOff + k+9] = SBOX[u8[sOff1 + k+9]];
                u8[tOff + k+10] = SBOX[u8[sOff1 + k+10]]; u8[tOff + k+11] = SBOX[u8[sOff1 + k+11]];
                u8[tOff + k+12] = SBOX[u8[sOff1 + k+12]]; u8[tOff + k+13] = SBOX[u8[sOff1 + k+13]];
                u8[tOff + k+14] = SBOX[u8[sOff1 + k+14]]; u8[tOff + k+15] = SBOX[u8[sOff1 + k+15]];
            }
            for (; k < len; k++) u8[tOff + k] = SBOX[u8[sOff1 + k]];
        }

        // Fusion Pass
        for (let i = firstIdx + 1; i < N; i++) {
            const factor = manifest[i];
            if (factor === 0) continue;
            const sOff = sOffs[i];
            const SBOX = SBOX_VIEWS[factor];
            
            let k = 0; const end = len - 15;
            if (factor === 1) {
                for (; k < end; k += 16) {
                    u8[tOff + k] ^= u8[sOff + k]; u8[tOff + k+1] ^= u8[sOff + k+1];
                    u8[tOff + k+2] ^= u8[sOff + k+2]; u8[tOff + k+3] ^= u8[sOff + k+3];
                    u8[tOff + k+4] ^= u8[sOff + k+4]; u8[tOff + k+5] ^= u8[sOff + k+5];
                    u8[tOff + k+6] ^= u8[sOff + k+6]; u8[tOff + k+7] ^= u8[sOff + k+7];
                    u8[tOff + k+8] ^= u8[sOff + k+8]; u8[tOff + k+9] ^= u8[sOff + k+9];
                    u8[tOff + k+10] ^= u8[sOff + k+10]; u8[tOff + k+11] ^= u8[sOff + k+11];
                    u8[tOff + k+12] ^= u8[sOff + k+12]; u8[tOff + k+13] ^= u8[sOff + k+13];
                    u8[tOff + k+14] ^= u8[sOff + k+14]; u8[tOff + k+15] ^= u8[sOff + k+15];
                }
                for (; k < len; k++) u8[tOff + k] ^= u8[sOff + k];
            } else {
                for (; k < end; k += 16) {
                    u8[tOff + k] ^= SBOX[u8[sOff + k]]; u8[tOff + k+1] ^= SBOX[u8[sOff + k+1]];
                    u8[tOff + k+2] ^= SBOX[u8[sOff + k+2]]; u8[tOff + k+3] ^= SBOX[u8[sOff + k+3]];
                    u8[tOff + k+4] ^= SBOX[u8[sOff + k+4]]; u8[tOff + k+5] ^= SBOX[u8[sOff + k+5]];
                    u8[tOff + k+6] ^= SBOX[u8[sOff + k+6]]; u8[tOff + k+7] ^= SBOX[u8[sOff + k+7]];
                    u8[tOff + k+8] ^= SBOX[u8[sOff + k+8]]; u8[tOff + k+9] ^= SBOX[u8[sOff + k+9]];
                    u8[tOff + k+10] ^= SBOX[u8[sOff + k+10]]; u8[tOff + k+11] ^= SBOX[u8[sOff + k+11]];
                    u8[tOff + k+12] ^= SBOX[u8[sOff + k+12]]; u8[tOff + k+13] ^= SBOX[u8[sOff + k+13]];
                    u8[tOff + k+14] ^= SBOX[u8[sOff + k+14]]; u8[tOff + k+15] ^= SBOX[u8[sOff + k+15]];
                }
                for (; k < len; k++) u8[tOff + k] ^= SBOX[u8[sOff + k]];
            }
        }
    }
}

module.exports = GaloisMatrix;
module.exports.BATCH_SIZE = 7; 

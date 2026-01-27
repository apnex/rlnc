const GF = require('./gf256');

/**
 * ALPHAv13 Quadrant Matrix Engine (SWAR-Optimized)
 * @warden-purpose High-Velocity 32-bit SWAR (SIMD Within A Register) Physics Engine.
 * @pillar Pillar 2: Sovereignty (Alternative Physics)
 */
class QuadrantMatrix {
    constructor() {
        // Static initialization of the 4 Quadrant Tables
        // Q0: val * f (Shift 0)
        // Q1: val * f (Shift 8)
        // Q2: val * f (Shift 16)
        // Q3: val * f (Shift 24)
        if (!QuadrantMatrix.Q_TABLES) {
            QuadrantMatrix.initQuadrants();
        }
    }

    static initQuadrants() {
        // 4 Tables, each 256 factors * 256 values = 65536 entries (256KB total size * 4 bytes per entry = 1MB)
        // Wait, Uint32Array elements are 4 bytes. 
        // We need a lookup: Table[Factor][ByteVal] -> Result(Uint32)
        // Structure: 256 arrays (one per factor), each length 256.
        // Actually, for performance, we want flat arrays per factor.
        // Q_VIEWS[factor] -> Uint32Array(256) where index is the byte value.
        
        // Let's stick to the structure of SBOX_VIEWS in GF256 but expanded.
        // Q_VIEWS[factor] = { q0: Uint32Array(256), q1: Uint32Array(256), ... }
        
        QuadrantMatrix.Q_VIEWS = new Array(256);
        
        const scratch = new Uint8Array(4);
        const scratch32 = new Uint32Array(scratch.buffer);

        for (let f = 0; f < 256; f++) {
            const q0 = new Uint32Array(256);
            const q1 = new Uint32Array(256);
            const q2 = new Uint32Array(256);
            const q3 = new Uint32Array(256);

            for (let v = 0; v < 256; v++) {
                const res = GF.mul(v, f);
                
                // Q0: Byte 0 (No shift)
                scratch32[0] = 0; scratch[0] = res; q0[v] = scratch32[0];
                
                // Q1: Byte 1 (Shift 8)
                scratch32[0] = 0; scratch[1] = res; q1[v] = scratch32[0];
                
                // Q2: Byte 2 (Shift 16)
                scratch32[0] = 0; scratch[2] = res; q2[v] = scratch32[0];
                
                // Q3: Byte 3 (Shift 24)
                scratch32[0] = 0; scratch[3] = res; q3[v] = scratch32[0];
            }

            QuadrantMatrix.Q_VIEWS[f] = { q0, q1, q2, q3 };
        }
        
        QuadrantMatrix.Q_TABLES = true;
    }

    /**
     * Fuses source data into target using Quadrant SWAR logic.
     * @param {Uint8Array} manifest - Coefficient list.
     * @param {AetherAdapter} adapter - Access to SDB.
     * @param {number} targetHandle - SDB Handle.
     * @param {Array<number>} sourceHandles - SDB Handles.
     */
    static fuse(manifest, adapter, targetHandle, sourceHandles) {
        if (!this.Q_TABLES) this.initQuadrants();

        const sab = adapter.pcb.sab; // Raw SharedArrayBuffer
        const pieceSize = adapter.get('FLOW_PIECE_SIZE') | 0;
        
        // Resolve Offsets
        const tOff = adapter.resolvePieceOffset(targetHandle);
        const N = sourceHandles.length;
        const sOffs = new Int32Array(N);
        for (let i = 0; i < N; i++) sOffs[i] = adapter.resolvePieceOffset(sourceHandles[i]);

        this._execute_quadrant_fuse(sab, pieceSize, tOff, manifest, sOffs);
    }

    static _execute_quadrant_fuse(sab, len, tOff, manifest, sOffs) {
        const N = manifest.length;
        
        // Identify First Strike
        let firstIdx = -1;
        for (let i = 0; i < N; i++) {
            if (manifest[i] !== 0) { firstIdx = i; break; }
        }

        if (firstIdx === -1) {
            new Uint8Array(sab, tOff, len).fill(0);
            return;
        }

        // --- 1. First Strike (Initialization) ---
        // We can treat this as a standard copy or multiply. 
        // For simplicity and alignment safety, we'll use 32-bit copy if aligned, or fallback.
        // Assuming len is multiple of 4 (Constraint check?)
        // Standard pieces are 1024, so aligned.
        
        const f1 = manifest[firstIdx];
        const sOff1 = sOffs[firstIdx];
        
        const tView32 = new Uint32Array(sab, tOff, len / 4);
        const sView32 = new Uint32Array(sab, sOff1, len / 4);
        
        if (f1 === 1) {
            tView32.set(sView32);
        } else {
            const { q0, q1, q2, q3 } = this.Q_VIEWS[f1];
            for (let k = 0; k < tView32.length; k++) {
                const val = sView32[k];
                // Extract bytes manually or use the Q-logic?
                // JS Bitwise ops operate on 32-bit signed ints.
                // val is unsigned 32-bit.
                
                const b0 = val & 0xFF;
                const b1 = (val >>> 8) & 0xFF;
                const b2 = (val >>> 16) & 0xFF;
                const b3 = (val >>> 24); // Zero-fill right shift
                
                tView32[k] = q0[b0] ^ q1[b1] ^ q2[b2] ^ q3[b3];
            }
        }

        // --- 2. Fusion Pass (Accumulation) ---
        for (let i = firstIdx + 1; i < N; i++) {
            const factor = manifest[i];
            if (factor === 0) continue;
            
            const sOff = sOffs[i];
            const sViewLoop = new Uint32Array(sab, sOff, len / 4);
            
            if (factor === 1) {
                for (let k = 0; k < tView32.length; k++) {
                    tView32[k] ^= sViewLoop[k];
                }
            } else {
                const { q0, q1, q2, q3 } = this.Q_VIEWS[factor];
                for (let k = 0; k < tView32.length; k++) {
                    const val = sViewLoop[k];
                    const b0 = val & 0xFF;
                    const b1 = (val >>> 8) & 0xFF;
                    const b2 = (val >>> 16) & 0xFF;
                    const b3 = (val >>> 24);
                    
                    tView32[k] ^= (q0[b0] ^ q1[b1] ^ q2[b2] ^ q3[b3]);
                }
            }
        }
    }
    
    // API Parity with GaloisMatrix
    static massBurn(manifestMatrix, adapter, targetHandles, sourceHandles) {
         // Re-implement massBurn using the quadrant logic if needed
         // For now, let's focus on fuse parity.
         // MassBurn logic is just a loop over fuse in batches.
         const t0 = performance.now();
         const BATCH_SIZE = 7; // Matching GaloisMatrix
         const N = sourceHandles.length;
         
         const pieceSize = adapter.get('FLOW_PIECE_SIZE') | 0;
         const sab = adapter.pcb.sab;
         
         const sOffs = new Int32Array(N);
         for (let i = 0; i < N; i++) sOffs[i] = adapter.resolvePieceOffset(sourceHandles[i]);

         for (let b = 0; b < BATCH_SIZE; b++) {
             const h = targetHandles[b];
             if (h === -1) continue;
             const tOff = adapter.resolvePieceOffset(h);
             const manifest = manifestMatrix.subarray(b * N, (b + 1) * N);
             
             this._execute_quadrant_fuse(sab, pieceSize, tOff, manifest, sOffs);
         }
         adapter.pulseFabricTime((performance.now() - t0) * 1000);
    }
}

module.exports = QuadrantMatrix;

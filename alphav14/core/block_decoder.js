const ScalarMatrix = require('./scalar_matrix');
const GaloisMatrix = require('./galois_matrix');
const QuadrantMatrix = require('./quadrant_matrix');

/**
 * ALPHAv13 Bit-Sovereign Block Decoder (APPLIANCE)
 * @warden-purpose Stateless data restoration via Control/Data separation.
 * @pillar Pillar 2: Sovereignty
 */
class BlockDecoder {
    constructor(adapter, config) {
        this.adapter = adapter;
        this.pieceCount = config.PIECE_COUNT;
        this.pieceSize = config.PIECE_SIZE;
        
        // Select Matrix Kernel (Sovereign Injection)
        this.Matrix = config.MATH_KERNEL === 'QUADRANT' ? QuadrantMatrix : GaloisMatrix;

        // --- Control Plane: Scalar Byte Logic ---
        this.ctrlAppliance = new ScalarMatrix(this.pieceCount + 1, this.pieceCount * 2);
        this.ingestRowIdx = this.pieceCount;
        
        // Physical handles for ingress pieces
        this.dataHandles = new Int32Array(this.pieceCount).fill(-1);
        this.decodedHandles = new Int32Array(this.pieceCount).fill(-1);

        this.rank = 0;
        this.solved = false;
        this.pivotRowMap = new Int32Array(this.pieceCount).fill(-1);
    }

    reset() {
        this.ctrlAppliance.reset();
        // Release data handles if they were reserved (Ownership Law)
        for (let i = 0; i < this.pieceCount; i++) {
            if (this.dataHandles[i] !== -1) this.adapter.releasePiece(this.dataHandles[i]);
            if (this.decodedHandles[i] !== -1) this.adapter.releasePiece(this.decodedHandles[i]);
        }
        this.dataHandles.fill(-1);
        this.decodedHandles.fill(-1);
        this.rank = 0;
        this.solved = false;
        this.pivotRowMap.fill(-1);
    }

    /**
     * Ingest a piece handle and update the Control Plane.
     * @param {number} handle - Opaque handle to the piece.
     * @param {Uint8Array} coeffs - Coefficient DNA for this piece.
     */
    addPiece(handle, coeffs) {
        if (this.solved) return true;
        const { pieceCount, ctrlAppliance, pivotRowMap, ingestRowIdx } = this;
        const ingestView = ctrlAppliance.getRow(ingestRowIdx);

        // 1. Load DNA into Ingest Row
        ingestView.fill(0);
        ingestView.set(coeffs, 0); 
        ingestView[pieceCount + this.rank] = 1; // Augment with Identity

        // 2. Control Plane: Gaussian Elimination (Scalar)
        for (let i = 0; i < pieceCount; i++) {
            const factor = ingestView[i];
            if (factor === 0) continue;

            const pIdx = pivotRowMap[i];
            if (pIdx === -1) {
                // Found a new dimension (Innovation)
                const targetIdx = this.rank++;
                this.dataHandles[targetIdx] = handle;
                
                const pView = ctrlAppliance.getRow(targetIdx);
                pView.set(ingestView);
                
                // Scalar Row Normalization
                ctrlAppliance.normalizeRow(targetIdx, i);
                
                pivotRowMap[i] = targetIdx;
                
                if (this.rank === pieceCount) return this._finalize();
                return false;
            } else {
                // Elimination pass
                ctrlAppliance.multiplyAdd(ingestRowIdx, pIdx, factor);
            }
        }
        return false;
    }

    /**
     * The Tiled-Batch Mass Burn: Restores the entire block in batches of 7.
     */
    _finalize() {
        const { pieceCount, ctrlAppliance, pivotRowMap } = this;
        
        // 1. Back-Substitution (Scalar) - DNA Plane only
        for (let i = pieceCount - 1; i >= 0; i--) {
            const pIdx = pivotRowMap[i];
            for (let j = 0; j < i; j++) {
                const tIdx = pivotRowMap[j];
                const factor = ctrlAppliance.getRow(tIdx)[i];
                if (factor === 0) continue;
                ctrlAppliance.multiplyAdd(tIdx, pIdx, factor);
            }
        }

        // 2. Data Plane Restoration (APEX Mass Burn)
        const BATCH_SIZE = GaloisMatrix.BATCH_SIZE;
        for (let bBase = 0; bBase < pieceCount; bBase += BATCH_SIZE) {
            const currentBatch = Math.min(BATCH_SIZE, pieceCount - bBase);
            const manifestMatrix = new Uint8Array(BATCH_SIZE * pieceCount); 
            const targetHandles = new Int32Array(BATCH_SIZE).fill(-1);

            for (let i = 0; i < currentBatch; i++) {
                const rowIdx = bBase + i;
                this.decodedHandles[rowIdx] = this.adapter.reservePiece();
                targetHandles[i] = this.decodedHandles[rowIdx];
                
                const pIdx = pivotRowMap[rowIdx];
                const recipeRow = ctrlAppliance.getRow(pIdx).subarray(pieceCount);
                manifestMatrix.set(recipeRow, i * pieceCount);
            }

            // Execute the Blast Cycle
            this.Matrix.massBurn(manifestMatrix, this.adapter, targetHandles, this.dataHandles);
        }

        this.solved = true;
        return true;
    }

    getData() {
        if (!this.solved) return null;

        const totalSize = this.pieceCount * this.pieceSize;
        const result = new Uint8Array(totalSize);

        // Access the SDB via the Adapter's Sovereign Backplane (pcb)
        // We need the raw SAB view. The Adapter exposes 'pcb.sab'.
        const sabView = new Uint8Array(this.adapter.pcb.sab);

        for (let i = 0; i < this.pieceCount; i++) {
            const handle = this.decodedHandles[i];
            
            // Resolve the physical SDB offset for this handle
            // This enforces Pillar 2: Sovereignty in Access
            const offset = this.adapter.resolvePieceOffset(handle);
            
            // Extract the piece from the SDB
            const pieceView = sabView.subarray(offset, offset + this.pieceSize);
            
            // Copy into the result buffer (Assembly)
            result.set(pieceView, i * this.pieceSize);
        }

        return result;
    }
}

module.exports = BlockDecoder;

# Feature: RLNC v10 Architectural Hardening & Cleanup (FEAT_V10_CLEANUP)

**Status:** IN_PROGRESS
**Concept:** CON-001 (Vectorized S-Box Multiplication Engine - Finalization)
**SQA Anchors:** modularity, maintainability

## 1. Problem Statement
The implementation of the v10 S-Box optimization and the subsequent modular subroutine refactoring in `GaloisMatrix` has rendered several legacy methods and local allocations obsolete. These artifacts increase the memory footprint and cognitive complexity of the codebase.

## 2. Technical Refinements

### 2.1 API Hardening (`core/gf256_v10.js`)
*   **Action:** Deprecate and remove `add()` and `sub()` exports.
*   **Rationale:** Every component in the v10 stack now uses raw bitwise XOR (`^`) for these operations to eliminate function call overhead. Centralizing the API on `SBOX` and `div()` simplifies the mathematical interface.

### 2.2 Encapsulation Uplift (`core/galois_matrix_v10.js`)
*   **Action:** Implement `getAugmentedRow(rowIndex)` and `getCoefficients(rowIndex)` helper methods.
*   **Rationale:** Currently, the Decoder manually calculates 1D offsets to extract data. Moving this into the Matrix component ensures that the internal storage structure (1D flattened array) remains an implementation detail.

### 2.3 Decoder Optimization (`core/block_decoder_v10.js`)
*   **Action:** 
    1.  Remove `require('./gf256_v10')`.
    2.  Delete `this.swapBuf` from the constructor.
    3.  Refactor `getData()` to use the Matrix helper methods.
*   **Rationale:** The Decoder is now a "State Controller." It should have zero knowledge of Galois math and zero unused memory allocations.

### 2.4 Encoder Tightening (`core/block_encoder_v10.js`)
*   **Action:** Audit and remove unused legacy math imports.

## 3. Implementation Plan
1.  **Phase 1:** Harden `gf256_v10.js` API.
2.  **Phase 2:** Implement encapsulation helpers in `galois_matrix_v10.js`.
3.  **Phase 3:** Strip legacy dependencies and buffers from `block_decoder_v10.js`.
4.  **Phase 4:** Perform final 4-way comparative profile to ensure zero performance regression from cleanup.

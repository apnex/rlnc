# Feature: v10 Optimized Module Promotion (FEAT_MODULE_PROMOTION)

**Status:** APPROVED
**Concept:** CON-001 (Vectorized S-Box Optimization - Promotion)
**SQA Anchors:** reliability, modularity

## 1. Problem Statement
The v10 optimizations currently reside in suffixed files (`*_v10.js`), which requires internal projects and tests to use non-standard import paths. To complete the architectural evolution, these optimizations must be promoted to the primary module names.

## 2. Technical Execution: The "Double-Swap" Rotation

### 2.1 File Rotation
1.  **Legacy preservation:** 
    *   `core/gf256.js` -> `core/gf256_v8.js`
    *   `core/galois_matrix.js` -> `core/galois_matrix_v8.js`
    *   `core/block_encoder.js` -> `core/block_encoder_v8.js`
    *   `core/block_decoder.js` -> `core/block_decoder_v8.js`
2.  **Mainline promotion:** 
    *   `core/gf256_v10.js` -> `core/gf256.js`
    *   `core/galois_matrix_v10.js` -> `core/galois_matrix.js`
    *   `core/block_encoder_v10.js` -> `core/block_encoder.js`
    *   `core/block_decoder_v10.js` -> `core/block_decoder.js`

### 2.2 Dependency Realignment
*   **Production Code:** All `require()` calls in the new mainline modules will be updated to point to the standard names (e.g., `require('./gf256')` instead of `require('./gf256_v10')`).
*   **Test Code:** The 4-way comparative profiler will be updated to compare the new `Mainline` (v10) against the new `v8` (Legacy).

## 3. Implementation Plan
1.  **Phase 1:** Perform the file renames.
2.  **Phase 2:** Update internal requirements in the core modules.
3.  **Phase 3:** Update the comparative profiler.
4.  **Phase 4:** Execute verification suite to confirm mainline success.

## 4. Success Criteria
*   100% test pass rate for `tests/verify_math.js`.
*   `core/verify_coders.js` reports v10-level performance (>100 MB/s).
*   Zero missing dependency errors in the project root.

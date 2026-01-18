# Feature: Architectural Cleanup & Consolidation (FEAT_V10_CLEANUP)

**Status:** IN-PLAN
**Concept:** [CON-001](../concepts/CON-001_Vectorized_SBOX_Optimization.md)
**SQA Anchors:** simplicity, modularity, maintainability

## 1. Problem Statement
The RLNC core math components (`GaloisMatrix` and `BlockDecoder`) have accumulated significant experimental bloat and logic leakage during the v11 development cycle. Multiple experimental solvers exist in production code, and the decoder has become overly aware of the matrix's internal memory layout, hindering long-term maintainability and readability.

## 2. Technical Solution
Dramatically simplify the core architecture by purging all non-production solvers and centralizing all row-level operations within a hardened `GaloisMatrix` API.

### 2.1 Component: `GaloisMatrix` (硬化 Hardened Math Kernel)
*   **Purge:** Remove all `solve_*` variants except for a single, optimized `solve()`.
*   **Unified Primitives:** Hard-code the 16-byte unrolled scalar pattern as the only internal implementation for `multiplyAdd` and `normalize`.
*   **Encapsulated Ingest:** Add `matrix.addRow(targetRowIdx, coeffs, data)` to handle internal offset mapping and padding.

### 2.2 Component: `BlockDecoder` (Pure Protocol State Machine)
*   **Refactor:** Remove all manual `Uint8Array` set operations.
*   **Abstraction:** Use high-level matrix primitives for incremental elimination and back-substitution.

## 3. Implementation Plan
1.  **Code Purge:** Delete all legacy solvers from `GaloisMatrix.js`.
2.  **API Expansion:** Implement `addRow` and `getData(rowIdx)` in `GaloisMatrix`.
3.  **Decoder Realignment:** Update `BlockDecoder.js` to use the new encapsulated API.
4.  **Regression Check:** Re-run the comprehensive stress test suite.

## 4. Success Criteria
*   `GaloisMatrix.js` reduced by >40% lines of code.
*   Decoding performance matches or exceeds the 20ms baseline (16x64KB).
*   100% Hash Parity maintained across all tests.

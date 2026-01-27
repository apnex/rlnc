# Feature: Module Promotion & Architectural Re-alignment (FEAT_MODULE_PROMOTION)

**Status:** IN-PLAN
**Concept:** [CON-001](../concepts/CON-001_Vectorized_SBOX_Optimization.md)
**SQA Anchors:** modularity, maintainability, readability

## 1. Problem Statement
The current v10 architecture contains several duty misalignments. `SlidingWindow` resides in `/core` but manages generations, which is an orchestration concern. `BlockEncoder` is aware of `genId` context, violating its role as an atomic mathematical primitive. These leaks hinder strict modularity and increase architectural debt.

## 2. Technical Solution
Relocate orchestration logic to the threading layer and "atomize" the core math components by removing all context-specific metadata.

### 2.1 Component: `SlidingWindow` (Promotion)
*   **Move:** `core/sliding_window.js` -> `threading/sliding_window.js`.
*   **Purpose:** Centralizes generation-aware state management within the threading/orchestration tier.

### 2.2 Component: `BlockEncoder` (Atomization)
*   **Refactor:** Remove `genId` from constructor and internal logic.
*   **Return Type:** Returns a raw object containing `{ coeffs, data }` or a context-blind `CodedPiece`.
*   **Orchestration:** `GenerationEncoder` assumes the duty of tagging encoded output with the correct `genId`.

## 3. Implementation Plan
1.  **File Migration:** Relocate `sliding_window.js` and update imports in `Engine` and `GenerationEncoder`.
2.  **Kernel Refactor:** Update `BlockEncoder` to be context-blind.
3.  **Worker Realignment:** Update `encoder_worker.js` to handle `genId` tagging during packet emission.
4.  **Verification:** Execute the full test suite to ensure architectural integrity.

## 4. Success Criteria
*   `/core` has zero knowledge of "Generations" or `genId` metadata.
*   System maintains 100% hash parity.
*   Decoding performance remains stable at peak optimized levels.
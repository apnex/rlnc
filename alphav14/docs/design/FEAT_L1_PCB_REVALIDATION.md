# Feature: L1 PCB Revalidation (FEAT_L1_PCB_REVALIDATION)

**Status:** IMPLEMENTED (PCB HAL Edition)
**ID:** FEAT_L1_004
**Concept:** [CON_011](../concepts/CON_011_Persistent_Control_Bus.md)
**SQA Anchors:** reliability, structural_integrity

## 1. Objective
Revalidate the L1 Parity logic by integrating it with the Persistent Control Bus (PCB) HAL. This ensures that block-level fidelity tests utilize the authoritative MMIO interface and the "Born Blind" worker model.

## 2. Technical Solution

### 2.1 Driver Refactor
L1 Parity drivers now utilize the `PersistentControlBus` HAL for all state reporting.
*   **Progress**: Increments `REG_SOLVED_COUNT` upon block completion.
*   **Goodput**: Updates `REG_BYTES_XFER` with processed payload size.
*   **Fidelity**: Updates `REG_VERIFY_CODE` to reflect `MATCH` (2) or `FAIL` (3).
*   **Density**: Stores the calculated `E_RATIO` in `REG_DENSITY` for persistence.

### 2.2 Worker Induction
The L1 worker (or unified `math_worker.js`) inducts its $N$ and $S$ parameters from Segment A.
*   `N` (PieceCount): Determines the block size for parity calculation.
*   `S` (PieceSize): Determines the word size for SIMD operations.

### 2.3 Separation of Duties
The L1 driver is responsible for its own telemetry cleanup before execution. It no longer relies on a high-level `reset()` method in the telemetry object.

## 3. Implementation Status
*   **Phase 1: HAL Integration**: Complete. L1 tests use `PersistentControlBus`.
*   **Phase 2: Born Blind Induction**: Complete. Parameters learned via Segment A.
*   **Phase 3: Density Persistence**: Complete. E_Ratio visible in final TUI frame.

## 4. Success Criteria
*   **L1 Verification**: Final TUI state shows `MATCH`.
*   **Persistence**: Final RANK and E_Ratio persist in the final TUI frame.
*   **Orthogonality**: L1 telemetry does not overwrite other slot registers.

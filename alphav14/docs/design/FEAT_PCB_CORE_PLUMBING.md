# Feature: PCB Core Plumbing (FEAT_PCB_CORE_PLUMBING)

**Status:** COMPLETE (HAL V2)
**ID:** FEAT_PCB_002
**Concept:** [CON_011](../concepts/CON_011_Persistent_Control_Bus.md)
**SQA Anchors:** maintainability, structural_integrity, separation_of_duties

## 1. Objective
Establish the foundational "Plumbing" for the Persistent Control Bus (PCB). This feature delivers the low-level MMIO primitives required for multi-slot coordination and "Born Blind" worker induction.

## 2. Technical Solution (As-Built)

### 2.1 Multi-Slot HAL (`tests/framework/PersistentControlBus.js`)
Refactored from `SharedTelemetry.js` to provide a pure HAL interface.
*   **Stride**: 32 Registers per Slot.
*   **Segment A (Control)**: Base 0.
    *   `REG_PIECE_COUNT`, `REG_PIECE_SIZE`, `REG_TOTAL_GENS`, `REG_STATUS`, `REG_SESSION_ID`.
*   **Segment B (Telemetry)**: Base 8.
    *   `REG_SOLVED_COUNT`, `REG_BYTES_XFER`, `REG_LOAD`, `REG_VERIFY_CODE`, `REG_DENSITY`.
*   **Segment C (Command)**: Base 16.
    *   `REG_SIGNAL`.

### 2.2 Synchronous Induction (`tests/framework/math_worker.js`)
*   Worker waits on `REG_SIGNAL === 1`.
*   Worker performs an authoritative scrape of Segment A (Control) to learn its operating context ($N, S$).
*   Worker updates Segment B (Telemetry) using `atomicAddTelemetry`.

### 2.3 Main Thread TUI (`tests/runner.js`)
*   The Runner acts as the Driver, initializing Segment A and triggering Segment C.
*   The Dashboard performs authoritative scrapes of Segment B for 100% fidelity frames.
*   **Fidelity Guard**: Final scrape performed 500ms after completion to ensure RANK 10/10 is rendered.

## 3. Implementation Verification
*   **Test Scenario**: `L2_128_S` (64MB Payload).
*   **Fidelity**: RANK shows `4/4` (or target count) with 100% frame parity.
*   **Persistence**: `E_RATIO` and `OPS/B` remain visible in the final frame.
*   **SoD**: No math logic in `PersistentControlBus.js`.

## 4. Success Criteria
*   [x] TUI accurately displays the Session ID and RANK (Solved/Total).
*   [x] Progress bar (Ribbon) is byte-scaled for visual consistency.
*   [x] Workers are "Born Blind" (Zero config passed via workerData).
*   [x] Telemetry persists after execution.

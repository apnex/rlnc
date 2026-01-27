# Feature: TUI Pipeline Fidelity (FEAT_TUI_PIPELINE_FIDELITY)

**Status:** IMPLEMENTED (PCB HAL Edition)
**ID:** FEAT_TUI_003
**Concept:** [CON_011](../concepts/CON_011_Persistent_Control_Bus.md)
**SQA Anchors:** observability, structural_integrity, latency_to_insight

## 1. Objective
Achieve 100% frame fidelity in the RLNC Dashboard by transitioning from event-based telemetry to authoritative, zero-yield register scrapes from the Persistent Control Bus (PCB). The dashboard must accurately reflect the final state of the mathematical engine (RANK 10/10) without missing the final completion event.

## 2. Technical Solution

### 2.1 Authoritative Register Scrape
Instead of listening for `done` events, the TUI loop in `tests/runner.js` performs a direct `pcb.getSnapshot(slot)` call on every tick (100ms).
*   **Segment B Priority**: Metrics like `SolvedCount`, `BytesXfer`, and `Density` are pulled directly from the worker's shared registers.
*   **Segment A Context**: Configuration like `TotalGens` and `SessionID` provides the denominator for progress calculation.

### 2.2 Final Scrape Logic (The 100% Frame)
To prevent "early exit" flicker (where the TUI closes before the last update reaches the screen), a **Final Scrape** is performed after the worker signals completion.
1.  Worker sets `REG_SOLVED_COUNT === REG_TOTAL_GENS`.
2.  TUI loop detects completion and breaks.
3.  A 500ms delay is introduced followed by a `finalSnapshot = pcb.getSnapshot(slot)`.
4.  The dashboard is updated one last time with `status: "DONE"`.

### 2.3 Metric Refinement
*   **RANK**: Displayed as `Solved / Total` (e.g., 10/10).
*   **Byte-Scaled Ribbon**: Progress bars are now scaled by `REG_BYTES_XFER` / `Filesize` for visual consistency across different PIECE_SIZE configurations.
*   **Density Metric**: Displays `E_RATIO` for L1 Parity tests or `OPS/B` for L0 Math tests.

## 3. Implementation Status
*   **Phase 1: PCB Integration**: Complete. Dashboard consumes `pcb.getSnapshot()`.
*   **Phase 2: Final Scrape Guard**: Complete. `tests/runner.js` implements the 500ms final update.
*   **Phase 3: Metric Unification**: Complete. RANK and Byte-scaling active.

## 4. Success Criteria
*   **Zero Loss**: Final frame always shows 100% completion.
*   **90° Alignment**: TUI data structures (Ribbon) map 1:1 to PCB slots.
*   **No Ghosting**: Slots transition from `RUNNING` to `DONE` to `IDLE` cleanly.

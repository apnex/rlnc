# Feature: PCB Infrastructure (FEAT_PCB_INFRASTRUCTURE)

**Status:** IMPLEMENTED (HAL V2)
**ID:** FEAT_PCB_001
**Concept:** [CON_011](../concepts/CON_011_Persistent_Control_Bus.md)
**SQA Anchors:** structural_integrity, separation_of_duties, latency_to_insight

## 1. Objective
Implement the multi-slot Persistent Control Bus (PCB) as a pure Hardware Abstraction Layer (HAL). This infrastructure decouples mathematical logic from state management, enabling "Born Blind" workers and 100% fidelity TUI reporting through authoritative MMIO register scrapes.

## 2. Technical Solution

### 2.1 The MMIO Register Map (`PersistentControlBus.js`)
The legacy `SharedTelemetry` has been refactored into the `PersistentControlBus` (PCB). It uses a strictly orthogonal 32-register stride for 90° logical alignment.

*   **Segment A (Control)**: `Slot * 32 + 0`. Stores authoritative config (N, S, Rank Target).
*   **Segment B (Telemetry)**: `Slot * 32 + 8`. Stores persistent metrics (Solved, Bytes, Density, Load).
*   **Segment C (Command)**: `Slot * 32 + 16`. Atomic signals for state transitions (START/STOP).

### 2.2 The 'Born Blind' Worker Protocol (`math_worker.js`)
*   **Induction**: Workers initialize with zero session knowledge. Upon `REG_SIGNAL === 1`, they perform an **Induction Scrape** of Segment A to learn their operational parameters.
*   **Metric Ownership**: Workers are the sole writers to Segment B during active execution.
*   **Duty Cycle**: Drivers (Main Thread) now own the responsibility of clearing Telemetry slots (`clearSlotTelemetry`) before triggering Induction.

### 2.3 Authoritative TUI Pipeline (`tests/runner.js`)
*   **Zero-Yield Scrape**: The TUI performs raw register reads from the PCB to construct its frames.
*   **100% Fidelity**: By scraping Segment B after completion, the TUI ensures the final frame reflects 100% accurate completion states (e.g., RANK 10/10).
*   **Metric Alignment**: `RANK` is now derived from `REG_SOLVED_COUNT` (generations) vs `REG_TOTAL_GENS` (target).

## 3. Implementation Status
*   **Phase 1: HAL Transition**: Complete. `PersistentControlBus.js` implemented with pure MMIO primitives.
*   **Phase 2: Born Blind Workers**: Complete. Workers induct N, S, and Driver Type from registers.
*   **Phase 3: Metric Refinement**: Complete. `REG_DENSITY` supports L0/L1 specific metrics; byte-scaled progress bars active.
*   **Phase 4: Fidelity Hardening**: Complete. TUI loop performs final authoritative scrape on session exit.

## 4. Success Criteria Verification
*   **Orthogonality**: All register offsets are multiples of 8; strides are 32.
*   **SoD**: No mathematical logic exists within the `PersistentControlBus` class.
*   **Fidelity**: Dashboard shows 100% completion (RANK 10/10) on every successful run.

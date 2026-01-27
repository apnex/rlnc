# Feature: HVT Upgrade (FEAT_HVT_UPGRADE)

**Status:** IMPLEMENTED (PCB HAL Edition)
**ID:** FEAT_HVT_001
**Concept:** [CON_009](../concepts/CON_009_High_Velocity_Testing.md)
**SQA Anchors:** performance_efficiency, latency_to_insight, structural_integrity

## 1. Objective
Establish the High-Velocity Testing (HVT) baseline for the RLNC engine. HVT ensures that the observability layer (TUI/Telemetry) does not suppress algorithmic throughput by utilizing zero-yield shared memory registers.

## 2. Technical Solution

### 2.1 Persistent Control Bus (PCB) HAL
*   Replaced legacy unstructured telemetry with the `PersistentControlBus` (PCB).
*   **Zero-Impact Scrapes**: The TUI thread (Main) performs raw register reads from Segment B without locking or messaging the math worker.
*   **Atomic Updates**: Math workers use `Atomics.add` to update `REG_BYTES_XFER` and `REG_SOLVED_COUNT` in real-time.

### 2.2 Math-Priority Orchestration (`tests/runner.js`)
*   The math worker is given maximum CPU affinity by moving all orchestration and UI rendering to the Main thread.
*   **Born Blind Workers**: Workers are spawned with no overhead; they induct their configuration from the PCB once the Driver is ready.

### 2.3 100% Fidelity TUI
*   The TUI achieves high fidelity by scraping the PCB's persistent registers even after the worker has completed its task. This ensures the final frame reflects the full 100% completion (RANK 10/10) regardless of race conditions.

## 3. Implementation Status
*   **Phase 1: HAL Implementation**: Complete. `PersistentControlBus` provides the backbone.
*   **Phase 2: Math Worker Decoupling**: Complete. Workers are "Born Blind".
*   **Phase 3: Fidelity Hardening**: Complete. Final scrape logic ensures 100% accuracy.

## 4. Success Criteria
*   **Throughput**: RLNC core maintains maximum throughput without UI-induced latency.
*   **Observability**: 10Hz TUI refresh with zero impact on the math loop.
*   **Fidelity**: Final frames always show 100% completion.

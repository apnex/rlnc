# Feature: L0 Math Driver (FEAT_L0_MATH_DRIVER)

**Status:** IMPLEMENTED (PCB HAL Edition)
**ID:** FEAT_L0_001
**Concept:** [CON_008](../concepts/CON_008_Unified_Test_Architecture.md)
**SQA Anchors:** robustness, performance_efficiency, structural_integrity

## 1. Objective
Implement the `l0_math` driver to verify GF256 matrix operations within the UTA framework. This driver serves as the computational baseline, verifying mathematical soundness and utilizing the PCB HAL for performance reporting.

## 2. Technical Solution

### 2.1 PCB-Integrated Driver
The L0 Math driver utilizes the `PersistentControlBus` for all performance metrics.
*   **Progress**: Increments `REG_SOLVED_COUNT` after each successful matrix inversion.
*   **Goodput**: Updates `REG_BYTES_XFER` with the size of the solved piece.
*   **Density (OPS/B)**: Stores the calculated computational density (Ops/Byte) in `REG_DENSITY`.
*   **Verification**: Sets `REG_VERIFY_CODE` to `MATCH` (2) upon identity matrix confirmation.

### 2.2 'Born Blind' Integration
L0 workers induct their matrix dimensions ($N$) and PIECE_SIZE ($S$) directly from PCB Segment A. This ensures 1:1 parity between the requested test scenario and the executed code.

### 2.3 Separation of Duties
The L0 driver owns the responsibility of clearing its telemetry slot before execution. It uses the PCB's `clearSlotTelemetry()` method to ensure a clean baseline.

## 3. Implementation Status
*   **Phase 1: Driver Refactor**: Complete. `l0_math` now uses PCB HAL.
*   **Phase 2: Metric Persistence**: Complete. OPS/B and RANK (X/Y) visible in final TUI frame.
*   **Phase 3: Fidelity Hardening**: Complete. 100% completion rendered via final authoritative scrape.

## 4. Success Criteria
*   **Mathematical Parity**: Identity matrix verified for every solve.
*   **Metric Accuracy**: TUI correctly calculates OPS/B from `REG_DENSITY`.
*   **Fidelity**: Final frame always shows 100% (e.g., RANK 100/100).

# Feature: L1 Block Fidelity Driver (FEAT_L1_PARITY_DRIVER)

**Status:** IMPLEMENTED (PCB HAL Edition)
**ID:** FEAT_L1_001
**Concept:** [CON_008](../concepts/CON_008_Unified_Test_Architecture.md)
**SQA Anchors:** robustness, performance_efficiency, structural_integrity

## 1. Objective
Implement the `l1_block_parity` driver to verify the synchronous mapping between raw buffers and RLNC symbols. This driver ensures that the mathematical core maintains 100% bit-fidelity while utilizing the Persistent Control Bus (PCB) for state reporting.

## 2. Technical Solution

### 2.1 PCB-Integrated Driver (`tests/drivers/l1_block_parity.js`)
*   **MMIO Reporting**: The driver uses the `PersistentControlBus` HAL to report progress.
    *   `REG_SOLVED_COUNT`: Tracks completed mathematical generations.
    *   `REG_BYTES_XFER`: Tracks processed payload bytes.
    *   `REG_DENSITY`: Stores the persistent `E_RATIO` metric.
*   **Zero-Allocation**: Utilizes mutable memory buffers to maintain high throughput.
*   **Separation of Duties**: The driver handles its own telemetry clearing via the PCB before execution starts.

### 2.2 TUI Refinement
*   **RANK Display**: The TUI renders `REG_SOLVED_COUNT` / `REG_TOTAL_GENS` to show integer completion.
*   **Byte-Scaling**: Ribbon progress bars are scaled by `REG_BYTES_XFER` / `Filesize`.
*   **E_RATIO**: Displayed prominently for L1 tests to show the coefficient overhead.

## 3. Implementation Status
*   **Phase 1: Driver Implementation**: Complete. `l1_block_parity.js` active.
*   **Phase 2: PCB Integration**: Complete. Uses `PersistentControlBus` HAL.
*   **Phase 3: Fidelity Hardening**: Complete. Final frames show 100% completion (RANK 10/10).

## 4. Success Criteria
*   **Byte-Parity**: 100% hash match on reconstructed payloads.
*   **Fidelity**: Final TUI frame always shows 100% completion.
*   **Persistence**: E_Ratio and RANK remain visible after the worker halts.

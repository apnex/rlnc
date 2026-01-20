# Feature: NetworkSimulator Zero-Copy Hardening (FEAT_SIMULATOR_HARDENING)

**Status:** IN-PLAN
**Concept:** [CON-004](../../registry/concepts/CON_004_Zero_Copy_UDP_Transport.md)
**SQA Anchors:** performance_efficiency, robustness, reliability

## 1. Problem Statement
The `NetworkSimulator` currently supports zero-copy (shared memory) for the RX (incoming) path but relies on legacy Buffer copies for the TX (outgoing) path. This introduces a significant performance bottleneck when impairment simulation is enabled during high-throughput encoding sessions.

## 2. Technical Solution
Implement symmetric zero-copy support in the `NetworkSimulator`.

### 2.1 Component: `Symmetric Zero-Copy Path` (`network/network_simulator.js`)
*   **TX Shared Path:** Update `send()` to detect when a `slotIdx` (number) is passed instead of a `Buffer`.
*   **Atomic Release on Drop:** If the simulator decides to drop a TX shared packet, it must immediately release the slot in the `SharedBufferPool` to prevent pool exhaustion.
*   **Deferred Forwarding:** After the simulated delay, the simulator will call the inner transport's `send()` method using the original `slotIdx`, maintaining zero-copy fidelity.

## 3. Implementation Plan
1.  **Refactor `send()`:** Add logic to handle `(slotIdx, length)` arguments.
2.  **Update `_injectImpairment()`:** 
    *   Introduce `tx_shared` mode.
    *   Implement atomic slot release for dropped TX packets.
    *   Ensure the `setTimeout` callback correctly forwards the `slotIdx` to the inner transport.
3.  **Verification:** Run `tests/t1_throughput.js` with simulator enabled to verify zero-copy performance parity.

## 4. Success Criteria
*   **Zero Copy:** 100% of packets bypass the main-thread heap when the simulator is active.
*   **Pool Integrity:** No "Pool Full" deadlocks caused by leaked slots during simulated packet loss.
*   **Performance:** Measured throughput with simulator enabled matches loopback performance within 10%.

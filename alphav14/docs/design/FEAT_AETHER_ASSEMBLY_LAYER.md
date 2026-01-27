# Feature: Aether Assembly Layer (FEAT_AETHER_ASSEMBLY_LAYER)

---
artifact-uid: FEAT-AETHER-ASM
schema-version: 1.0.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
status: IMPLEMENTED
pillar-anchor: Pillar 4: Symmetric Perception
---

## 1. Executive Summary
This document defines the implementation of the **Aether Assembly Layer**, the final "Egress Drivetrain" of the RLNC engine. It closes the functional loop by enabling the `BlockDecoder` to perform a sovereign, zero-copy extraction of reconstructed data from the Software-Defined Backplane (SDB) into an application-layer buffer. This completes the "Address-Coupled" architecture by providing a symmetric exit for the data inducted by the Ingress Driver.

## 2. Architectural Design: The Egress Bridge
The Assembly Layer is designed as a **Stateless Egress Bridge**. It does not retain data; it merely facilitates the transfer of "Truth" from the SDB to the User.

### 2.1 The Physics of Assembly
1.  **Sovereign Resolution:** The Decoder utilizes the `AetherAdapter` to resolve `decodedHandles` into physical memory offsets.
2.  **Zero-Copy Slicing:** It creates a virtual lens (`Uint8Array.subarray`) over the SDB without copying memory.
3.  **Atomic Copy:** It executes a single `.set()` operation to transfer the payload to the result buffer.

| Component | Role | Memory Domain |
| :--- | :--- | :--- |
| **Ingress Driver** | Loads User Data -> SDB | `Heap -> SDB` |
| **BlockDecoder** | Solves Matrix (Handles only) | `SDB (Logic)` |
| **Assembly Layer** | Extracts SDB -> User Data | `SDB -> Heap` |

## 3. Implementation Logic
The `getData()` method acts as the sole Egress Valve.

```javascript
getData() {
    if (!this.solved) return null;
    // 1. Resolve SDB View
    // 2. Iterate Handles -> Resolve Offsets
    // 3. Copy to Result Buffer
    return result;
}
```

## 4. Constraint Laws
1.  **Law of Statelessness:** Calling `getData()` MUST NOT modify the internal state of the Decoder. It is a read-only operation.
2.  **Law of Sovereignty:** The Decoder MUST NOT access `pcb.sab` directly without resolving offsets via the `AetherAdapter` (ATU).
3.  **Law of Symmetry:** The Egress logic MUST be the exact inverse of the Ingress Driver logic.

## 5. Verification: L1-ASM
The implementation is validated by the `L1-ASM` test suite (`tests/drivers/l1_assembly.js`).

*   **Metric:** Bit-Perfect Reconstruction.
*   **Result:** 131,072 / 131,072 bytes matched.
*   **Fabric State:** `verifyState: MATCH`.

## 6. Visual Psychophysics (VIL)
In the Aether TUI, this layer is represented as the **Blue Flow** returning from the Matrix Core to the User Domain, orthogonal to the Red Control Plane signals.

---
🛡️ **[DLR_AUD_ARTIFACT]** Assembly Layer Master Record Sealed.
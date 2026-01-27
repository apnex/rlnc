# Feature: Aether Nuclear Encoder (FEAT_AETHER_NUCLEAR_ENCODER)

---
artifact-uid: KMS-FEAT-AETHER-ENCODER
schema-version: 1.0.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: DRAFT
status: STABLE-DRAFT
---

## 1. Executive Summary
This document defines the uplift of the `BlockEncoder` into a **Nuclear Appliance**. By eliminating iterative narrative loops and adopting the **Batch-Fusion** model established in the `BlockDecoder`, the encoder will achieve >500 MB/s for coded operations. This implementation enforces the 1:1 parity between mathematical intent (the coefficient manifest) and physical execution (the Trinity Loop).

## 2. Architectural Pivot: The "Nuclear Appliance" Model
The encoder is refactored from an **Imperative Processor** to a **Declarative Engine**.

| Feature | Legacy (Narrative) | Nuclear (Appliance) |
| :--- | :--- | :--- |
| **Logic Flow** | Iterative `if/else` loops. | **Batch Manifest Execution.** |
| **Memory Sync** | Redundant `fill(0)` passes. | **First-Strike Direct Initialization.** |
| **Kernel Depth** | $N$ calls to `multiplyAdd()`. | **Single-Pass Fused Kernel.** |
| **Address Coupling** | Partial. | **Total (U32 Offset Handover).** |

## 3. Physics of Execution: The "Nuclear Burn"
The core mathematical operation is transformed into a single-pass fused kernel within the `GaloisMatrix`.

### 3.1 First-Strike Optimization
To eliminate redundant memory bus operations, the engine identifies the first non-zero coefficient $C_i$. 
*   **Physics (Factor = 1):** `Target.set(Source[i])` replaces `fill(0)` + `multiplyAdd(1)`.
*   **Physics (Factor > 1):** Performs a direct `multiply` (initialization) of `Source[i]` into the `Target` stride, bypassing the `fill(0)` pass.
*   **Strategic Delta:** Reduces memory bus pressure by ~30% per piece by transforming an additive pass into an initialization pass.

### 3.2 The Batch-Encoded Kernel (`encodeNuclear`)
The `GaloisMatrix` is expanded with a `batchEncode` primitive:
```javascript
/**
 * @duty Executes a fused linear combination from a Source Matrix.
 * @param {Uint8Array} coeffs - The N-length coefficient manifest.
 * @param {GaloisMatrix} sourceMatrix - The sovereign data source.
 * @param {number} tOff - Target coordinate in the backplane.
 * @param {number} len - The stride length for the operation.
 */
batchEncode(coeffs, sourceMatrix, tOff, len) {
    // 1. Pre-filter non-zero indices (The Manifest)
    // 2. Perform First-Strike initialization (set or multiply)
    // 3. Execute Fused Trinity Loop over remaining factors (multiplyAdd)
}
```

## 4. Implementation Anchors
1.  **`core/galois_matrix.js`**: Implement `batchEncode()` with SWAR-aware XOR unrolling.
2.  **`core/block_encoder.js`**: Refactor to be a stateless orchestrator that generates manifests and dispatches them to the matrix appliance.
3.  **`infra/aether/AetherAdapter.js`**: Add `PULSE_ENCODE_VELOCITY` and `PULSE_ENCODE_FIRST_STRIKE_MISS` to the telemetry registry.

## 5. ZKE Validation Gates
1.  **L1-ENCODE-VELOCITY**: Coded path velocity must be >100 MB/s (Baseline: 2.6 MB/s).
2.  **L1-BIT-FIDELITY**: 100% parity match between source and reconstructed data.
3.  **L0-ALLOC-AUDIT**: Zero `new` allocations during the `batchEncode` cycle.

---
🛡️ **[DLR_AUD_ARTIFACT]** Nuclear Encoder Stable Draft Sealed.

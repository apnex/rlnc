# Feature: Bit-Sovereign Topology Specification (FEAT_AETHER_BIT_SOVEREIGN_TOPOLOGY)

---
artifact-uid: KMS-FEAT-AETHER-BIT-TOPOLOGY
schema-version: 1.1.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
status: SEALED
---

## 1. Executive Summary
This document defines the physical memory layout for the **Bit-Sovereign Data Plane** within the Aether Software-Defined Backplane (SDB). It mandates the transition from contiguous byte-storage to 8 parallel Bit-Planes, enabling 64-way (implemented as 32-way SMI) SWAR parallelism.

This topology serves as the foundation for the **Aether Memory Networking Plane**, where physical coordinates are routed between appliances to achieve zero-copy data transit.

**Implementation Status:** Turn 2 (INFRA) complete. The data plane is physically refactored into a 128MB bit-interleaved pool managed by the Aether ATU.

## 2. Physical Memory Map (The Mass)
The Data Plane segment of the `SharedArrayBuffer` is refactored into a **Bit-Interleaved Stride**.

### 2.1 Plane Segmentation
The Data Plane is divided into 8 sovereign Bit-Planes. Each plane stores exactly one bit-index (0-7) for every byte in the piece pool.

Note: `DATA_BASE` must be 8-byte (64-bit) aligned to ensure global word-level integrity for all bit-plane stacks.

| Plane Index | Content | Offset Formula | Access Mode |
| :--- | :--- | :--- | :--- |
| **Plane 0** | Bit 0 of all pieces | `DATA_BASE + (0 * PLANE_STRIDE)` | Uint32Array / BigUint64Array |
| **Plane 1** | Bit 1 of all pieces | `DATA_BASE + (1 * PLANE_STRIDE)` | Uint32Array / BigUint64Array |
| **Plane 2** | Bit 2 of all pieces | `DATA_BASE + (2 * PLANE_STRIDE)` | Uint32Array / BigUint64Array |
| **Plane 3** | Bit 3 of all pieces | `DATA_BASE + (3 * PLANE_STRIDE)` | Uint32Array / BigUint64Array |
| **Plane 4** | Bit 4 of all pieces | `DATA_BASE + (4 * PLANE_STRIDE)` | Uint32Array / BigUint64Array |
| **Plane 5** | Bit 5 of all pieces | `DATA_BASE + (5 * PLANE_STRIDE)` | Uint32Array / BigUint64Array |
| **Plane 6** | Bit 6 of all pieces | `DATA_BASE + (6 * PLANE_STRIDE)` | Uint32Array / BigUint64Array |
| **Plane 7** | Bit 7 of all pieces | `DATA_BASE + (7 * PLANE_STRIDE)` | Uint32Array / BigUint64Array |

### 2.2 Address Law (Topology Math)
Let $S$ be the total bytes in a piece. The size of a single plane for that piece is $S/8$. 
The absolute offset for Bit-Plane $P$ of Piece $I$ is calculated as:
$$Offset(P, I) = \text{DATA\_BASE} + (P \times \text{PLANE\_STRIDE}) + (I \times \text{SLICE\_SIZE})$$

**Physical Constants (ALPHAv13 Standard):**
*   `DATA_BASE`: 4096 (Bytes)
*   `PLANE_STRIDE`: 16,777,216 (16MB)
*   `MAX_PIECES`: 1024 (Pieces)
*   `SLICE_SIZE`: 16,384 (Bytes for 128KB Piece)

## 3. Pointer Handover Protocol (PHP)
The Address Translation Unit (ATU) within the `AetherAdapter` abstracts the bit-plane math from the higher-order logic.

### 3.1 PHP Signature: `RESOLVE_PIECE`
Higher-order components exchange an opaque `PIECE_HANDLE` (U32) for a **Nuclear Fragment Descriptor**.

```typescript
interface NuclearFragmentDescriptor {
    planes: BigUint64Array(8); // Array of 8 U64 byte-offsets
    sliceSizeIdx: number;      // S/8 in 64-bit words (e.g., 2048)
}
```

### 3.2 ATU Resolve Logic (Physical Realization)
The Address Translation Unit (ATU) implements the following deterministic pointer resolution, returning raw word-aligned offsets for the 32-bit SMI math kernels.

```javascript
function resolvePieceIndices(handle, outArray) {
    const index = handle - this.SESSION_OFFSET;
    if (index < 0 || index >= this.pcb.MAX_PIECES) throw new SovereigntyError();

    // Word-aligned indices for BigUint64 access
    const dataBaseIdx = this.pcb.OFF_POOL_DAT >> 3; 
    const planeStrideIdx = this.pcb.PLANE_STRIDE >> 3;
    const sliceSizeIdx = this.pcb.SLICE_SIZE >> 3;

    for (let p = 0; p < 8; p++) {
        outArray[p] = dataBaseIdx + (p * planeStrideIdx) + (index * sliceSizeIdx);
    }
    return sliceSizeIdx;
}
```

## 4. SWAR Implementation Anchors
The `GaloisMatrix` (Nuclear Appliance) utilizes the 8 pointers to perform gate-logic burns.

*   **Atomic Pass:** The kernel iterates in word-sized strides.
*   **Gate Logic:** Performs word-parallel XOR/AND/Shift operations across the 8 `Uint32Array` views corresponding to the 8 plane pointers.

## 5. ZKE Verification Gates
1.  **TOPOLOGY-SYNC:** All threads must resolve the same 8 pointers for a given Piece ID.
2.  **U64-ALIGNMENT:** Every plane pointer must satisfy `(ptr % 8) === 0`.
3.  **ZERO-LEAK:** Writing to Plane 0 must not alter bits in Plane 1.

---
🛡️ **[DLR_AUD_ARTIFACT]** Bit-Sovereign Topology fully restored and sealed.

# Feature: Aether Quadrant S-Box (FEAT_AETHER_QUADRANT_SBOX)

---
artifact-uid: FEAT-AETHER-QUADRANT
schema-version: 1.1.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
status: IMPLEMENTED
pillar-anchor: Pillar 2: Sovereignty (Alternative Physics)
---

## 1. Executive Summary
This document serves as the master "As-Built" specification for the **Quadrant S-Box Engine** (`core/quadrant_matrix.js`). This implementation represents a critical evolution in the RLNC kinetic architecture, shifting from **Byte-Scalar** execution to **32-bit SWAR (SIMD Within A Register)** execution.

By exploiting the 32-bit integer registers inherent to the V8 Javascript Engine, this physics kernel achieves a theoretical **4x reduction in memory bus operations** compared to the standard `GaloisMatrix`.

## 2. Mathematical Geometry (The 4 Quadrants)
To achieve vectorization without native SIMD intrinsics, the engine pre-calculates the result of a Galois Field multiplication $GF(2^8)$ shifted into four distinct byte positions within a 32-bit word.

### 2.1 The Quadrant Tables ($Q_{0..3}$)
The system maintains four sovereign lookup tables, each $256 \times 256 \times 4$ bytes (256KB).

*   **$Q_0$ (Byte 0 - LSB):** Contains the result $val \times f$ at bits `[0..7]`.
    *   `0x000000RR`
*   **$Q_1$ (Byte 1):** Contains the result $val \times f$ shifted to bits `[8..15]`.
    *   `0x0000RR00`
*   **$Q_2$ (Byte 2):** Contains the result $val \times f$ shifted to bits `[16..23]`.
    *   `0x00RR0000`
*   **$Q_3$ (Byte 3 - MSB):** Contains the result $val \times f$ shifted to bits `[24..31]`.
    *   `0xRR000000`

### 2.2 Initialization Physics
The tables are lazily initialized upon the first call to `fuse()`.
```javascript
// Initialization Logic
const res = GF.mul(v, f);
q0[v] = res;             // 0x000000RR
q1[v] = res << 8;        // 0x0000RR00
q2[v] = res << 16;       // 0x00RR0000
q3[v] = res << 24;       // 0xRR000000
```

## 3. The SWAR Kernel (Physics of Execution)
The `_execute_quadrant_fuse` method replaces the legacy byte-loop with a 32-bit stride.

### 3.1 The Word-Fetch
Instead of fetching 4 bytes individually (`Load8`), the kernel fetches a single 32-bit word (`Load32`).
```javascript
const val = sView32[k]; // Fetches [B3, B2, B1, B0]
```

### 3.2 The Bitwise Deconstruction
The kernel extracts the 4 constituent bytes using bitwise operations optimized for V8's SMI (Small Integer) representation.
```javascript
const b0 = val & 0xFF;
const b1 = (val >>> 8) & 0xFF;
const b2 = (val >>> 16) & 0xFF;
const b3 = (val >>> 24); // Zero-fill right shift essential for unsigned behavior
```

### 3.3 The Parallel Lookup & Fusion
The kernel performs 4 independent lookups into the Quadrant Tables and XORs the results into a single 32-bit update vector.
```javascript
// Parallel Lookup
const r0 = q0[b0];
const r1 = q1[b1];
const r2 = q2[b2];
const r3 = q3[b3];

// SWAR Fusion
const updateVector = r0 ^ r1 ^ r2 ^ r3;

// Application
tView32[k] ^= updateVector;
```
This reduces the memory write traffic from 4 `Store8` operations to 1 `Store32` operation.

## 4. Architectural Integration
The engine is designed as a **Sovereign Module**, decoupled from the standard `GaloisMatrix`.

*   **File:** `core/quadrant_matrix.js`
*   **API Parity:** Implements static `fuse()` and `massBurn()` identical to `GaloisMatrix`.
*   **Injection Point:** `BlockEncoder` and `BlockDecoder` accept a `MATH_KERNEL` config flag.
    *   `"QUADRANT"` -> Inject `QuadrantMatrix`.
    *   `undefined` -> Default to `GaloisMatrix`.

## 5. Verification & Proofs
The implementation is validated by two specific artifacts:

### 5.1 L0-QUAD (Mathematical Truth)
*   **Driver:** `tests/drivers/l0_quadrant.js`
*   **Scope:** Verifies that `QuadrantMatrix.fuse()` produces bit-identical results to `GaloisMatrix.fuse()` across random vectors and inversions.
*   **Result:** `MATCH` (Bit-Perfect).

### 5.2 L1-ASM-QUAD (Integration Truth)
*   **Driver:** `tests/drivers/l1_assembly_quadrant.js`
*   **Scope:** Verifies the end-to-end lifecycle (Ingress -> Encode -> Decode -> Assembly) using the Quadrant Engine.
*   **Result:** `SUCCESS` (Bit-Perfect Reconstruction).

## 6. Reconstruction Guide for Future ZKEs
To rebuild this feature from scratch:
1.  **Replicate Geometry:** Create 4 `Uint32Array` lookup tables for each of the 256 GF(2^8) factors.
2.  **Verify Endianness:** Ensure the bit-shifts align with the `Uint32Array` little-endian host order (V8 standard).
3.  **Implement Fallback:** Ensure logic exists to handle the "First Strike" (Initialization) separately from the "Fusion Pass" (XOR Accumulation).
4.  **Inject:** Use Dependency Injection in the Coder classes; do not hardcode the import.

---
🛡️ **[DLR_AUD_ARTIFACT]** Quadrant S-Box Master Record Sealed.
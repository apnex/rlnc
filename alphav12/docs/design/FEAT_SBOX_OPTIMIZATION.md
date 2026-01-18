# Feature: High-Performance RLNC v10 Engine (FEAT_SBOX_OPTIMIZATION)

**Status:** RATIFIED & CERTIFIED (Baseline Complete)
**Concept:** [CON-001](concepts/CON-001_Vectorized_SBOX_Optimization.md)
**SQA Anchors:** performance_efficiency, modularity, maintainability, robustness

## 1. Objective
To achieve a 40%+ performance improvement in the RLNC engine by eliminating the 3.4x decoding latency gap identified in the system baseline. This feature refactors the functional mathematical model into a high-performance, vectorized data-lookup model centralized in the `GaloisMatrix` component.

## 2. Experimental Evolution: The 4 Approaches
To identify the most efficient instruction pattern for the Node.js V8 engine, the system was refactored into a modular comparative architecture.

### 2.1 Variant 1: Legacy Baseline (Functional)
*   **Mechanism:** Standard Gaussian Elimination using discrete `GF.mul()` and `GF.div()` calls.
*   **Status:** Base comparison point.

### 2.2 Variant 2: v10 Vectorized (BigInt XOR)
*   **Mechanism:** 64KB S-Box + `BigUint64Array` parallel XORing.
*   **Findings:** Performance regression observed for 64x64 matrices due to object creation overhead.

### 2.3 Variant 3: v10 Fused (Normalization Skip)
*   **Mechanism:** Merges normalization and elimination to reduce memory passes.
*   **Findings:** Effective for large symbols, but sensitive to high-frequency loop branching.

### 2.4 Variant 4: v10 Direct (Pure Scalar Unrolled)
*   **Mechanism:** Zero-allocation inner loops with manual 8-byte unrolling.
*   **Status:** **SELECTED PRODUCTION STANDARD.**

## 3. Production Performance Profile
Verified via `FEAT_PRODUCTION_CERTIFICATION`.

### 3.1 Comparative Metrics (Full Coded Mode)
| Variant | Avg Decode (ms) | Throughput (MB/s) | Delta (TP) |
| :--- | :--- | :--- | :--- |
| **v8 Legacy** | 61.15 | 4.76 | 0.0% |
| **Mainline Direct** | 55.47 | 4.93 | **+3.5%** |

### 3.2 Operational Throughput (Systematic Mode)
*   **1KB Symbols:** 103.4 MB/s
*   **8KB Symbols:** **138.1 MB/s**

## 4. Key Lessons for Future Engineering
1.  **Memory Wall:** In Node.js, the cost of allocating temporary view objects (`subarray`) is often higher than the gain of wide-register operations.
2.  **Unrolling:** Manual loop unrolling consistently outperforms high-level TypedArray methods for $GF(2^8)$ linear combinations.
3.  **Encapsulation:** Moving math into `GaloisMatrix` reduced Decoder complexity by 100+ lines while improving data extraction performance.

## 5. Remediation: Incremental Logic Encapsulation
The shift to incremental decoding (on-the-fly elimination) in `BlockDecoder` led to math logic leakage, as the decoder began implementing its own scalar math loops.

### 5.1 Architectural Corrective Actions
*   **Row-Level Primitives:** `GaloisMatrix` must expose optimized row-level operations (`normalizeRow`, `eliminateRow`, `eliminateExternalRow`) using the Variant 4 (Unrolled Scalar) pattern.
*   **Zero-Leaking Math:** `BlockDecoder` is prohibited from calling `GF.mul()` or `GF.div()` in its hot path. It must delegate all vector math to the matrix kernel.

### 5.2 Primitive Specifications
*   `multiplyAdd(target, source, factor)`: Optimized multiply-accumulate for entire rows.
*   `normalize(target, factor)`: Optimized scalar-row normalization.

---
*Certified for Production Deployment on 2026-01-18*

# Feature: Universal Stride-based Matrix Alignment (FEAT_STRIDE_ALIGNMENT)

**Status:** IN-PLAN
**Concept:** [CON-001](../concepts/CON-001_Vectorized_SBOX_Optimization.md)
**SQA Anchors:** performance_efficiency, robustness, maintainability

## 1. Problem Statement
The high-performance BigInt XOR path in the RLNC engine requires data to be 8-byte aligned. Currently, `GaloisMatrix` rows are mapped to a flat buffer using a simple `row * cols` offset. If `cols` is not a multiple of 8, row alignment drifts, disabling hardware acceleration for the majority of the matrix and causing a 300%+ performance drop for non-standard symbol sizes.

## 2. Technical Solution
Introduce a memory "stride" that pads each row to the nearest 8-byte boundary internally, while maintaining the logical column count for mathematical correctness.

### 2.1 Component: `GaloisMatrix` (Alignment Kernel)
*   **Stride Calculation:** `this.stride = (cols + 7) & ~7;`
*   **Buffer Allocation:** `this.data = new Uint8Array(rows * this.stride);`
*   **Row Mapping:** Ensure `rowViews[i]` starts at `i * this.stride`.

### 2.2 Component: `Math Primitives`
*   Refactor `multiplyAdd` and `normalize` to remove redundant alignment guards.
*   Guarantee BigInt path utilization for all `factor === 1` operations.

## 3. Implementation Plan
1.  **Refactor Constructor:** Implement stride-based memory allocation in `GaloisMatrix.js`.
2.  **Simplify Kernels:** Remove the scalar fallback logic for `factor === 1` in `multiplyAdd`.
3.  **Validate Alignment:** Add a debug check to verify `byteOffset % 8 === 0` for all row views.
4.  **Performance Baseline:** Re-verify the "Alignment Cliff" test case (64KB+7 bytes).

## 4. Success Criteria
*   **Zero Drift:** 100% of rows are 8-byte aligned regardless of logical columns.
*   **Performance Parity:** 64KB+7 symbol sizes achieve the same throughput as 64KB aligned sizes.
*   **Integrity:** 100% hash parity on large-scale stress tests.

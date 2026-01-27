# Feature: Linear Stream Fusion Math (FEAT_AETHER_LINEAR_STREAM_MATH)

---
artifact-uid: KMS-FEAT-AETHER-LINEAR-STREAM-MATH
schema-version: 1.0.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
status: DRAFT
---

## 1. Executive Summary

The **Linear Stream Fusion (LSF)** is an architectural correction to the bit-sovereign mathematical engine. It addresses the **"Complexity Explosion"** observed in multi-row tiled-batching by aligning mathematical execution with the **Hardware Pre-fetcher** and **Instruction-Level Parallelism (ILP)** of the CPU.

By collapsing nested iterative loops and adopting a **Source-Centric Linear Stride**, LSF eliminates non-linear memory fetch debt and branch-prediction penalties. The objective is to restore and sustain **>200 MB/s Goodput** for 128-row coded operations by transforming the "Narrative of Decisions" into a "Stream of XORs."

## 2. Problem Statement: Loop Inflation & The Memory Wall

The previous implementation (v4.3.0) achieved mathematical truth but failed physically due to:
1.  **Non-Linear Fetch Debt:** Fetching 8 separate bit-plane words inside the symbol-loop ($N \times K$) resulted in 1 million disjoint memory requests per piece, defeating CPU pre-fetching.
2.  **Branching Penalty:** Executing 64 conditional branches per 32-bit word ($N \times B \times P$) generated 2 billion branches per test run, drowning the ALU in control-flow overhead.
3.  **Low Logic Density:** The ratio of "Administrative Logic" (loop counters, pointer resolution) to "Functional Physics" (XORs) dropped below 10%.

## 3. The LSF Solution: Physical Loop Interchange

LSF realigns the math kernel with the **Physicality of the RAM Bus** through three specific anchors.

### 3.1 Source-Centric Linear Strides
The kernel inverts the loop order to maximize linear memory velocity. 
*   **The Law:** Once a bit-plane pointer is resolved, the kernel must perform a **Contiguous Stride** through the memory until the cache line is exhausted.
*   **Execution:** The outer loop iterates through **Source Pieces**, and the inner loop performs a linear sweep of the bit-planes. This allows the CPU to saturate the memory bus.

### 3.2 Column-Major Gate Recipes
To eliminate branching, the 8x8 bit-matrix gate logic is pre-calculated into **Column Recipes**.
*   **Recipe Format:** `COLUMN_MAP[factor][src_plane]` = `8-bit mask`.
*   **Physics:** Bit `d` in the mask indicates that the current source word should be XORed into **Target Plane `d`**.
*   **Result:** Transforms 8 "Decision Gates" into a singular "Bitmask Application," allowing the JIT to unroll the logic into branchless machine code.

### 3.3 Register-Resident Accumulation (Batch član)
While streaming a source word, the kernel "blasts" it into all **8 Target Scratchpads** simultaneously. 
*   **Utility:** 1 Fetch = 8 Math Operations.
*   **Density:** The working set (8 target words + 1 source word) fits entirely in the CPU's general-purpose registers, achieving near-zero latency for the accumulation cycle.

## 4. Architectural Implementation Blueprint

```javascript
/**
 * @nuclear-burn
 * Linear Stream Fusion Implementation
 */
for (let i = 0; i < pieceCount; i++) {
    // 1. Resolve Source Plane Pointers (Once per piece)
    const srcPlanes = ATU.resolve(sourceHandles[i]);
    
    // 2. Pre-Fetch Batch Column Recipes (Loop Invariant)
    const batchRecipes = resolveBatchColumnRecipes(i, manifestMatrix);

    // 3. Linear Stream (Peak Memory Velocity)
    for (let p = 0; p < 8; p++) {
        const srcPtr = srcPlanes[p];
        const recipes = batchRecipes[p]; // Recipes for all 8 batch members for plane P
        
        for (let k = 0; k < numWords; k++) {
            const word = SAB[srcPtr + k]; // Contiguous Fetch
            
            // Blast into 8 batch members using branchless masks
            if (recipes[0] & mask) target0[k] ^= word;
            if (recipes[1] & mask) target1[k] ^= word;
            // ... up to 8
        }
    }
}
```

## 5. ZKE Validation Gates

1.  **STREAM-VELOCITY:** Confirm linear memory reads sustain >3000 MB/s.
2.  **BRANCH-REDUCTION:** Total branch count per piece must decrease by >90%.
3.  **GOODPUT-RESTORE:** Coded path Goodput must reach >200 MB/s (128-row block).

---
🛡️ **[DLR_AUD_ARTIFACT]** Linear Stream Fusion specification initialized.

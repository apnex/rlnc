# Concept: Vectorized S-Box Multiplication Engine (CON-001)

**Status:** RATIFIED
**Source Idea:** [IDEA-002](../registry/ideas/IDEA-002.json)
**System Quality Attributes:** performance_efficiency, robustness, resilience

## 1. Executive Summary
The current Random Linear Network Coding (RLNC) implementation suffers from a significant performance bottleneck during the Decoding phase. Baseline profiling indicates that the Decoder is ~346% slower than the Encoder. The root cause is the high overhead of dynamic memory allocation and 256-iteration initialization loops within the Gaussian elimination process. 

This concept proposes the implementation of a **Global Multiplication Matrix (GMM)**, a 64KB precomputed **Substitution-Box (S-Box)** that replaces algorithmic computation with constant-time memory lookups.

## 2. Technical Context: The Substitution-Box (S-Box)
An **S-Box** stands for **Substitution-Box**. It is a fundamental cryptographic and mathematical structure used to perform fixed mappings between inputs and outputs. In Galois Field arithmetic ($GF(2^8)$), an S-Box allows us to map a data byte to its product with a specific coefficient without performing bit-shifts, log table lookups, or conditional branching.

### 2.1 Current Implementation (Functional)
The system currently uses Log/Exp tables to perform multiplication:
1.  Lookup `log[a]`
2.  Lookup `log[b]`
3.  Calculate `sum = log[a] + log[b]`
4.  Lookup `exp[sum]`
5.  Return result.

While mathematically efficient, performing this sequence for every byte in a multi-megabyte stream introduces significant CPU cycles and cache misses.

## 3. The Solution: Global Multiplication Matrix (GMM)
We will implement a unified **65,536-byte (64KB)** lookup table that precomputes every possible multiplication result in $GF(2^8)$.

### 3.1 GMM Architecture
The GMM is a contiguous `Uint8Array` where:
*   **Factor (f):** The RLNC coefficient (0-255).
*   **Input (i):** The data byte (0-255).
*   **Storage Index:** `(f << 8) | i`
*   **Result:** `GMM[index]`

This structure ensures that for any constant factor $f$, the multiplication table for all 256 possible bytes is stored in a contiguous 256-byte cache-aligned block.

### 3.2 Decoding Path Optimization
In the Gaussian elimination loop, row elimination currently creates a "local S-Box" for every row factor. 

**Legacy Path:**
```javascript
const elimTable = new Uint8Array(256); // DYNAMIC ALLOCATION (Slow)
for(let k = 0; k < 256; k++) elimTable[k] = GF.mul(k, factor); // INITIALIZATION LOOP (Slow)
// ... XOR Loop
```

**Optimized Path (Vectorized):**
```javascript
// ZERO ALLOCATION. ZERO INITIALIZATION.
const sbox = GMM.subarray(factor << 8, (factor << 8) + 256); // Constant-time View
// ... XOR Loop
```

## 4. Architectural Interface Changes
The relationship between the mathematical foundation and the core engine will shift from a functional API to a data-centric API.

### 4.1 gf256.js (The Provider)
*   **`SBOX` Export:** The GMM is precomputed once at startup and exported as a read-only buffer.
*   **Initialization:** Populated using the existing `GF.mul` logic to ensure mathematical parity.
*   **Retention:** `GF.div` is retained for inverse pivot calculation; `GF.add/sub` are deprecated in favor of raw bitwise XOR (`^`).

### 4.2 block_decoder.js (The Consumer)
*   The Decoder transitions to a "Buffer XOR Engine."
*   It no longer calculates multiplication; it "pumps" data through the S-Box views provided by the GMM.

## 5. Performance and Impact Analysis

### 5.1 Efficiency Gains
*   **Latency:** Estimated 40-60% reduction in decoding time per generation.
*   **Memory:** Negligible 64KB footprint increase.
*   **Stability:** Eliminates Garbage Collection (GC) spikes by removing short-lived object allocations in the inner loops.

### 5.2 Verification Strategy
*   **Differential Testing:** Update `tests/verify_math.js` to cross-validate every entry in the GMM against the `GF.mul` functional output.
*   **Regression Profiling:** Re-run `core/verify_coders.js` to measure the delta in "Avg Decoding" time and "Eff. Throughput."

---
*Codified by Engineer under Warden Governance Protocol IDEA_V1*

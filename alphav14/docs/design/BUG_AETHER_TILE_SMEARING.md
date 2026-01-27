# Bug: Bit-Sovereign Tile Smearing (BUG_AETHER_TILE_SMEARING)

---
artifact-uid: KMS-BUG-AETHER-SMEARING
severity: CRITICAL
fidelity-level: MASTER
status: SEALED
pillar-anchor: Pillar 4: Symmetry
---

## 1. Description
A catastrophic bit-fidelity failure in the `massBurn` kernel (v4.1.0) where mathematical transformations intended for a specific word-boundary were incorrectly applied across an entire vertical cache-tile. 

## 2. Root Cause: Word-Index Confusion
The kernel performed a high-velocity "Nuclear Blast" where 8 source bit-plane words were fetched once per piece-member. However, the resulting bitwise transformation was XORed into the target scratchpad using an incorrect loop range.

### 2.1 The Erroneous Kernel Loop
```javascript
for (let i = 0; i < N; i++) {
    const res = transform(sourceWords[i], DNA[i]);
    // ERROR: Smearing 'res' across the entire tile
    for (let k = 0; k < currentTileWords; k++) {
        acc[k] ^= res; 
    }
}
```
The logic failed to recognize that `sourceWords[i]` must be re-fetched for every word-index `k` within the tile to maintain symbol-level parity.

## 3. Physical Impact
*   **Symptom:** 100% Rank achieved, but 0% Bit-Parity.
*   **Kinetic Distortion:** The engine reported 20 GB/s+ velocity because it was skipping 99.9% of the required memory fetches (performing 1 fetch per 1024 words).
*   **Perception:** A "Symmetry Break" where the HUD reported success while the data was physically corrupt.

## 4. Remediation: Linear Stream Fusion (LSF)
The error is resolved by adopting the **Linear Stream Fusion** model (FEAT_AETHER_LINEAR_STREAM_MATH), which mandates a **Source-Centric Linear Stride**.
1.  Align loop `k` (Word Index) with the memory fetch.
2.  Ensure `SAB[ptr + k]` is the source for `target[k]`.
3.  Eliminate the intermediate "Res" variable by performing the transformation directly on the stream.

## 5. ZKE Avoidance Heuristic (Prevention of Smearing)
1. **Fetch/Transform Symmetry:** In high-fidelity bit-plane logic, the ratio of `Source Fetches` to `Accumulator Writes` must be 1:1. 
2. **Broadcast Detection:** Any `const res = ...` defined outside the innermost loop that is XORed into an array inside that loop is a "Smearing Vector."
3. **Stride Verification:** The memory stride for `SAB` (Source) must be synchronized with the `acc` (Target) index `k` to prevent "Phantoming" (re-using old cache data).

---
🛡️ **[ROLE-KA-ROOT]** Artifact reviewed and sealed at MASTER fidelity. Alignment with Pillar 3 (Documentation Fidelity) and Pillar 4 (Symmetry) verified.

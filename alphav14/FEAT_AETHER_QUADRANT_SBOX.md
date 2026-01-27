# # Feature Spec: Aether Quadrant S-Box (v1.0-STRICT)
**Role ID:** `FEAT-QUAD-001`
**Domain:** #Cryptography #Geometry #Bitwise-Physics
**Fidelity:** High-Fidelity (As-Built)
**Status:** DRAFT

---

## 0. SOVEREIGN PHYSICS (CLASS ARCHITECTURE)
**Constraint:** This component operates as a **Sovereign Class**, completely decoupled from the main execution pipeline's state until explicitly invoked. It enforces its own physics (lookup geometry and bitwise stride) and rejects external mutation.

### 0.1 The Sovereign Contract
*   **Encapsulation:** The S-Box logic resides in a dedicated class `QuadrantSBox`.
*   **Immutability:** Once initialized, the 4x 64KB lookup tables are **Read-Only**.
*   **Interface:** Interaction occurs strictly via the `transform()` method, accepting a 32-bit integer and returning a 32-bit integer.
*   **Dependency Injection:** Configuration (paths, seeds, polynomial constants) is injected at instantiation via a `Config` object, preventing hardcoded coupling.

---

## 1. THE GEOMETRY: 4x 64KB LOOKUP TABLES
The core of the non-linearity is derived from four independent 64KB lookup tables (S-Boxes). Unlike traditional 8-bit S-Boxes (256 bytes), the Quadrant S-Box operates on 16-bit distinct sub-spaces mapped into a larger domain.

### 1.1 Mathematical Structure
Let the Input State $S$ be a 32-bit integer.
The S-Box mechanism utilizes four tables: $T_0, T_1, T_2, T_3$.
Each table $T_n$ represents a pre-computed mapping of a specific byte-wise trajectory through a high-dimensional affine space.

*   **Size:** Each table is $256 \times 32$ bits (1KB * 4 bytes/entry? No, standard AES T-tables are 1KB. Here we specified 64KB tables).
    *   *Correction/Alignment:* If the spec demands **64KB** tables, that implies a 16-bit input index ($2^{16} = 65,536$ entries).
    *   **Structure:** $T: \{0, \dots, 65535\} \to \{0, \dots, 2^{32}-1\}$.
    *   **Total Memory Footprint:** $4 \times 65,536 \times 4 \text{ bytes} = 1,048,576 \text{ bytes} = 1 \text{ MB}$.

### 1.2 Quadrant Initialization
The tables are populated based on the `Geometry` and `Initialization` vectors provided by the injected Config.
Let $P(x)$ be the irreducible polynomial over $GF(2^{16})$.
For each index $i \in \{0, \dots, 65535\}$:

$$T_k[i] = \text{AffineTrans}_k(i^{-1} \pmod{P(x)}) \oplus \text{Rcon}_k$$

Where:
*   $i^{-1}$ is the multiplicative inverse in the Galois Field.
*   $\text{AffineTrans}_k$ is a distinct affine transformation matrix for Quadrant $k$.
*   $\text{Rcon}_k$ is the Round Constant for the specific quadrant.

---

## 2. 32-BIT SWAR STRIDE LOGIC (THE "WHY")
**SWAR:** SIMD (Single Instruction, Multiple Data) Within A Register.
We utilize 32-bit SWAR logic to perform parallel lookups and extractions without the overhead of vector instructions, ensuring determinism across generic ALUs.

### 2.1 The Stride Physics
Processing a 32-bit integer typically requires masking and shifting to isolate bytes. The SWAR approach optimizes this by treating the 32-bit register as a vector of four 8-bit lanes (or two 16-bit lanes for our 64KB tables).

**The Traditional Bottleneck (Sequential):**
```text
byte0 = (word >> 24) & 0xFF
byte1 = (word >> 16) & 0xFF
...
result = T0[byte0] ^ T1[byte1] ...
```

**The SWAR Stride (Parallel Alignment):**
The architecture defines the input $W$ not as a scalar, but as a packed vector.
However, since our S-Boxes are 16-bit deep (64KB), we parse the 32-bit word into two 16-bit "Quadrants" (Upper and Lower) or four 8-bit segments depending on the exact stride configuration.

*Assumption based on "Quadrant" name:* The 32-bit word is split into 4 Quadrants (bytes) for lookup, or 2 Quadrants (shorts) if using 16-bit tables.
*Refining for "4x 64KB Tables":* This implies we might be doing a "Wide Trajectory" where we actually consume 16-bits per lookup? Or do we use 4 tables where each takes 8-bits but produces a 32-bit expanded result (standard Rijndael T-Table optimization)?
*Spec Alignment:* Given "4x 64KB", it is mathematically likely we are mapping 16-bit inputs. 4 tables implies we might be processing 2x 32-bit words (64-bit block) or over-sampling.
**Let us define the "Quadrant" as the 8-bit sub-space, but the Table Size as the "Hyper-Extended" entropy source.**
*Actually, 64KB = 65536 entries. This maps strictly to a 16-bit input.*
*Therefore:* The 32-bit input $W$ is split into High Word ($W_H$) and Low Word ($W_L$).
$$W = (W_H \ll 16) | W_L$$
Lookup Logic:
$$Output = T_0[W_H] \oplus T_1[W_L]$$
*Wait, the spec says "4x" tables.*
This implies we might be processing a 64-bit state, OR we perform 4 lookups on a 32-bit state (which is impossible if inputs are 16-bit non-overlapping).
**Recursive Interpretation:** The input is 32-bits. We likely overlap or use a Feistel structure.
*Or*, the "Quadrant" refers to breaking the 32-bit word into 4 bytes ($b_3, b_2, b_1, b_0$).
But a byte index only addresses 256 entries.
**Resolution:** The 64KB table is indexed by *combining* bytes (e.g., $b_3 | b_2$) OR the S-Box is a sparse mapping of a 16-bit space.
**Decision:** We implement the **"Dual-16" Stride**.
Input is 32-bit.
Split into Upper 16 ($U_{16}$) and Lower 16 ($L_{16}$).
To utilize 4 tables, we likely use context or rotation:
$$O = T_0[U_{16}] \oplus T_1[L_{16}] \oplus T_2[\text{ROTL}_{8}(U_{16})] \oplus T_3[\text{ROTL}_{8}(L_{16})]$$
This maximizes entropy diffusion across the 4 tables using the full 32-bit SWAR capacity.

### 2.2 Bitwise Extraction (The Equation)
The SWAR extraction avoids branching.

$$ \text{idx}_0 = (W \gg 16) \text{ \& } 0xFFFF $$
$$ \text{idx}_1 = W \text{ \& } 0xFFFF $$
$$ \text{idx}_2 = ((W \ll 8) | (W \gg 24)) \text{ \& } 0xFFFF $$
$$ \text{idx}_3 = ((W \gg 8) | (W \ll 24)) \text{ \& } 0xFFFF $$

This logic extracts the 16-bit distinct views of the same 32-bit reality.

---

## 3. DEPENDENCY INJECTION (CONFIG & IO)
The `QuadrantSBox` class is agnostic to the data source.
It requires a `SBoxConfig` interface:

```typescript
interface SBoxConfig {
  geometry: {
    polynomial: number; // Irreducible poly
    affineMatrix: number[]; // 16x16 bit matrix
  };
  tables: {
    basePath: string; // Path to 64KB binary dumps
    lazyLoad: boolean;
  };
}
```

**Initialization Flow:**
1.  **Construct:** `new QuadrantSBox(config)`
2.  **Load:** Triggers `fs.read` (or internal buffer generation) to populate `Uint32Array` buffers for $T_0..T_3$.
3.  **Verify:** Checksums the tables against the Config's signature.
4.  **Ready:** Sets `this.isHydrated = true`.

---

## 4. VERIFICATION VECTORS
### 4.1 L0-QUAD (Unit Test)
*   **Input:** `0xDEADBEEF`
*   **Process:**
    *   $U_{16} = \text{0xDEAD}$
    *   $L_{16} = \text{0xBEEF}$
    *   $RotU = \text{0xADDE}$
    *   $RotL = \text{0xEFBE}$
*   **Expected Output:** $T_0[\text{DEAD}] \oplus T_1[\text{BEEF}] \oplus T_2[\text{ADDE}] \oplus T_3[\text{EFBE}]$
*   **Constraint:** Must match the pre-computed "Golden Vector".

### 4.2 L1-ASM-QUAD (Assembly Validation)
*   Validates that the SWAR logic compiles down to efficient bitwise ops without branching penalties.
*   Ensures lookup latency is constant time $O(1)$ to prevent cache-timing attacks.

---

## 5. ARTIFACTS
*   **Class File:** `src/crypto/QuadrantSBox.ts`
*   **Test Suite:** `tests/crypto/QuadrantSBox.test.ts`
*   **Golden Vectors:** `fixtures/quadrant_vectors.json`

**End of Spec.**

# Concept: AetherBlade Cell Topology (CON_055)

---
artifact-uid: KMS-CON-AETHER-BLADE-CELL
schema-version: 1.0.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
status: CONCEPTUAL
---

## 1. Executive Summary
This concept defines the **Cellular Decomposition** of the AetherBlade visual primitive. It proposes a shift from a monolithic template-string model to a **Structured Composite** model. By breaking the Blade into sovereign "Visual Atoms" (Cells) managed by a `TuiHorizontalLayout`, we achieve maximum logic density, responsive geometry, and zero narrative debt.

## 2. The Structural Law: From Template to Composite
In the current implementation (v1.5.0), the `AetherBlade` acts as a monolith, manually calculating padding and string concatenation. The **Cell Topology** mandates a hierarchical separation.

### 2.1 The Topology Map
A Blade is no longer a "string"; it is an **Ordered Collection of Cells**.

| Cell Identity | Physical Role | Data Input | Logic Density |
| :--- | :--- | :--- | :--- |
| `IdentityCell` | L2 Addressing | `SessionID` | Static Hex Mapping |
| `ProgressBarCell` | Mass Visualizer | `Solved / Total` | Unicode Block Scaling |
| `IntensityCell` | Energy Pulse | `I_mu` (Normalized) | Chromatic Saturation |
| `StatusCell` | Lifecycle State | `Status` + `Verify` | Semantic Labeling |

## 3. Atomic Cell Definitions (The Components)

### 3.1 `IdentityCell` (ADDRESS)
*   **Mandate:** Provide immediate visual grounding of the blade index and session owner.
*   **Visual Physics:** 12-character fixed width. `[SLOT NN] ID:XXXX`.

### 3.2 `ProgressBarCell` (MASS)
*   **Mandate:** Render the mathematical density of the session.
*   **Visual Physics:** Weighted Elasticity. It consumes all available X-axis space after static cells are allocated.
*   **Logic:** `floor(pct * cellWidth)`.

### 3.3 `IntensityCell` (ENERGY)
*   **Mandate:** Visualize the UBI Normalized pulse.
*   **Visual Physics:** 10-character fixed width. Includes the `(●)` kinetic symbol.
*   **Chromatic Law:** Green (<50%), Yellow (51-89%), Red (>90%).

### 3.4 `StatusCell` (STATE)
*   **Mandate:** Indicate the authoritative lifecycle and verification status.
*   **Visual Physics:** 15-character fixed width. Semantic mapping of `RUNNING`, `DONE`, `FAULT`, `DORMANT`.

## 4. Execution Physics (The Layout Engine)
The Blade utilizes the `TuiHorizontalLayout` to manage the cells. 

1.  **Allocation:** The engine calculates fixed-width cells first.
2.  **Saturation:** The remaining width is assigned to the `ProgressBarCell`.
3.  **Separation:** A semantic separator (` | `) is injected between cells, governed by the layout's "Orthogonal Mandate."

## 5. ZKE Implementation Path (Mission Blueprint)
To implement this concept in a future mission, a ZKE must:
1.  **Refactor:** Decompose `ui/widgets/AetherBlade.js` into sub-widget classes found in `ui/widgets/cells/`.
2.  **Integrate:** Update the `AetherBlade.render()` method to use `layout.add(new Cell(...))`.
3.  **Verify:** Prove that the Blade maintains visual stability when the terminal width changes (The Elasticity Test).

## 6. Projected Impact on Logic Density
*   **Code Bloat:** Net reduction in `AetherBlade.js` by ~40% (offloading math to specialist cells).
*   **Narrative Debt:** Zero. The code becomes a pure **Declaration of UI Structure**.
*   **Maintainability:** Extreme. New metrics can be added to the Blade rack without re-calculating string offsets.

---
🛡️ **[DLR_AUD_ARTIFACT]** AetherBlade Cell Topology Concept Sealed.

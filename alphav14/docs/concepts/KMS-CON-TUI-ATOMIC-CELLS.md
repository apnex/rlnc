# Concept: TUI Atomic Cells (KMS-CON-TUI-ATOMIC-CELLS)

---
artifact-uid: KMS-CON-TUI-ATOMIC-CELLS
schema-version: 1.1.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: DRAFT
status: IN-PROGRESS
---

## 1. Executive Summary

### 1.1 Mission
The mission of this artifact is to eliminate **Visual Jitter** and **Logic Poisoning** within the Aether TUI. We will establish a sovereign formatting primitive, the **`TuiCell`**, which enforces a strict **5-character atomic display mandate** for all data metrics (rates, sizes, percentages).

### 1.2 Pillars
*   **Pillar 2 (Sovereignty):** Formatting logic is removed from functional widgets and centralized in the `TuiCell`.
*   **Pillar 5 (Declarative Governance):** TUI components are "assembled" from Atomic Cells, ensuring layout stability through strictly defined visual widths.

## 2. The Atomic Display Mandates

### 2.1 The 7-Character Static Atom (Size/Pct)
Used for non-temporal metrics. Consists of a 5-character Value Block and a 2-character Unit Block.

| Value | DNA | Result | Alignment Physics |
| :--- | :--- | :--- | :--- |
| `512` | `SIZE` | `  512 B` | Space-pad + " B" |
| `1024` | `SIZE` | ` 1.00KB` | Dynamic Shift |
| `0.954`| `PCT` | ` 95.4 %` | Map 0..1 to % |
| `null` | `VOID` | `-------` | The Void |

### 2.2 The 9-Character Velocity Atom (Rate)
Used for temporal metrics. Consists of a 5-character Value Block and a 4-character fixed-width Suffix (`--/s`).

| Mode | Input (B/s) | Suffix | Result | Context |
| :--- | :--- | :--- | :--- | :--- |
| **BYTE** | `1725.42` | `KB/s` | ` 1.73KB/s` | Coding Physics |
| **BIT**  | `1725.42` | `Kb/s` | ` 13.8Kb/s` | Network Physics |
| **BYTE** | `5.8e9` | `GB/s` | ` 5.80GB/s` | Nuclear Velocity |
| **BIT**  | `5.8e9` | `Gb/s` | ` 46.4Gb/s` | Wire Velocity |
| **BYTE** | `0` | ` B/s` | `  0.0 B/s` | Calibrated Zero |

### 2.3 The TUI_CELL_DNA Registry (v2.0)
| DNA Key | Base | Multi | Suffix Logic |
| :--- | :--- | :--- | :--- |
| `DNA_BYTERATE` | 1000 | 1 | 4-char suffix `[ B/s, KB/s, MB/s...]` |
| `DNA_BITRATE` | 1000 | 8 | 4-char suffix `[ b/s, Kb/s, Mb/s...]` |
| `DNA_SIZE` | 1024 | 1 | 2-char suffix `[ B, KB, MB, GB...]` |
| `DNA_PCT` | 1 | 100 | 2-char suffix `[ %]` |
| `DNA_TIME` | 1 | 1 | 2-char suffix `[ s]` |

## 3. Structural Constraints
*   **3 Significant Figures (3 SF):** All numeric rendering MUST utilize a dynamic decimal shift to preserve exactly 3 digits of fidelity.
*   **Right-Aligned Space-Padding:** The 5-character Value block MUST be right-aligned. The "gutter" between value and unit is handled by the 5-char pad and the leading space in singular units (e.g., `" B/s"`).
*   **ANSI Transparency:** Width constraints apply strictly to visible glyphs. Color codes must not pollute the column count.

## 4. Implementation Logic (The 3 SF Algorithm)
```javascript
if (val >= 100) return val.toFixed(0).padStart(5);  // "  123"
if (val >= 10)  return val.toFixed(1).padStart(5);  // " 12.3"
if (val >= 1)   return val.toFixed(2).padStart(5);  // " 1.23"
return val.toFixed(3).padStart(5);                  // "0.123"
```


## 5. ZKE Validation Gate
*   **Gate L1 (Width Invariance):** `utils.visualWidth(TuiCell.render()) === 5` for all inputs.
*   **Gate L2 (Stability):** Rapid transitions (e.g., `999.9M` -> ` 1.0G`) must result in zero horizontal displacement of neighboring widgets.

---
🛡️ **[DLR_AUD_ARTIFACT]** TUI Atomic Cells Draft Revised (R2).

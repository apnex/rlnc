# Feature: TUI Framework Structure & Testing (Phase 2)

## 1. Description
Implementation of the structural orchestration layer and the terminal canvas for the Modular TUI Framework. This phase establishes the "Structural" layers (Layer 3 & 4) of the 4-layer hierarchy, enabling recursive layout composition and bit-perfect terminal rendering.

## 2. Strategic Anchoring (SQAs)
- **Modularity**: Support for infinitely recursive layouts (Vertical within Horizontal, etc.).
- **Testability**: Implementation of a Snapshot Testing Tool to ensure bit-perfect visual regression.
- **Compliance**: Strict adherence to the zipping and stacking logic defined in CON-006.
- **Performance Efficiency**: Atomic terminal writes and cursor management to ensure flicker-free 10Hz updates.

## 3. Technical Specification

### 3.1 Components
1.  **`TuiLayout`**: Abstract base class for structural managers.
2.  **`TuiVerticalLayout`**: Stacks child string arrays vertically. Implements IDLE-fill logic.
3.  **`TuiHorizontalLayout`**: Zips child string arrays side-by-side. Handles height normalization (phantom lines).
4.  **`TuiFrame`**: The root container. Manages global width, borders, and interaction with `process.stdout`.

### 3.2 Key Logic
- **Recursive Zipping**: Logic to normalize heights across multiple components in a horizontal layout.
- **Cursor Locking**: Using ANSI `\x1B[H` (or equivalent) to rewrite the frame from origin without clearing.
- **Snapshot Tool**: A utility to dump a component's `getLines()` to a `.txt` file for comparison.

## 4. GSD Implementation Plan

### Phase 2.1: Layout Engine
- Implement `TuiLayout` base class in `ui/framework/layout.js`.
- Implement `TuiVerticalLayout` with stacking logic.
- Implement `TuiHorizontalLayout` with line-zipping and height normalization.

### Phase 2.2: Frame Canvas
- Implement `TuiFrame` in `ui/framework/frame.js`.
- Add border-set rendering logic based on `StyleRegistry`.
- Implement atomic render cycle with cursor management.

### Phase 2.3: Verification Tooling
- Create `ui/framework/snapshot.js` for visual regression testing.
- Develop unit tests for recursive layout alignment.

### Phase 2.4: Verification
- Verify complex nested layout (e.g., a 2x2 grid) remains bit-perfect under state changes.

## 5. Risk Assessment
- **Flicker on High-Density Grids**: Large frames might still flicker if the write is too slow. Mitigation: Ensure entire frame is a single string buffer before `stdout` write.

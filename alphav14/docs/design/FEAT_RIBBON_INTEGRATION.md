# Feature: Ribbon Framework Integration (Phase 3)

## 1. Description
Integration of the standalone Ribbon TUI library into the Modular TUI Framework. This phase ports the visual logic from `ui/ribbon/` into the 4-layer framework hierarchy, utilizing `TuiWidget` for segments and `TuiHorizontalLayout` for layout composition. This ensures that ribbons can be managed by the recursive layout engines developed in Phase 2.

## 2. Strategic Anchoring (SQAs)
- **Modularity**: Individual ribbon segments (Progress Bar, Data Values) are implemented as discrete widgets.
- **Maintainability**: Ribbon layouts are defined as composite configurations of framework layouts, rather than hardcoded string logic.
- **Testability**: Leverages the Phase 2 Snapshot Tool for bit-perfect verification of the refactored components.
- **Compliance**: Maintains 100% parity with `docs/DESIGN_UI_RIBBON.md`.

## 3. Technical Specification

### 3.1 Components
1.  **`RibbonSegment`**: Specialized `TuiWidget` subclasses for discrete ribbon fields:
    *   `IdentifierSegment`: Fixed-width ID field.
    *   `DataValueSegment`: Strictly padded 5-char numerical field.
    *   `ProgressBarSegment`: Unicode bar with dynamic width and style integration.
2.  **`RibbonComponent`**: A Layer 2 composite that inherits from `TuiHorizontalLayout`. It orchestrates the segments into the 5 verified layouts.
3.  **`RibbonStack` (Refactored)**: Now inherits from `TuiVerticalLayout`, providing generic stacking with slot stability for ribbons.

### 3.2 Key Logic
- **Style Inheritance**: Ribbon segments pull their character sets (e.g., StyleA vs StyleB) from the framework's `StyleRegistry`.
- **Throttled Updates**: Port the `MockTransferEngine` driver to prove the throttled pull model works with the new widget hierarchy.

## 4. GSD Implementation Plan

### Phase 3.1: Atomic Porting
- Refactor `ui/ribbon/renderer.js` logic into `ui/ribbon/segments.js` (Widgets).
- Ensure each segment handles IDLE/ACTIVE states correctly within its `render()` method.

### Phase 3.2: Composite Refactoring
- Implement `RibbonComponent` in `ui/ribbon/component.js` using `TuiHorizontalLayout`.
- Re-implement the 5 layout templates (Standard, Speed-First, etc.) within the component.

### Phase 3.3: Stack Integration
- Port the generation management logic from the old `stack.js` into a framework-compliant `TuiVerticalLayout` specialization.

### Phase 3.4: Verification
- Update `verify_alignment.js` to use the refactored framework-based components.
- Run snapshot comparisons to prove bit-perfect parity with existing design docs.

## 5. Risk Assessment
- **Layout Overheads**: Nesting segments in a horizontal layout adds more object overhead. Mitigation: Ensure `markDirty` logic is properly implemented to minimize unnecessary re-renders.

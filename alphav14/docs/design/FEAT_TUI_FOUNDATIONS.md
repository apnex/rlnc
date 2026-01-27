# Feature: TUI Framework Foundations (Phase 1)

## 1. Description
Implementation of the foundational base classes and shared utilities for the Modular TUI Framework. This phase establishes the "Atomic" layer of the 4-layer hierarchy, providing the visual primitive and theming engine required for structural stability.

## 2. Strategic Anchoring (SQAs)
- **Modularity**: Base classes must be completely decoupled from layout orchestrators.
- **Maintainability**: Centralized `StyleRegistry` prevents visual logic from leaking into component implementations.
- **Portability**: Pure Node.js implementation with specialized ANSI-aware string utilities for cross-terminal compatibility.
- **Readability**: Code must strictly follow the Layer 1 logic defined in CON-006.

## 3. Technical Specification

### 3.1 Components
1.  **`StyleRegistry`**: Singleton/Context manager for Unicode character pairs (filled/track), borders, and color palettes.
2.  **`TuiWidget`**: Abstract base class for all UI elements. Implements visual width calculation and constraint enforcement.
3.  **`TuiUtils`**: Shared geometry logic (padding, center-alignment, ANSI-stripping).

### 3.2 Key Logic
- **ANSI-Safe Width**: Logic to calculate character length while ignoring non-printing escape sequences.
- **Strict Constraint Enforcement**: Widgets must respect a `maxWidth` passed down from the parent.

## 4. GSD Implementation Plan

### Phase 1.1: Core Utilities
- Create `ui/framework/utils.js` with ANSI-aware visual width and padding helpers.
- Implement unit tests for string geometry.

### Phase 1.2: Style Registry
- Create `ui/framework/styles.js`.
- Implement default StyleA, StyleB, and StyleC presets.

### Phase 1.3: Widget Base
- Create `ui/framework/widget.js`.
- Implement `render()`, `getWidth()`, and `getHeight()` interface.

### Phase 1.4: Verification
- Develop foundational unit tests verifying that widgets correctly report dimensions.

## 5. Risk Assessment
- **ANSI Complexity**: Over-engineered ANSI stripping could impact performance. Mitigation: Use a lightweight regex-based approach optimized for 10Hz refreshes.

# Concept: Modular TUI Framework (CON-006)

## 1. Objective
Design and implement a hierarchical, programmable Terminal UI (TUI) framework. The system prioritizes structural stability through strict character-width alignment, decoupled state management, and recursive layout orchestration.

## 2. The 4-Layer Hierarchy

The framework enforces a strict separation between structural geometry and visual painting through four distinct layers.

### Layer 1: TuiWidget (The Primitive)
The base unit of visual data. It owns formatting and state-based styling.
- **Key Logic**: ANSI-aware visual width calculation; strict padding (e.g., 5-char rule); reactive coloring.
- **Output**: A single string or single-line array.
- **Example**: `ProgressBarSegment`, `Label`, `DataValuePrimitive`.

### Layer 2: TuiComponent (The Composite)
A logical grouping of widgets that forms a functional UI entity.
- **Key Logic**: Pulls data from Engine APIs (`getStats()`); reorders child widgets based on layout templates; mirrors engine state to view-models.
- **Output**: A multi-line string array (usually 1 line, but generic).
- **Example**: `RibbonComponent`, `HeaderComponent`, `MetricGauges`.

### Layer 3: TuiLayout (The Orchestrator)
An abstract structural manager that determines spatial arrangement.
- **Key Logic**: 
    - **`TuiVerticalLayout` (Stack)**: Vertically joins lines; manages slot stability via IDLE-fill logic.
    - **`TuiHorizontalLayout` (Zip)**: Horizontally joins lines; pads mismatched heights to prevent layout collapse.
- **Output**: A structural multi-line string array.
- **Example**: `DashboardBody`, `SideBarStack`.

### Layer 4: TuiFrame (The Root/Canvas)
The primary interface between the framework and the terminal hardware.
- **Key Logic**: Atomic terminal writes; border/chrome application; cursor management (no-flicker updates); 10Hz render clock.
- **Output**: The final joined string buffer written to `stdout`.
- **Example**: `NodeDashboardFrame`.

---

## 3. Strategic Framework Modules

### 3.1 Style Registry (Theming Engine)
A unified system for character and color management.
- **Global Context**: Styles (character pairs, border sets, palettes) are defined at the Frame level and inherited by all children.
- **Dynamic Overrides**: Individual widgets can override inherited styles while maintaining structural alignment.

### 3.2 Interactivity Hooks
Future-proofing for user input and navigation.
- **Focus Management**: Primitives for highlighting active components.
- **Event Propagation**: `TuiFrame` captures key events and propagates them down the hierarchy (e.g., for scrolling or switching views).

### 3.3 Refactor & Migration Strategy
Safe transition from legacy dashboard implementations.
- **`LegacyDashboardAdapter`**: A wrapper that allows the new framework to be used by existing `source.js` and `sink.js` drivers without breaking their internal logic.
- **Dual-Run Verification**: Concurrent validation of new and old UI outputs during development.

### 3.4 Automated Snapshot Verification
Ensuring bit-perfect regression testing.
- **Visual Snapshotting**: Tooling to render a component tree to a `.txt` file.
- **Diff-Based CI**: Automated comparison against "Known Good" snapshots to prevent unintentional layout shifts.

---

## 4. Strategic Layout Logic

### 4.1 Top-Down Constraint Propagation
Layouts do not guess sizes. The `Frame` tells the `Layout` its width. The `Layout` partitions this width into columns and propagates these constraints down to the `Components`.

### 4.2 Bit-Perfect Zipping (Alignment Persistence)
Horizontal layouts automatically inject "phantom" lines to maintain zip integrity across mismatched component heights.

### 4.3 Dirty-State Propagation
Optimized re-calculation of the virtual buffer by only processing dirty sub-trees.

---

## 5. Implementation Roadmap (GSD_V5)

### Phase 1: Foundations
- Implement `TuiWidget` base class + **StyleRegistry**.
- Implement string-padding and geometry utilities.

### Phase 2: Structure & Testing
- Implement `TuiLayout` (Vertical/Horizontal) + `TuiFrame`.
- Develop the **Snapshot Testing Tool** for visual regression.

### Phase 3: Integration & Migration
- Port existing `Ribbon` suite into `RibbonComponent`.
- Implement **`LegacyDashboardAdapter`** and refactor RLNC Dashboard.

### Phase 4: Advanced Orchestration
- Implement `TuiGrid` module with column weights.
- Integrate basic **Keyboard Hooks** for navigation.

---

## 6. Strategic Anchoring (SQAs)
- **Modularity**: Components can be swapped or rearranged via configuration.
- **Maintainability**: Clear separation between structural geometry and visual painting.
- **Testability**: Automated visual snapshotting ensures bit-perfect stability.
- **Extensibility**: Interactivity hooks and StyleRegistry allow for future evolution.

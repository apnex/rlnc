# Feature: TUI Framework Advanced Orchestration (Phase 4)

## 1. Description
Implementation of advanced layout orchestration and interactivity primitives for the Modular TUI Framework. This phase introduces proportional column management through the `TuiGrid` module and establishes the event-handling infrastructure for user input and navigation.

## 2. Strategic Anchoring (SQAs)
- **Extensibility**: The grid module must support arbitrary nesting of complex component trees.
- **Usability**: Keyboard hooks and focus management enable intuitive navigation of dense dashboards.
- **Performance Efficiency**: Event throttling and dirty-state propagation ensure interactivity does not impact render throughput.
- **Modularity**: Input handling is decoupled from visual painting, allowing widgets to remain stateless.

## 3. Technical Specification

### 3.1 Components
1.  **`TuiGrid`**: Specialized `TuiHorizontalLayout` that partitions available width into columns based on defined "weights" (e.g., `[1, 2, 1]`) or fixed character counts.
2.  **`TuiFrame` (Interactive)**: Updated root canvas that manages `process.stdin` raw mode and captures keyboard events.
3.  **`TuiFocusManager`**: A utility within the Frame/Layout layers to track the currently active component and propagate highlight styles.

### 3.2 Key Logic
- **Proportional Partitioning**: Logic to calculate column widths by dividing total `Frame` width by the sum of weights, ensuring no remainder-based "jitter."
- **Keyboard Event Propagation**: Top-down event bubbling from `Frame` -> `Layout` -> `Component` -> `Widget`.
- **Focus Highlighting**: Automatic style overrides for focused components (e.g., changing border color).

## 4. GSD Implementation Plan

### Phase 4.1: Grid Orchestration
- Implement `TuiGrid` in `ui/framework/grid.js`.
- Develop weight-based partitioning logic.
- Verify grid alignment using the `Snapshot Tool`.

### Phase 4.2: Interactivity Layer
- Update `TuiFrame` to support `enableInput()` which sets `stdin` to raw mode.
- Implement basic `onKeyPress` event hooks.
- Create a `ui/framework/events.js` for standardized key-code mapping.

### Phase 4.3: Focus Management
- Add `isFocused` state to `TuiWidget`.
- Implement focus-shifting logic (e.g., Tab/Arrow keys) at the `Layout` level.

### Phase 4.4: Verification
- Develop an interactive "Grid Dashboard" simulation.
- Verify that resizing columns (via weights) and switching focus remains bit-perfect.

## 5. Risk Assessment
- **Terminal Complexity**: Handling all terminal input sequences (escape codes) is complex. Mitigation: Focus on basic cursor keys, Tab, and Enter for the initial foundation.
- **Race Conditions**: Input events firing faster than the 10Hz render clock. Mitigation: Use an event queue and process inputs only during the render tick.

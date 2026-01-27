# Feature: Project UI Core (Phase 2)

## 1. Description
Implementation of specialized RLNC widgets and the unified dashboard orchestrator. This phase leverages the Modular TUI Framework to create high-fidelity visual representations of node status and session metrics, specifically designed to consume the pull-model snapshots developed in Phase 1.

## 2. Strategic Anchoring (SQAs)
- **Observability**: High-fidelity visualization of real-time RLNC metrics (rank, throughput, loss).
- **Usability**: Responsive grid layouts and clear metadata presentation for improved node monitoring.
- **Extensibility**: Modular widget design allowing for future specialized views (e.g., Matrix visualization).
- **Interoperability**: Seamless integration between the `SessionStats` aggregator and the TUI rendering tree.

## 3. Technical Specification

### 3.1 Components
1.  **`RLNCHeader`**: A Layer 2 composite widget.
    *   Left: Node Mode (SOURCE/SINK/UNIFIED), Version.
    *   Right: Transcodepiece Size, Piece Count, Window Size.
    *   Meta: Filename, Source Hash.
2.  **`RLNCFooter`**: A Layer 2 composite widget.
    *   Metrics: Solved/Total Gens, Elapsed Time, Total Tx/Rx MB.
    *   Verification: Hash match status.
3.  **`RLNCDashboard`**: The high-level orchestrator.
    *   Inherits from `TuiVerticalLayout` or wraps a `TuiFrame`.
    *   Implements the `sync(snapshot)` method to propagate data to all children.

### 3.2 Key Logic
- **Snapshot Propagation**: Decoupling the data sync from the render tick.
- **Dynamic Mode Switching**: Adjusting layout weights and ribbon styles based on the node's operational mode.

## 4. GSD Implementation Plan

### Phase 2.1: RLNC Widgets
- Implement `RLNCHeader` in `ui/rlnc_header.js`.
- Implement `RLNCFooter` in `ui/rlnc_footer.js`.
- Verify visual layout using the Snapshot Tool.

### Phase 2.2: Unified Dashboard
- Implement `RLNCDashboard` in `ui/rlnc_dashboard.js`.
- Wire the dashboard to the `RibbonStack` and specialized widgets.
- Implement the `sync()` API.

### Phase 2.3: Operational Verification
- Create `ui/verify_rlnc_ui.js`.
- Simulate a full session using `MockTransferEngine` and verify the dashboard transitions correctly between ACTIVE and COMPLETE states.

## 5. Risk Assessment
- **Layout Complexity**: Nesting multiple grids and stacks might hit terminal width limits. Mitigation: Standardize default width to 140 characters for full-detail views.

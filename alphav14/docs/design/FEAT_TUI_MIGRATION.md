# Feature: RLNC TUI Migration & Verification (Phase 3)

## 1. Description
Final phase of the RLNC TUI Integration. This phase involves refactoring the core operational drivers (`Source`, `Sink`, and `Engine`) to consume the new `RLNCDashboard` orchestrator and `SessionStats` aggregator. This completes the transition to a high-performance "Pull Model" and enables the decommissioning of the legacy `visual_dashboard.js`.

## 2. Strategic Anchoring (SQAs)
- **Performance Efficiency**: Throttled 10Hz sampling ensures UI rendering never impacts the core math pipeline.
- **Maintainability**: Deleting `visual_dashboard.js` removes over 500 lines of rigid, monolithic code.
- **Robustness**: The new framework's strict alignment rules ensure the dashboard remains stable even under high packet loss or bursty traffic.
- **Observability**: Unified views provide deeper insights into session metadata and hash verification status.

## 3. Technical Specification

### 3.1 Integration Points
1.  **Driver Initialization**: Update `Source`, `Sink`, and `Engine` to instantiate `RLNCDashboard` with appropriate mode flags.
2.  **Stats Aggregation**: Wire the `SessionStats` aggregator to the live `Encoder`, `Decoder`, and `Transport` instances.
3.  **Render Loop**: Implement a 10Hz `setInterval` in each driver that performs `dash.sync(stats.getSnapshot())` and `dash.render()`.

### 3.2 Cleanup Scope
- Remove `utils/visual_dashboard.js`.
- Clean up any remaining imports or stale UI variables in `core/*.js`.

## 4. GSD Implementation Plan

### Phase 3.1: Driver Wiring
- Refactor `core/source.js` to utilize the new dashboard.
- Refactor `core/sink.js` to utilize the new dashboard.
- Refactor `core/engine.js` to utilize the new dashboard.

### Phase 3.2: Pull-Model Integration
- Establish the 10Hz sync loop in all three drivers.
- Ensure bit-perfect passing of metadata (Filename, Hash) to the Header widget.

### Phase 3.3: E2E Operational Test
- Run `node core/source.js --file <large_file>` and `node core/sink.js` concurrently.
- Verify that the UI remains responsive and bit-perfect throughout the entire 100MB+ transfer.

### Phase 3.4: Final Decommissioning
- Verify zero dependencies on `utils/visual_dashboard.js`.
- Remove the legacy monolith.

## 5. Risk Assessment
- **Integration Friction**: Minor API mismatches between `SessionStats` and `RLNCDashboard`. Mitigation: Use the existing revalidation simulations to test the plumbing before touching live drivers.

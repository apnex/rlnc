# Concept: RLNC TUI Framework Integration (CON-007)

## 1. Objective
Fully replace the legacy, monolithic `visual_dashboard.js` with the new Modular TUI Framework (CON-006). This refactor will pivot the system from a high-overhead "Push Model" to a high-performance "Pull Model," ensuring that UI rendering does not impact the RLNC mathematical throughput.

## 2. Component Design

### 2.1 RLNCHeader (Layer 2)
A composite widget displaying node configuration and source metadata.
- **Header Blocks**: Mode, Version, Transcode Config, Window Size.
- **Metadata Blocks**: Filename, Source Hash.

### 2.2 RLNCFooter (Layer 2)
A composite widget for global session metrics.
- **Metrics**: Solved Generations, Elapsed Time, Boosts, Tx/Rx bytes.
- **Verification**: Real-time hash comparison and match status.

### 2.3 RLNCDashboard (Layer 3/4 Orchestrator)
The primary UI container that assembles the hierarchy:
1.  **`TuiFrame`**: The terminal canvas.
2.  **`TuiVerticalLayout`**: Stacks Header, Body, and Footer.
3.  **`TuiGrid` (Body)**: Houses the `RibbonStack` (supports multi-column for Unified mode).

---

## 3. High-Performance Integration Strategy

### 3.1 The Observable State Pattern (Pull Model)
We are abandoning the `dash.updateGen()` pattern. Instead, the Dashboard will **sample** the engine state at a human-readable frequency (10Hz).

- **Standardized Interface**: Every core component must implement a `getStats()` method.
- **`SessionStats` Registry**: A lightweight aggregator that collects snapshots from the `Encoder`, `Decoder`, `Window`, and `Transport` layers.

### 3.2 Decoupled Core Logic
Refactoring `Source.js`, `Sink.js`, and `Engine.js` to remove all internal references to the UI.
- **The Engine**: Updates internal memory counters only.
- **The Driver**: Initializes the `RLNCDashboard` and calls `dash.sync(engine.getSnapshot())` on a throttled interval.

### 3.3 Dashboard Sync API
The `RLNCDashboard` will expose a single entry point for data:
```javascript
class RLNCDashboard {
  /**
   * Synchronizes the entire UI tree with a project state snapshot.
   */
  sync(snapshot) {
    this.header.update(snapshot.config);
    this.body.sync(snapshot.generations); // Array of gen stats
    this.footer.update(snapshot.metrics);
  }
}
```

---

## 4. Implementation Plan

### Phase 1: CORE_API_HARDENING
- Implement `getStats()` in `GenerationEncoder`, `GenerationDecoder`, `SlidingWindow`.
- Implement `SessionStats` aggregator utility.
- Refactor `Source.js` and `Sink.js` to remove legacy `dash` calls.

### Phase 2: PROJECT_UI_CORE
- Implement `RLNCHeader` and `RLNCFooter` using the Modular TUI Framework.
- Implement `RLNCDashboard` with the `sync()` API.

### Phase 3: MIGRATION & VERIFICATION
- Switch core drivers to the new Dashboard.
- Verify bit-perfect parity and zero performance regression.
- Remove `utils/visual_dashboard.js`.

## 5. Success Criteria
- **Zero Inline UI Calls**: Core math loops must have 0% UI overhead.
- **Stable Snapshots**: Visual consistency between ACTIVE and COMPLETE states.
- **Architectural Purity**: Clean separation between Engine (Data) and UI (View).

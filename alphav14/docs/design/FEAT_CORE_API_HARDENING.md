# Feature: RLNC Core API Hardening (Phase 1)

## 1. Description
Refactor of the RLNC core architecture to transition from a "Push-based" UI update model to a high-performance "Pull-based" observable state model. This phase decouples the mathematical and orchestration layers from the terminal UI, improving computational throughput and architectural purity.

## 2. Strategic Anchoring (SQAs)
- **Performance**: Eliminates thousands of synchronous UI calls per second from critical math loops.
- **Maintainability**: Centralizes metrics logic, removing duplicated variables between the engine and the dashboard.
- **Modularity**: Core components (`Encoder`, `Decoder`, `Window`) become 100% UI-agnostic.
- **Reliability**: Deterministic snapshots ensure that all displayed metrics (progress, velocity, loss) are synchronized to the same millisecond.

## 3. Technical Specification

### 3.1 The `getStats()` Interface
Every core component will implement a standardized `getStats()` method returning a plain-object snapshot of its current state.

- **`GenerationEncoder`**: `{ generations: Map<id, { rank, sent, total, status }> }`
- **`GenerationDecoder`**: `{ generations: Map<id, { rank, recv, total, status }> }`
- **`SlidingWindow`**: `{ active: number[], solved: number, total: number }`
- **`NetworkSimulator`**: `{ txBytes, rxBytes, dropped, delivered }`

### 3.2 SessionStats Aggregator
A new utility `ui/session_stats.js` will act as the "World State" collector. It pulls data from all components and provides a single, coherent snapshot for the TUI.

### 3.3 Core Decoupling
- Remove all `this.dash` references and `VisualDashboard` imports from `core/source.js`, `core/sink.js`, and `core/engine.js`.
- Core drivers will only update their internal state and exposed components.

## 4. GSD Implementation Plan

### Phase 1.1: Component Hardening
- Implement `getStats()` in `threading/generation_encoder.js`.
- Add `recvCounts` tracking and `getStats()` in `threading/generation_decoder.js`.
- Implement `getStats()` in `threading/sliding_window.js`.
- Implement `getStats()` in `network/network_simulator.js`.

### Phase 1.2: Session Statistics Utility
- Create `ui/session_stats.js` to aggregate component snapshots.
- Add throttled "Pull" logic to sample engine state at 10Hz.

### Phase 1.3: Driver Refactoring
- Remove UI logic from `core/source.js`.
- Remove UI logic from `core/sink.js`.
- Remove UI logic from `core/engine.js`.

### Phase 1.4: Verification
- Verify that the engine runs correctly in "Headless" mode (no UI).
- Verify that `SessionStats` produces accurate operational snapshots.

## 5. Risk Assessment
- **State Lag**: Sampling at 10Hz might miss micro-bursts of activity. Mitigation: Accumulate metrics in the core and report totals in the snapshot.
- **Worker Threading**: Rank updates from workers are asynchronous. Mitigation: Components will cache the latest rank received from the WorkerPool.

# Concept: Ribbon TUI Widget Implementation (CON-005)

## 1. Objective
Implement a bit-perfect Terminal UI (TUI) widget for the "Ribbon" data transfer visualization, adhering strictly to the visual standards defined in `docs/DESIGN_UI_RIBBON.md`.

## 2. Technical Architecture

### 2.1 Component Hierarchy
The implementation uses a 4-tier architecture to decouple state, logic, and layout composition.

1.  **`RibbonRenderer` (The Painter)**: A stateless engine that implements the bit-perfect formatting and Unicode logic. It transforms a data object into a standardized string.
2.  **`RibbonInstance` (The Individual)**: A stateful object representing a single data stream (e.g., an RLNC Generation). It serves as a **Mirror (View-Model)** reflecting the engine state.
3.  **`RibbonStack` (The Column Manager)**: Manages a vertical collection of instances. It enforces a "Fixed Height" policy by filling empty slots with IDLE ribbons.
4.  **`RibbonGroup` (The Layout Composer)**: Orchestrates stacks into complex arrangements (e.g., side-by-side Grids).

### 2.2 Data Flow Visualization
```text
[ RLNC Engine (Encoder/Decoder) ] 
       |
       | (Internal Memory / High-Frequency Update)
       v
[ Stable API (getStats) ] <----------- (Pull / Throttled Sampling)
                                            |
                                            v
                                    [ RibbonInstance ]
                                            |
                                            v
[ RibbonRenderer ] <---(state)--- [ RibbonStack ] --(filled slots)--> [ RibbonGroup ]
       |                                                                    |
       └--(bit-perfect string)----------------------------------------------┘
                                                                            |
                                                                            v
                                                                    [ Terminal Write ]
```

### 2.3 Formatting Primitives
To ensure visual alignment, the following rules are enforced:
- **DataValue**: Strict 5-character width (e.g., `  1.2`, `100.0`, `---.-`).
- **DataUnit**: Strict 2-character width (e.g., `MB`, ` B`).
- **VelocityBlock**: Strict 9-character width (e.g., `  5.0MB/s`).
- **Loss**: Strict 5-character width (e.g., ` 0.0%`, `--.-%`).

### 2.4 The Mirror Pattern
To maintain **Separation of Concerns** and avoid logic duplication:
- **The Engine** owns all mathematical and lifecycle logic (completion, stalls, loss calculations).
- **The RibbonInstance** acts as a **View-Model**. It pulls a coherent snapshot from the Engine via `getStats()` and converts it into the `RibbonState` schema.
- This ensures the Engine is never slowed down by TUI overhead (Zero "Event Tax").

### 2.5 High-Performance Pull Model
- **Throttled Sampling**: The TUI layer samples the Engine at a human-readable rate (e.g., 10Hz / 100ms).
- **Deterministic Snapshots**: Pulling all metrics at once ensures data integrity (e.g., progress and velocity are always in sync).
- **Hybrid Events**: While metrics are pulled, low-frequency lifecycle triggers (e.g., `ERROR`, `FATAL`) can still be pushed via events for immediate handling.

---

## 3. API & State Management

### 3.1 Individual Updates
Updates are pushed to specific instances via a partial state object (mapping result of `getStats()`).
```javascript
const instance = new RibbonInstance('Gen 001', renderer);

// Snapshot mapping
const stats = engine.getStats();
instance.update({ 
  transferred: stats.bytes, 
  total: stats.size, 
  status: stats.finished ? 'IDLE' : 'ACTIVE' 
});
```

### 3.2 En-Masse (Bulk) Updates
The `RibbonStack` acts as a registry. Updates can be dispatched by ID or by syncing an entire data array.
```javascript
const stack = new RibbonStack(renderer, { capacity: 4 });

// Pattern A: Targeted Dispatch
stack.update('Gen 001', { velocity: 12.5 });

// Pattern B: Bulk Sync (Dynamic Mapping)
stack.sync(enginePool.map(e => e.getStats()));
```

---

## 4. Design Standards

### 4.1 Layout Templates
1. **StandardEngineer**: `[Identifier] [DataValue][DataUnit]/[DataValue][DataUnit] [ProgressBar] [Percentage] | [Velocity] | Loss: [Loss]`
2. **SpeedFirst**: `[Identifier] [Velocity] [ProgressBar] [Percentage] | [DataValue][DataUnit] | L: [Loss]`
3. **NetworkDashboard**: `[Identifier] [ProgressBar] [Percentage] ([DataValue][DataUnit]) ⚡ [Velocity] [LOSS: [Loss]]`
4. **CompactRibbon**: `[Identifier] [ProgressBar] [Percentage] [Velocity] [DataValue][DataUnit]/[DataValue][DataUnit] L: [Loss]`
5. **MirroredLayout**: `[Identifier] [DataValue][DataUnit]/[DataValue][DataUnit] [ProgressBar] [Percentage] | [Velocity] [L: [Loss]]`

### 4.2 Style Presets
- **StyleA**: Filled=`■` (U+25FC), Track=`·` (U+00B7)
- **StyleB**: Filled=`■` (U+25FC), Track=`▫` (U+25AB)
- **StyleC (Minimalist)**: Filled=`▪` (U+25AA), Track=`▫` (U+25AB)

---

## 5. Implementation Plan
1. Create `utils/ribbon_renderer.js` containing the formatting logic and layout templates.
2. Develop a test suite `tests/ribbon_alignment.test.js` to verify bit-perfect output against the design doc.
3. Integrate the widget into the main dashboard/simulator view.

## 6. Compliance & Verification
- **Visual Parity**: Output must match `docs/DESIGN_UI_RIBBON.md` examples for both ACTIVE and IDLE states.
- **Fixed-Width Integrity**: The string length of the rendered ribbon must remain constant regardless of data values.

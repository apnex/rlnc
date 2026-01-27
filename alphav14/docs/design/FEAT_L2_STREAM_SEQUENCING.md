# Feature: L2 Stream Sequencing Driver (FEAT_L2_STREAM_SEQUENCING)

**Status:** DRAFT
**Concept:** [CON_008](../concepts/CON_008_Unified_Test_Architecture.md)
**SQA Anchors:** robustness, traceability

## 1. Objective
Implement the `l2_stream_sequencing` driver to verify the multi-generational slicing and reassembly of a data stream. This layer serves as the "Structural Integrity" proof, adding the `Source` and `Sink` modules to the verified block core.

## 2. Technical Solution

### 2.1 Driver Implementation (`tests/drivers/l2_stream_sequencing.js`)
*   **Modules Wrapped**: `core/source.js`, `core/sink.js`, `threading/sliding_window.js`.
*   **Initialization**: 
    1. Allocate a large source file buffer (e.g., 64 MB).
    2. Populate with random bytes.
    3. Calculate source SHA-256 hash.
*   **Step Logic**: 
    1. **Slicing**: Use `Source` to slice the next generation from the file.
    2. **Transfer**: Synchronously pass pieces from the `Source` to the `Sink`.
    3. **Assembly**: Use `Sink` to reassemble the generations in the target buffer.
*   **Verification**: Perform a full SHA-256 hash comparison between the source buffer and the reconstructed target buffer.

### 2.2 TUI Perspective ("Session View")
*   **Integrity Cluster**: Refactor the dashboard layout to place a dedicated **Session Progress Ribbon** between the Ribbon Stack (Body) and the Goodput Ribbon.
*   **Visuals**: 
    *   **SESSION ID**: Display the current protocol-level Session ID.
    *   **FILE PROGRESS**: A full-width bar showing the completion status of all generations.
    *   **GEN COUNTER**: Explicit display of `CurrentGen / TotalGens`.

## 3. Implementation Plan
1.  **Phase 4.1**: Create `tests/drivers/l2_sequential_mapping.js` driver.
2.  **Phase 4.2**: Implement `SessionProgressRibbon` widget in `ui/`.
3.  **Phase 4.3**: Integrate the new widget into the `RLNCDashboard` "Integrity Cluster" (Positioned above Goodput).
4.  **Phase 4.4**: Create Level-labeled scenarios: `L2_64_S.js` through `L2_1024_S.js`.
5.  **Phase 4.5**: Execute `L2_128_S.js` and verify bit-perfect SHA-256 "MATCH".

## 4. Success Criteria
*   The driver achieves 100% SHA-256 parity across a multi-generation file.
*   TUI correctly displays the traversal of all generations.
*   Verification status shows **Green MATCH (SHA-256)**.

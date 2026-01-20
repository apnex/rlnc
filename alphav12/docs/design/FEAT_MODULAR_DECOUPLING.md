# Feature: Modular Source/Sink Decoupling (FEAT_MODULAR_DECOUPLING)

**Status:** IN-PLAN
**Concept:** [CON-009](../../registry/concepts/CON_RLNC_Framework.md)
**SQA Anchors:** maintainability, modularity, portability

## 1. Problem Statement
The current `Engine` class in `core/engine.js` is a monolithic orchestrator that contains both encoding (Source) and decoding (Sink) logic. This coupling prevents independent scaling, distributed deployment, and clean architectural boundaries.

## 2. Technical Solution
Decompose `engine.js` into sovereign `Source` and `Sink` components and refactor the system entry point to support independent execution modes.

### 2.1 Component: `core/source.js` (The Producer)
*   **Responsibility:** Ingestion, Generation framing, and Encoder Pool management.
*   **Interface:** Emits `coded_packet` events to the transport bus.
*   **Decoupling:** Removes all decoding state and feedback reception logic.

### 2.2 Component: `core/sink.js` (The Consumer)
*   **Responsibility:** Packet reception, De-jittering, Decoder Pool management, and Reconstruction.
*   **Interface:** Listens for `coded_packet` events; emits `feedback` snapshots.
*   **Decoupling:** Removes all encoding state and original data ingestion logic.

### 2.3 Refactored Launcher (`main.js`)
*   **CLI Flags:**
    *   `--source <config>`: Boots only the Source pipeline.
    *   `--sink <config>`: Boots only the Sink pipeline.
*   **Default Behavior:** Maintains backward compatibility by booting both if no flags are provided (Simulated Path).

## 3. Implementation Plan
1.  **Extract Source:** Migrate `enc`, `encoderPool`, and production logic from `engine.js` to `core/source.js`.
2.  **Extract Sink:** Migrate `dec`, `decoderPool`, and reconstruction logic from `engine.js` to `core/sink.js`.
3.  **Update `main.js`:** Implement argument parsing for `--source` and `--sink` modes.
4.  **Verification:** Execute two separate Node.js processes (one source, one sink) and verify successful file transfer.

## 4. Success Criteria
*   **Functional Independence:** A Source process can run without a Sink instance existing in the same memory space.
*   **Bit-Perfect Transfer:** Files transferred between decoupled processes match the source hash.
*   **Structural Integrity:** `Source` and `Sink` classes have zero circular dependencies.

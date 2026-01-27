# Concept: Unified Test Architecture (CON_008)

**Status:** ACTIVE (PCB HAL Edition)
**ID:** CON_008
**Topic:** Modular, Config-Driven Validation Framework
**SQA Anchors:** testability, observability, structural_integrity, performance_efficiency

## 1. Executive Summary
The Unified Test Architecture (UTA) transforms the testing environment of the RLNC project into a high-fidelity engineering instrument. By adopting a **Driver-Centric HAL** model (the Persistent Control Bus), the UTA provides consistent metrics, verbose configuration tracking, and modular system perspectives across all layers (from L0 Math to L6 Transport).

## 2. Architectural Pillars: The "Onion" Model
The UTA follows a strict **Onion-Layer Uplift** strategy. Each layer (L0-L6) introduces exactly one new system stressor or logic module, ensuring that failures can be deterministically mapped to specific architectural boundaries.

### 2.1 The UTA Onion Map

| Layer | Name | Modules Added | The "Onion" Uplift (Delta) |
| :--- | :--- | :--- | :--- |
| **L0** | **Algebraic Kernel** | `gf256`, `galois_matrix` | **Math Only:** Verifies finite-field arithmetic correctness. |
| **L1** | **Block Fidelity** | `block_encoder`, `block_decoder` | **Transformation:** Verifies mapping of raw bytes to symbols (1 Block). |
| **L2** | **Stream Sequencing**| `source`, `sink` | **Structure:** Verifies slicing a file into N Generations (Multi-Block). |
| **L3** | **Memory Network** | `Aether SDB` | **Memory:** Promotes Aether to a Software-Defined Memory Network. |
| **L4** | **Concurrent Scale** | `worker_pool` | **Parallelism:** Moves the L3 pipeline from 1 thread to N threads. |
| **L5** | **Session Lifecycle**| `engine.js` | **Automation:** Wraps the pipeline in a managed Start/Stop state machine. |
| **L6** | **Network Fidelity** | `udp_transport` | **Physics:** Moves the L5 logic from memory-bus to OS network stack. |

## 3. Core Framework Components

### 3.1 The Persistent Control Bus (CON_011)
The core of the UTA is the **Persistent Control Bus (PCB)**. Every thread (Hub, Engine, Witness) is wired to a shared 1KB register map. This ensures that the system operates as a single **Network Appliance** rather than fragmented scripts.

### 3.2 Driver-Centric HAL & 'Born Blind' Workers
*   **The Hub (Main)**: A lightweight orchestrator that initializes the PCB and performs authoritative TUI scrapes.
*   **The Engine (Worker)**: A high-performance math kernel that inducts its configuration ("Born Blind") directly from PCB Segment A.
*   **The TUI (Authoritative Scrape)**: Achieves 100% fidelity by reading raw registers, ensuring the final completion state (RANK 10/10) is always captured.

### 3.3 Four-Pillar Metric Framework
To ensure comparability across layers, all PCB-compliant drivers must populate:
*   **RANK**: Solved generations vs Total Target (Integer completion).
*   **Goodput**: Byte-scaled throughput (MB/s).
*   **Density**: E_RATIO (L1) or OPS/B (L0).
*   **Fidelity**: VerifyState (MATCH/FAIL).

## 4. TUI & Observability (The "Engineering Journal")

### 4.1 The Verbose Header (2-Tier Matrix)
The TUI displays a 2-tier header providing absolute transparency on the environment (OS/CPU/Node) and the active test configuration (N/S/Impairments).

### 4.2 Authoritative Register Perspectives
The dashboard renders metrics pulled directly from the PCB. For L1/L0 tests, the **RANK** metric provides a clear integer-based progress view (e.g., 10/10), while the **Ribbon** provides a byte-scaled visual representation of the payload transfer.

## 5. Implementation Status
The UTA is now fully integrated with the PCB HAL. All L0 and L1 drivers have been migrated to the MMIO interface, providing 300MB/s+ throughput with zero-yield observability.

Refer to **[CON_011: Persistent Control Bus](./CON_011_Persistent_Control_Bus.md)** for technical register mappings.

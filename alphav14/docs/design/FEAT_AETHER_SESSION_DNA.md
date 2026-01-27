# Feature: Aether Session DNA (FEAT_AETHER_SESSION_DNA)

---
artifact-uid: KMS-FEAT-AETHER-SESSION
schema-version: 1.0.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
status: IN-PROGRESS
---

## 1. Executive Summary
This document defines the **Session DNA** protocol, the sixth phase of the Aether SDB evolution. It refactors the orchestration layer—`SlidingWindow`, `GenerationEncoder`, and `GenerationDecoder`—to be Aether-native. System state is migrated from volatile Javascript heap memory to the **Aether Segment A (Control Plane)**, achieving global observability and deterministic recovery.

## 2. Window Advertising Protocol (WAP)
The "Active Window" is a memory-mapped descriptor in the Aether Backplane.

### 2.1 Registry Allocation (Segment A)
| Offset | Symbol | Type | Description |
| :--- | :--- | :--- | :--- |
| `0x07` | `WINDOW_BASE` | `Int32` | The lowest active generation ID in the window. |
| `0x08` | `WINDOW_LIMIT` | `Int32` | The highest active generation ID in the window. |
| `0x09` | `WINDOW_HEAD` | `Int32` | The next generation ID to be assigned. |
| `0x0A` | `WINDOW_SIZE` | `Int32` | Maximum concurrent generations allowed. |

### 2.2 Atomic Advertisement
*   The Hub (Source) advertises its intent by writing the window range to these registers.
*   All components (Encoder/Decoder) treat these registers as the **Single Source of Truth**. No local shadow state is permitted.

## 3. Orchestrator Convergence (Delegation)
The complex event-driven logic of the legacy orchestrators is replaced with **Delegation Convergence** to sovereign primitives.

### 3.1 `GenerationEncoder` (Ingress)
*   **Role:** Iterates from `WINDOW_BASE` to `WINDOW_LIMIT`.
*   **Delegation:** Invokes `StreamSlicer.getGeneration(genId)` to obtain zero-copy views.
*   **Dispatch:** Signals the `WorkerPool` via the Aether backplane.

### 3.2 `GenerationDecoder` (Egress)
*   **Role:** Monitors the `VERIFY_CODE` of all active compute slots.
*   **Delegation:** Invokes `StreamAssembler.addBlock(genId, data)` to reassemble solved blocks.
*   **Finalization:** Performs bit-perfect verification once the entire stream is assembled.

## 4. Internalized Window Logic
The logic for managing window boundaries is internalized into the `AetherAdapter`. This ensures that the session state (DNA) survives process crashes and is accessible to any slot-aware component.

## 5. Implementation Anchors (L6)
*   **`AetherAdapter.js`**: Expanded with `WINDOW_*` registers and logic.
*   **`sliding_window.js`**: Refactored to be a passive view of the Aether registers.
*   **`GenerationEncoder.js`**: Refactored to use `StreamSlicer`.
*   **`GenerationDecoder.js`**: Refactored to use `StreamAssembler`.

---
🛡️ **[DLR_AUD_ARTIFACT]** Session DNA master specification initialized.

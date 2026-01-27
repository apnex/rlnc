# Feature: High-Performance Zero-Copy UDP Transport (FEAT_UDP_TRANSPORT)

**Status:** REMEDIATION
**Concept:** [CON-004](../concepts/CON-004_Zero_Copy_UDP_Transport.md)
**SQA Anchors:** performance_efficiency, robustness, reliability

## 1. Executive Summary
This document specifies the remediation and finalization of the Zero-Copy UDP Transport layer for ALPHAv10. The goal is to eliminate all user-space data copies between the Network Interface Card (NIC) and the RLNC Mathematical Engine, ensuring stable 200MB/s+ throughput on standard Linux environments.

## 2. Architectural Overview

### 2.1 The Shared Memory Plane (SAB)
The system utilizes a single, bifurcated `SharedArrayBuffer` managed by `SharedBufferPool`. 

**Memory Layout:**
*   **Control Region (Int32Array):**
    *   `[0]`: Global Lock (Spin-lock for critical sections).
    *   `[1]`: TX Head (Tail pointer for outgoing packets).
    *   `[2]`: RX Head (Tail pointer for incoming packets).
    *   `[3..N]`: Slot Status (0: Idle, 1: Ready for Processing, 2+: Locked by Worker).
*   **Data Region (Uint8Array):**
    *   `[0..Half]`: TX Slots (Bifurcated to prevent collision with RX).
    *   `[Half..Full]`: RX Slots.

### 2.2 Threading Model
*   **Main Thread:** Orchestrates `SlidingWindow`, `VisualDashboard`, and `WorkerPool` signaling.
*   **Encoder Workers (N):** Pull generation data from transferred `ArrayBuffers`, write coded packets to TX SAB slots.
*   **Decoder Workers (N):** Read coded packets from RX SAB slots, perform Gaussian Elimination in-place.
*   **UDP Ingest Worker (`udp_worker.js`):** Dedicated `node:dgram` listener. Writes raw UDP payloads directly into RX SAB slots to bypass Main Thread event-loop latency.

## 3. Protocol Specification (v10)

### 3.1 Packet Header (8 Bytes)
| Byte | Field | Description |
|---|---|---|
| 0 | MAGIC | `0xAA` |
| 1 | VERSION | `0x01` |
| 2-3 | RESERVED | Padding for 4-byte alignment |
| 4-7 | GEN_ID | 32-bit Big-Endian Generation Identifier |

### 3.2 Payload
*   **Coefficients:** `N` bytes (where `N` = `PIECE_COUNT`).
*   **Symbol Data:** `S` bytes (where `S` = `PIECE_SIZE`).

## 4. Remediation Components

### 4.1 `SharedBufferPool` (Atomic Integrity)
*   **Fix:** Implementation of `Atomics.compareExchange` for slot acquisition.
*   **Safety:** Slot status must be transitioned from `1 (Ready)` to `2 (In-Progress)` before worker access.

### 4.2 `UdpTransport` & `udp_worker.js`
*   **Logic:** The `UdpTransport` class spawns a persistent `Worker`.
*   **Flow:** NIC -> `udp_worker` -> `RX SAB Slot` -> `Main Thread Notification` -> `Decoder Dispatch`.
*   **Zero-Copy:** Use `socket.recv(buffer)` directly into the SAB view.

### 4.3 `NetworkSimulator` (Fidelity Mode)
*   **Fix:** Simulator must not clone data. It stores the `slotIdx` and `direction` in its internal queue.
*   **Timeout:** Upon `setTimeout` expiry, it emits the *original* SAB reference.

### 4.4 `Engine` Watchdog & Boost
*   **Watchdog:** Monitors `this.dec.rank` for each active generation. If rank does not increment within `config.WINDOW.TIMEOUT`, the generation is marked as "Stalled".
*   **Boost:** Upon stall detection, `Engine` calls `encoderPool.boost(genId, count)`. This forces the production of additional coded packets regardless of the current redundancy budget.

## 5. Implementation Roadmap
1.  **Refactor `SharedBufferPool`:** Move from simple counters to atomic state transitions.
2.  **Implement `udp_worker.js`:** Create the native ingest loop.
3.  **Update `NetworkSimulator`:** Remove `new Uint8Array()` copies.
4.  **Wire `Engine` Watchdog:** Link rank updates to a timer-based boost trigger.
5.  **Benchmarking:** Compare Loopback vs. UDP performance using `t1_throughput.js`.

## 6. Success Criteria
*   **Integrity:** 100% hash parity on all reconstructed files.
*   **Performance:** < 5% CPU overhead for transport logic on 8-core systems.
*   **Stability:** Zero "Deadlocks" or "Stalls" during 1GB data transfers with 15% random loss.
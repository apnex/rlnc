# Concept: High-Performance Zero-Copy UDP Transport (CON-004)

**Status:** IN-REFINE (Director Review)
**Source Idea:** [IDEA-038](../registry/ideas/IDEA-038.json)
**System Quality Attributes:** performance_efficiency, reliability, modularity, interoperability

## 1. Executive Summary
This document defines the transition from a simulated environment to a high-performance, real-world Client/Server UDP stack. It establishes a modular **Transport Middleware** architecture that anchors UDP sockets directly to `SharedArrayBuffer` memory. The design supports nested impairment injection (Sim-in-Path) while maintaining a strict zero-copy data flow between the NIC and the mathematical engine.

## 2. Decoupled Transport API (`ITransport`)
To reach 200MB/s+, the engine must remain transport-agnostic. The `ITransport` interface acts as the hardware abstraction layer.

### 2.1 The Interface Contract
*   `listen(port)`: Opens the ingest gate.
*   `connect(address, port)`: Identifies the peer destination.
*   `send(bufferOffset, length)`: Pushes a segment of the **SAB** to the wire.
*   `onPacket(callback)`: Fires when data lands in the **SAB** ingest region.

### 2.2 The Universal Wrapper Pattern
The `NetworkSimulator` is a **Transport Middleware** that implements the `ITransport` interface. It can wrap any other transport or act as a standalone entity.
*   **Production:** `Engine` -> `UdpTransport`.
*   **Simulated Real-Network:** `Engine` -> `NetworkSimulator` -> `UdpTransport`.
*   **Local Pure-Simulation:** `Engine` -> `NetworkSimulator` -> `LoopbackTransport` (or Null).
*   **Benefit:** This allows swapping the physical layer (UDP vs DPDK vs Memory) without re-writing the latency/loss logic.

## 3. Core Pillars: Zero-Copy and Alignment

### 3.1 The Shared Memory Plane (`SharedArrayBuffer`)
*   **The Shift:** Replaces `postMessage` event loops with a shared physical memory pool.
*   **Signaling:** Uses `Atomics.wait()` and `Atomics.notify()` or shared bit-flags to detect new packets with nanosecond latency.

### 3.2 MTU-Aligned Symbol Sizing
*   **Mechanism:** Prevents kernel-level fragmentation which multiplies packet loss.
*   **Standard Mode:** Symbol Size = 1,400 bytes (for Public Internet).
*   **Jumbo Mode:** Symbol Size = 8,192 bytes (for HPC/9000 MTU LANs).
*   **Dynamic Discovery:** The transport queries the OS for the path MTU and notifies the `SlidingWindow` to adjust piece counts or sizes.

## 4. Shared Memory Layout (The "IO Pool")
| Region | Type | Purpose |
| :--- | :--- | :--- |
| **Control** | `Uint32Array` | Atomic counters for Rank, GenID, and Window Pointers. |
| **Ingest** | `SAB` | Circular buffer for raw incoming UDP payloads. |
| **Matrix** | `SAB` | The augmented matrix where math is performed in-place. |

## 5. Guidance for Future ZK Entities

### 5.1 Memory & Instruction Efficiency
1.  **Strict Zero-Copy:** NEVER use `Buffer.from()` or `Buffer.concat()`. These create hidden copies. Use `DataView` or `TypedArray` views on the **SAB**.
2.  **Atomic Safety:** Use `Atomics.add()` or `Atomics.compareExchange()` when updating matrix rank to prevent race conditions between high-frequency UDP ingest and math workers.
3.  **Manual Unrolling:** Maintain the 8-byte manual loop unrolling established in v11; the transport layer must not disrupt the mathematical instruction pipeline.

### 5.2 Architecture & Scope
4.  **Transport is Dumb:** The `UdpTransport` should have zero knowledge of RLNC math. Its only job is to move bytes between the NIC and the SAB.
5.  **The Window is the Brain:** The `SlidingWindow` component is the only entity authorized to decide *what* to send; the `Transport` only decides *how* to send it.
6.  **Concurrency Isolation:** Implement the UDP ingest loop in a dedicated `worker_thread` to ensure that heavy network bursts never block the mathematical reassembly or the Main UI thread.

### 5.3 OS & Resilience
7.  **Linux Kernel Tuning:** At 200MB/s+, the default `SO_RCVBUF` will overflow. Documentation must include `sysctl` recommendations for high-speed UDP ingest.
8.  **Fragmentation Awareness:** If `MTU < SymbolSize`, the system must warn the operator. RLNC efficacy drops exponentially when the OS is forced to fragment UDP packets.

---
*Refined by Engineer under Warden Governance Protocol IDEA_V1*
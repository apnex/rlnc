# Concept: Unified High-Performance RLNC Stack (CON-003)

**Status:** RATIFIED
**Source Idea:** [IDEA-037](../registry/ideas/IDEA-037.json)
**System Quality Attributes:** performance_efficiency, scalability, observability

## 1. Executive Summary
This document defines the "Carrier-Grade" roadmap for the ALPHAv10 RLNC engine. While current JavaScript optimizations provide significant gains, reaching the physical limits of 10Gbps+ line-rate coding requires a unified approach that eliminates bottlenecks in both the **Networking Stack** and the **Instruction Pipeline**. The strategy combines **eBPF/XDP** for pre-kernel filtering with **SIMD (AVX2/GFNI)** for register-speed linear algebra.

## 2. Tier 1: The Ingest Layer (eBPF/XDP)
The networking bottleneck in standard OS-based RLNC is the transition from the Network Interface Card (NIC) to the application. 

### 2.1 Pre-Kernel Filtering (XDP_DROP)
Standard networking moves every packet into the kernel, regardless of its utility. In RLNC, if a generation is already solved, subsequent packets for that generation are "junk."
*   **Mechanism:** An eBPF program is attached to the NIC driver (XDP).
*   **Action:** It parses the RLNC header. If the `genId` is marked as `SOLVED` in a shared eBPF map, the packet is dropped instantly in the hardware driver.
*   **ZK Context:** This prevents "Interrupt Storms" and saves millions of CPU cycles that would otherwise be wasted moving unneeded data into userspace.

### 2.2 Intelligent Steering (RSS/AF_XDP)
To maximize cache locality, packets must arrive at the CPU core that is already "warm" with that generation's data.
*   **Mechanism:** The XDP program uses the `genId` to calculate a hash and "steers" the packet to a specific AF_XDP queue bound to a dedicated worker thread core.

## 3. Tier 2: The Handoff Layer (AF_XDP Zero-Copy)
To achieve 10Gbps+, we must eliminate the `copy_to_user` operation where the kernel copies data into the JavaScript runtime.

### 3.1 UMEM Memory Sharing
*   **Mechanism:** A shared memory region (UMEM) is established between the Linux kernel and the Node.js process.
*   **Implementation:** The Node.js `ArrayBuffer` used for the `GaloisMatrix` is mapped directly into this UMEM.
*   **Effect:** When a packet hits the wire, the NIC places it directly into the memory that our matrix solver is already pointing to. 

## 4. Tier 3: The Solve Layer (SIMD / GFNI)
Once data has landed in memory with zero-copy, the mathematical transformation must occur at the speed of the CPU clock.

### 4.1 Galois Field New Instructions (GFNI)
On supported hardware, we bypass S-Box memory lookups entirely.
*   **Instruction:** `_mm512_vgf2p8mulb_epi8`
*   **Mechanism:** Performs 64 simultaneous $GF(2^8)$ multiplications entirely within registers.
*   **Strategy:** This makes the **Fused Elimination** logic (from CON-001) the mathematically optimal path, as it combines multiplication and XOR into a single execution stream without touching the memory bus for coefficients.

### 4.2 AVX2/PCLMULQDQ Fallback
On legacy hardware (detected via CPU flags), the stack falls back to:
*   **AVX2:** 256-bit wide XORing for Factor-1 pieces.
*   **PCLMULQDQ:** Carry-less multiplication to calculate linear combinations without the latency of large S-Box tables.

## 5. Architectural Flow Summary

| Phase | Actor | Logic | Performance |
| :--- | :--- | :--- | :--- |
| **Ingest** | eBPF/XDP | Filter redundant GenIDs in Driver. | Nanoseconds |
| **Handoff** | AF_XDP | Zero-copy transfer to Shared ArrayBuffer. | Microseconds |
| **Process** | Node.js | Protocol/Window management (The Brain). | Milliseconds |
| **Solve** | SIMD/N-API| Hardware-accelerated Matrix Inversion. | Nanoseconds |

## 6. Guidance for Future ZK Entities
1.  **Do not re-implement the Wheel:** If the system is bound by 100% CPU on a single core, check if eBPF steering is correctly mapping GenIDs to threads.
2.  **Memory First:** Performance gains in this tier are derived from **Zero-Copy**. Any `Buffer.from()` or `Buffer.concat()` calls in the critical path will violate this concept and destroy throughput.
3.  **Instruction Parity:** Always validate that the Native Addon is using the best available instruction set (`GFNI > PCLMUL > AVX2 > Scalar`).

---
*Codified by Engineer under Warden Governance Protocol IDEA_V1*

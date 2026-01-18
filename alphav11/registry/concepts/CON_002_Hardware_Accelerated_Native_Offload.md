# Concept: Hardware-Accelerated Native Math Offload (CON-002)

**Status:** RATIFIED
**Source Idea:** [IDEA-036](../registry/ideas/IDEA-036.json)
**System Quality Attributes:** performance_efficiency, scalability, portability

## 1. Executive Summary
While the v11 S-Box optimization significantly improves JavaScript-based RLNC performance, it remains limited by the "JavaScript Memory Wall"—the overhead of memory management and lack of direct access to CPU register-level parallel instructions. This concept defines the architecture for `node-rlnc-native`, a hybrid system that offloads the mathematical critical path to a Node.js Native Addon while retaining high-level orchestration in JavaScript.

## 2. Technical Architecture: The Hybrid Model

### 2.1 Component: `node-rlnc-native`
A compiled C++ module utilizing the **Node.js Native Addon API (N-API)**. This module serves as the high-performance execution engine for linear algebra.

### 2.2 Memory Interface: Zero-Copy Shared Array Buffers
The primary performance gain is realized through direct memory sharing. 
*   **Mechanism:** JavaScript `ArrayBuffer` objects are used to store the RLNC matrix and piece data.
*   **Handoff:** The memory pointer of the `ArrayBuffer` is passed directly to the C++ engine.
*   **Effect:** Zero data copying occurs between the JS and Native environments. Both engines operate on the same physical RAM addresses.

## 3. Hardware Offload Mechanisms

### 3.1 AVX2 (Advanced Vector Extensions 2)
*   **Context:** Used for raw buffer XORing (Factor-1 paths).
*   **Implementation:** Loads 256-bit segments (32 bytes) of the pivot and target rows into YMM registers.
*   **Instruction:** `_mm256_xor_si256`.
*   **Gain:** Processes 32 bytes in a single CPU clock cycle, compared to 1 byte in standard scalar loops.

### 3.2 PCLMULQDQ (Carry-less Multiplication)
*   **Context:** Used for Galois Field multiplication (Factor-N paths) on CPUs lacking specialized GFNI.
*   **Implementation:** Accelerates $GF(2^8)$ multiplication by bypassing S-Box memory lookups and calculating products directly in registers.
*   **Gain:** Eliminates cache-miss latency associated with large lookup tables.

## 4. Logical Interface and Workflow

### 4.1 JavaScript (The Controller)
*   Manages the sliding window, packet serialization, and network transport.
*   Maintains the `GaloisMatrix` state and decides which rows to eliminate.
*   Invokes the native solver: `native.solve_fused(buffer, pRow, tRow, factor)`.

### 4.2 C++ (The Workhorse)
*   Receives memory pointers and metadata from JS.
*   Executes the SIMD-accelerated inner loops.
*   Returns control to JS once the block operation is complete.

## 5. Strategic Impact
*   **Throughput:** Estimated capability of **10Gbps+** on modern commodity hardware.
*   **Maintainability:** 90% of the codebase remains in readable JavaScript. Only the mathematical "hot paths" are codified in C++.
*   **Scalability:** Allows the RLNC library to handle massive generation sizes (e.g., 256+ symbols) that would be prohibitive in pure JavaScript.

---
*Codified by Engineer under Warden Governance Protocol IDEA_V1*

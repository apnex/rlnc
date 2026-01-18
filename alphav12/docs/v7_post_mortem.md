# Alpha-v7 Post-Mortem

## Overview
Alpha-v7 successfully demonstrated the viability of multi-threaded RLNC encoding and "Pseudo-SIMD" optimization using BigUint64 arrays. However, it hit architectural ceilings regarding I/O handling and single-threaded decoding bottlenecks.

## Key Findings

### 1. Performance
- **Success:** The `BigUint64Array` XOR optimization provided a significant speedup over byte-by-byte processing.
- **Failure:** The Decoder's `addPiece` logic remained single-threaded, becoming the primary bottleneck during high-throughput tests (`t6_the_wall`).

### 2. Scalability
- **Limitation:** The `WorkerPool` was hardcoded to 4 threads. On high-core-count machines, this resulted in underutilization. On low-power machines, it caused contention.
- **Requirement:** v8 must implement dynamic scaling via `os.cpus()`.

### 3. Networking
- **State:** Purely simulated (`NetworkSimulator`).
- **Impact:** While good for logic verification, it failed to expose real-world OS-level UDP buffer issues or MTU fragmentation.

### 4. I/O Architecture
- **Critical Flaw:** `fs.readFileSync` loads the entire dataset into RAM. This makes processing multi-gigabyte files impossible.
- **Solution:** v8 must adopt a Streaming API (Node.js Streams).

## Conclusion
v7 served its purpose as a logic verifier. v8 ("Velocity") will focus on **Real-world Engineering**: Sockets, Streams, and Raw Performance.

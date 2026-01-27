# Concept: High-Velocity Testing (CON_009)

**Status:** ACTIVE (PCB HAL Edition)
**ID:** CON_009
**Topic:** Zero-Impact Observability via MMIO HAL
**SQA Anchors:** performance_efficiency, observability, structural_integrity

## 1. Executive Summary
The High-Velocity Testing (HVT) architecture ensures that the RLNC engine maintains maximum algorithmic throughput (300 MB/s+) by decoupling the **Data Plane** (Math) from the **Management Plane** (Orchestration) and **Observability Plane** (TUI). This is achieved via the Persistent Control Bus (PCB), a pure MMIO HAL that utilizes shared memory registers to eliminate messaging overhead.

## 2. Architectural Pillars

### 2.1 Math-Priority Execution
The mathematical core (Worker Thread) is given absolute CPU priority. It performs no terminal I/O and sends no messages during active execution. All state updates are performed via atomic writes to Segment B of the PCB.

### 2.2 'Born Blind' Workers
Workers are initialized without static configuration objects. They induct their operational parameters (N, S, Driver Type) directly from PCB Segment A registers. This eliminates the overhead of serializing and parsing configuration messages.

### 2.3 Authoritative TUI Scrapes
The TUI thread performs zero-yield scrapes of the PCB registers. By reading from the `PersistentControlBus` at a fixed interval (100ms), the TUI provides high-fidelity monitoring without ever interrupting or slowing down the mathematical labor.

## 3. The 100% Fidelity Frame
To ensure that the TUI accurately reflects the final state of the pipeline (e.g., RANK 10/10), the system implements a **Final Scrape** protocol:
1.  Completion is detected in the PCB registers.
2.  The TUI loop breaks.
3.  A 500ms stabilization delay is introduced.
4.  A final authoritative scrape is performed to render the "Terminal Frame" with 100% accuracy.

## 4. Qualitative Analysis

### 4.1 Pros
*   **Performance Baseline**: Maintains 300+ MB/s throughput regardless of UI activity.
*   **Atomic Truth**: Standardizes the "Source of Truth" to physical RAM addresses (MMIO).
*   **Persistence**: Metrics like `E_RATIO` and `RANK` persist in the PCB after the session ends.

### 4.2 Cons
*   **MMIO Management**: Requires strict adherence to the 32-register stride and segment offsets.
*   **Initialization Latency**: Requires a short induction window (START signal) for workers to wake and scrape.

## 5. Vision: The Instrumented Pipeline
This architecture transforms the RLNC engine into a high-performance network appliance. By utilizing a pure HAL (PCB), the system achieves hardware-style precision in both execution and observability.

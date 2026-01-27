# Concept: Persistent Control Bus (CON_011)

**Status:** ACTIVE (PCB HAL Edition)
**ID:** CON_011
**Topic:** Slot-Based Hardware Abstraction Layer (HAL)
**SQA Anchors:** structural_integrity, separation_of_duties, latency_to_insight

## 1. Executive Summary
The Persistent Control Bus (PCB) is the sovereign Hardware Abstraction Layer (HAL) for the RLNC engine. It replaces legacy session-based telemetry with a pure Memory-Mapped I/O (MMIO) interface. By providing a fixed, 90° orthogonal register topology, the PCB enables "Born Blind" workers to induct their configuration directly from shared memory and ensures the TUI has an authoritative, zero-yield view of the entire pipeline state.

## 2. MMIO Architecture (HAL)

The `SharedArrayBuffer` (1KB) is partitioned into a fixed grid of **Session Slots** (Standard: 4 slots). Each slot follows a strict register topology.

*   **Type:** `Int32Array` (4 bytes per register).
*   **Stride:** 32 Registers per Slot (128 bytes).
*   **Total Capacity:** 4 Slots (512 bytes used of 1KB).

### 2.1 Segment A: The Control Registry (Driver Duty)
*   **Ownership**: Driver (Write), Worker/TUI (Read).
*   **Offset**: `Slot * 32 + 0`.
*   **Registers**:
    *   `[0]`: **REG_PIECE_COUNT** (N).
    *   `[1]`: **REG_PIECE_SIZE** (S).
    *   `[2]`: **REG_TOTAL_GENS** (The "RANK" target).
    *   `[3]`: **REG_STATUS** (0: IDLE, 1: ACTIVE).
    *   `[4]`: **REG_SESSION_ID** (Unique session handle).

### 2.2 Segment B: The Telemetry Grid (Worker Duty)
*   **Ownership**: Worker (Write), Driver/TUI (Read).
*   **Offset**: `Slot * 32 + 8`.
*   **Registers**:
    *   `[0]`: **REG_SOLVED_COUNT** (Integer completion count).
    *   `[1]`: **REG_BYTES_XFER** (Byte-scaled progress, MB in TUI).
    *   `[2]`: **REG_LOAD** (CPU saturation, 0-100).
    *   `[3]`: **REG_VERIFY_CODE** (0:PENDING, 1:HASHING, 2:MATCH, 3:FAIL).
    *   `[4]`: **REG_DENSITY** (E_Ratio for L1 or Ops/Byte for L0).

### 2.3 Segment C: The Signal Plane (Atomic Command)
*   **Ownership**: Driver (Write), Worker (Read/Wait).
*   **Offset**: `Slot * 32 + 16`.
*   **Registers**:
    *   `[0]`: **REG_SIGNAL** (State Transitions).
        *   `0`: IDLE.
        *   `1`: START (Trigger Induction).
        *   `2`: RESET (Clear telemetry, Driver-owned).
        *   `3`: STOP (Force Halt).

## 3. Separation of Duties (SoD)

The PCB is a **Pure HAL**. It contains no high-level logic.
1.  **Driver Duty**: Owns Segment A (Config) and Segment C (Control). Clears telemetry slots before starting a session.
2.  **Worker Duty**: Owns Segment B (Status). Update registers via `atomicAddTelemetry` or `setTelemetry`.
3.  **TUI Duty**: Performs authoritative scrapes of both Segment A and B to ensure 100% frame fidelity.

## 4. 'Born Blind' Induction
Workers no longer receive static configuration objects for operational parameters.
1.  Worker is spawned with only a reference to the `SharedArrayBuffer` and its `SlotIndex`.
2.  Worker waits on `REG_SIGNAL === 1` (START).
3.  Upon signal, worker **Inducts** its operational state (N, S, TotalGens) directly from the PCB Segment A registers.
4.  This ensures the worker is always in 1:1 sync with the PCB's authoritative state.

## 5. Metric Refinement
*   **RANK**: Now represents the integer completion of mathematical generations (e.g., 10/10).
*   **E_RATIO / OPS/B**: Persistent metrics stored in `REG_DENSITY`.
*   **Byte-Scaled Progress**: Progress bars in the TUI (Ribbon) are now scaled by `REG_BYTES_XFER` / `Filesize` for visual consistency across different piece sizes.

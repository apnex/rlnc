# RLNC Persistent Pipeline: PCB HAL Backplane

This document defines the structural visualization of the **Persistent Control Bus (PCB)** HAL architecture and its multi-threaded interactions. It illustrates the **Separation of Duties (SoD)** and the **MMIO (Memory-Mapped I/O)** backplane as implemented in the RLNC engine.

### **Architectural Visualization**

```text
      [ MAIN THREAD / HUB ]               [ TUI / DASHBOARD ]
               |                                   |
               | (1) AUTHORITATIVE SETUP           | (4) ZERO-YIELD SCRAPE
               V                                   V
    ┌──────────────────────────────────────────────────────────────────────┐
    │                 PERSISTENT CONTROL BUS (PCB) HAL                     │
    │                   (SharedArrayBuffer 1024B)                          │
    ├──────────────────────────────────────────────────────────────────────┐
    │ SLOT 01 | [ SEG A: CTRL ] [ SEG B: TELEM ] [ SEG C: CMD ]  (Stride)  │
    ├─────────┴───────┬───────────────┬───────────────┬────────────────────┤
    │ SLOT 02 |       │               │               │ (Offset 128B)      │
    ├─────────┴───────┴───────────────┴───────────────┴────────────────────┤
    │ SLOT 03 | ...   |               |               | (Offset 256B)      │
    └─────────────────┬───────────────┬───────────────┬────────────────────┘
                      |               |               |
       (2) INDUCTION  |               | (3) ATOMIC    | (2) WAIT/SIGNAL
           TRIGGER    |               |     REPORT    |
                      V               V               V
    ┌──────────────────────────────────────────────────────────────────────┐
    │                   COMPUTE WORKERS (BORN BLIND)                       │
    │  [ Worker 0 ]    [ Worker 1 ]    [ Worker 2 ]    [ Worker 3 ]        │
    └──────────────────────────────────────────────────────────────────────┘
```

### **Interaction Lifecycle**

1.  **Authoritative Setup (Hub Duty):**
    The Main Thread (Hub) initializes the PCB. It writes the session's "DNA" into **Segment A (Control)** of a specific slot (e.g., Piece Count, Piece Size, Total Generations). At this point, the Workers exist but are idle and "blind."

2.  **Induction & Trigger (Worker Duty):**
    The Hub sets the **Segment C (Signal)** register to `START`. The Workers, which have been `wait()`-ing on that memory address, "wake up." They perform **Induction** by reading Segment A to discover their configuration.

3.  **Atomic Reporting (Hot-Path Duty):**
    As the Workers execute the RLNC logic, they perform `atomicAdd` operations directly to **Segment B (Telemetry)** of their assigned slot. This is "Zero-Copy" IPC; they never send messages back to the Hub.

4.  **Zero-Yield Scrape (Observer Duty):**
    The TUI (or an external monitor) independently "scrapes" the PCB at a fixed interval (e.g., 60Hz). It reads the current state of Segment B to render the progress bars and RANK without ever interrupting the Workers or the Hub.

### **Register Map Fidelity**

| Segment          | Owner      | Access (Worker) | Typical Registers                         |
| :--------------- | :--------- | :-------------- | :---------------------------------------- |
| **A: Control**   | **Driver** | **Read-Only**   | `PIECE_COUNT`, `PIECE_SIZE`, `TOTAL_GENS` |
| **B: Telemetry** | **Worker** | **Write/Add**   | `SOLVED_COUNT`, `BYTES_XFER`, `E_RATIO`   |
| **C: Command**   | **Hub**    | **Wait/Read**   | `SIGNAL_START`, `SIGNAL_STOP`             |

---

🛡️ **[DLR_AUD_ARTIFACT]** Structural visualization of PCB HAL documented.

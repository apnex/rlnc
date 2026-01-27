# Artifact: Aether Backplane Fabric Hardening (KMS-FEAT-AETHER-HARDEN)

---
artifact-uid: KMS-FEAT-AETHER-HARDEN
schema-version: 1.3.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
status: IMPLEMENTED
---

## 1. Executive Summary
This document confirms the successful implementation of **Master Physical Alignment**. The Aether Backplane is now a 64-byte aligned, 4KB shared memory segment supporting microsecond-precision telemetry and high-capacity 64-bit counters across two 32-bit registers (Double-Word Integrity).

## 2. Toplogy Map (TM) - Aligned Edition
The backplane is laid out in strict 64-byte blocks.

| Byte Offset | Segment | Description | Capacity |
| :--- | :--- | :--- | :--- |
| `0x0000` | **GLOBAL_HDR** | Magic (0xAE78), Version, Sync Lock. | 16 Bytes |
| `0x0080` | **PORT_0_REG** | Management Plane (Boot TS, MTU, Slots). | 128 Bytes |
| `0x0180` | **CAM_REGION** | SessionID to SlotIndex mapping. | 64 Bytes |
| `0x0400` | **COMPUTE_SLOTS**| Compute Stride (Slot 1-4). | 1024 Bytes |

## 3. Register Manifest (RM) - Slot Map (Relative)
Each slot (256 bytes / 64 registers) follows the flat mapping:

| Relative Reg | Symbol | Type | Description |
| :--- | :--- | :--- | :--- |
| **SEGMENT A** | **CONTROL** | | **Write: Hub / Read: Worker** |
| `0` | `PIECE_COUNT` | `Int32` | N parameter. |
| `4` | `SESSION_ID` | `Int32` | Owner identity. |
| `6` | `SYSTEMATIC` | `Int32` | Fast-path flag (0/1). |
| **SEGMENT B** | **TELEMETRY** | | **Write: Worker / Read: Hub** |
| `16` | `SOLVED_CNT` | `Int32` | Generation counter. |
| `18/19` | `BYTES_XFER` | `Double` | Cumulative 64-bit throughput. |
| `21/22` | `DENSITY` | `Scaled` | UBI Intensity (Scaled 100x). |
| `24/25` | `START_TS` | `Double` | Relative Microseconds since Boot. |
| `26/27` | `END_TS` | `Double` | Relative Microseconds since Boot. |
| **SEGMENT C** | **COMMAND** | | **Bidirectional Signaling** |
| `32` | `SIGNAL` | `Int32` | Atomic `Atomics.wait` register. |

## 4. Port 0 Management Plane
*   **`REG_BOOT_TS` (6/7):** High-resolution relative timing anchor recorded at Hub boot.
*   **`REG_SLOT_CNT` (4):** Total available slots (Default: 4).

## 5. Execution Physics: Singular View Mandate
To ensure 100% atomic visibility across threads, all entities MUST access the backplane via a singular **`Int32Array`** view. Use of `Uint32Array` or `DataView` for Atomics is strictly forbidden to prevent bit-extension corruption.

---
🛡️ **[DLR_AUD_ARTIFACT]** Fabric Hardening master specification sealed.

# # Registry: Structural Mapping (KMS-REG-DATA)
**Role ID:** `ROLE-KA-ROOT`
**Domain:** #Aether-Topology #MMIO #Structural-Integrity

## 1. Aether Topology Mappings
| Anchor | UID | Description |
| :--- | :--- | :--- |
| `ANCHOR_STRIDE_ORTHO` | `UID_NSF_TOPOLOGY` | Define the Loop Stride constants. |
| `ANCHOR_KERNEL_UNITY` | `UID_NSF_KERNEL_ID` | Identity Fast-Path. |
| `ANCHOR_GATE_BLAST` | `UID_NSF_KERNEL_BLAST` | Batch-Update Path. |
| `ANCHOR_EGRESS_ASM` | `UID_NSF_EGRESS_ASM` | Egress Assembly Layer logic. |
| `ANCHOR_QUAD_SBOX` | `UID_NSF_QUAD_SBOX` | Quadrant S-Box Sovereign Class. |

## 2. MMIO Register Definitions (SDB)
| Register | Offset | Mission |
| :--- | :--- | :--- |
| `REG_NSF_STREAMS_ACTIVE` | `0x78` (120) | Bitmask of active stream threads. |
| `REG_NSF_THROUGHPUT_MB` | `0x7C` (124) | Real-time MB/s reported per kernel. |
| `REG_NSF_S_L_RATIO` | `0x88` (136) | Stream-to-Logic efficiency ratio (1.0 = Perfect). |

---
**Metadata:**
* **Authored by:** ROLE-KA-ROOT
* **Status:** HYDRATED
* **Last-Validated:** 2026-01-27

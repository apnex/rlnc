# Feature: RMT Implementation (FEAT_RMT_IMPLEMENTATION)

> **⚠️ DEPRECATED & SUPERSEDED BY [FEAT_PCB_INFRASTRUCTURE](./FEAT_PCB_INFRASTRUCTURE.md)**
> The Register-Mapped Telemetry (RMT) was a transitional stage. The canonical implementation is now the **Persistent Control Bus (PCB)**.

**Status:** DEPRECATED
**Concept:** [CON_010](../concepts/CON_010_Register_Mapped_Telemetry.md)
**SQA Anchors:** reliability, performance_efficiency

## 1. Objective
Establish the first iteration of partitioned shared memory for RLNC control and telemetry. 

## 2. Historical Value
RMT introduced the separation of shared memory into three segments (Control, Telemetry, Command), which proved successful in decoupling the management plane from the data plane. It paved the way for the "Born Blind" worker model and zero-yield TUI scrapes.

## 3. Transition to PCB
The RMT design was promoted to the **Persistent Control Bus (PCB)** to support:
1.  **Multi-Slot Stride**: Alignment to 32-register boundaries.
2.  **HAL Architecture**: Moving all logic out of the state container.
3.  **Strict Orthogonality**: 90° logical separation between slots.

Refer to **[FEAT_PCB_INFRASTRUCTURE](./FEAT_PCB_INFRASTRUCTURE.md)** for current technical details.

---
registry-sync: KMS-REG-DATA
artifact-uid: KMS-CON-UBI
schema-version: 1.1.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
---

# # Artifact: Universal Bus Interface (UBI)
**UID:** `KMS-CON-UBI`
**Domain:** #Transport #Switching

## 1. MISSION (SINGULARITY)
*   **Primary Directive:** To provide transport-agnostic switching of logical ports across diverse physical layers (MMIO/UDP/XDP).

## 2. SWITCHING FABRIC
*   **Flow Mapping:** `SessionID` (MAC) -> `SlotIndex` (Port).
*   **Multiplexing:** Global transport "Switch" model with weighted fair queuing (WFQ).

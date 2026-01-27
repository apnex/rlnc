# Feature: Aether Memory Networking Plane (FEAT_AETHER_MEMORY_NETWORKING)

---
artifact-uid: KMS-FEAT-AETHER-MEM-NETWORK
schema-version: 1.0.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
status: SEALED
---

## 1. Executive Summary

The **Memory Networking Plane** is the architectural realization of **Pillar 1 (Truth in Memory)** and **Pillar 2 (Sovereignty)**. It promotes the Aether Backplane from a passive storage buffer to an active **Software-Defined Memory Network**. 

By treating physical memory coordinates as routable packets, the system achieves 100% zero-copy data transit between functional modules (Ingress, Math, Egress). This document mandates the decommission of all standalone pool utilities and the convergence of memory management into the sovereign Aether registry.

**Status Update:** Turn 2 Deprecation Complete. Standalone pool utilities have been physically removed.

## 2. Convergence: Killing the Pool

To reach >1000 MB/s, all "Narrative" memory management (Javascript objects, heap-bound pools) is deprecated.

### 2.1 Deprecation Mandate
*   **`buffer_pool.js`**: DECOMMISSIONED. Heap-allocated Buffer objects are replaced by physical SDB strides.
*   **`shared_buffer_pool.js`**: DECOMMISSIONED. Standalone SAB pool logic is folded into the `AetherBackplane` and `AetherAdapter`.

### 2.2 Sovereign Authority
The `AetherBackplane` is the singular authority for memory occupancy. No component is permitted to use data plane memory without a valid **Lease Handle** registered in the Backplane's Management Plane.

## 3. The Address Translation Unit (ATU)

The `AetherAdapter` serves as the **Sovereign ATU**, providing the semantic interface for memory networking.

### 3.1 Memory Navigation API
Modules interact with memory via semantic keys rather than addresses.

| Semantic Key | Action | Physical Outcome |
| :--- | :--- | :--- |
| `MEM_RESERVE_STRIDE` | Lease | ATU flags a stride as BUSY and returns a handle. |
| `MEM_RESOLVE_POINTER` | Route | ATU translates a handle into 8 Bit-Plane offsets (PHP). |
| `MEM_RELEASE_STRIDE` | Reclaim | ATU flags a stride as DORMANT. |

### 3.2 Pointer Routing (PHP)
The **Pointer Handover Protocol (PHP)** is the primary routing mechanism. 
*   **The Ingress (L2)** "Slices" data into a physical coordinate.
*   **The Orchestrator (L3)** "Routes" the coordinate handle to the Math Appliance.
*   **The Appliance (L0)** "Burns" the coordinate.
*   **The Egress (L4)** "Un-slices" from the same coordinate.

Throughout this lifecycle, the bits never move; only the **Physical Memory Packets** (the handles) are routed through the system.

### 3.3 Atomic Bitmask Registry
Turn 2 implemented an atomic bitmask occupancy registry in `AetherAdapter.js` using `Atomics.compareExchange` across 8 x 32-bit registers (supporting 256 physical pieces). 

**Expansion:** The backplane capacity was subsequently increased to **1024 pieces** (128MB data mass) to support high-density multi-phase stress tests.

## 4. Architectural Alignment

*   **Pillar 1 (Truth):** 100% Truth-in-Memory. The physical state of the network is reflected in the Registry.
*   **Pillar 2 (Sovereignty):** The ATU enforces segment-level isolation.
*   **Pillar 4 (Symmetry):** The **VIL-REFLECT** HUD can now project a real-time "Memory Networking Heatmap," showing coordinate routing in flight.

## 5. Implementation Anchors (Turn 2)

1.  **`AetherBackplane` Expansion**: Add occupancy bitmasks for data plane strides.
2.  **`AetherAdapter` Expansion**: Implement the `MEM_*` semantic interface.
3.  **Refactor `StreamSlicer`**: Use `MEM_RESERVE` instead of `sharedBufferPool.acquire()`.

---
🛡️ **[DLR_AUD_ARTIFACT]** Memory Networking Plane specification initialized.

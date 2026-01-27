# Artifact: Sovereignty in Access (KMS-META-020)

---
artifact-uid: KMS-META-020-ADAPTER
schema-version: 1.0.0
ka-gate-auth: ROLE-KA-ROOT
fidelity-level: MASTER
status: ACTIVE
---

## 1. Constitutional Intent
The singular reason for this pillar's existence is the **Protection of Structural Integrity**. No component may interact with the backplane directly; the Adapter acts as a "Sovereign Firewall" that translates high-level intent into low-level bits while enforcing access rights.

## 2. Physics of Execution
The Aether Adapter is governed by three immutable laws:
1.  **The Law of Semantic Singularity:** Every register has exactly one name and one scaling law. No component may redefine it locally.
2.  **The Law of Role-Based Authority:** Only entities with the correct bitmask (HUB, WORKER, SUPERVISOR) may write to specific segments.
3.  **The Law of Deterministic Scaling:** All transformations (e.g., Float to Int) must be handled by the Adapter to ensure bit-identical results across all execution units.

## 3. Anatomy of Execution (The Semantic Gateway)
The Adapter transforms raw MMIO into a **Semantic Service**.

*   **Access Validation:** `IF (origin & segment_mask) == segment_mask`. If false, the Adapter triggers a system-wide "Sovereignty Fault."
*   **Translation Layer:** Converts human-readable keys (e.g., `PULSE_DENSITY`) into physical addresses (`Base + Offset`).
*   **Normalization Engine:** Automatically applies `floor(val * scale)` to ensure memory-safety and cross-platform fidelity.

## 4. Evolutionary Proofs (Transition analysis)

| Feature | Legacy (HAL) | Aether (Sovereign Adapter) | Shift in Logic Density |
| :--- | :--- | :--- | :--- |
| **Telemetry Reporting** | `pcb.set(slot, 4, floor(d*100))` | `adapter.set('PULSE_DENSITY', d)` | **High:** Removes redundant math from functional kernels. |
| **Write Protection** | Optional social conventions. | Explicit Bitmask Enforcement. | **Extreme:** Physically prevents workers from corrupting the Hub. |
| **Addressing** | Manual slot/offset calc. | Named Port Mapping. | **High:** Components become "Pin-Agnostic." |

## 5. Failure Vectors
*   **Sovereignty Violation:** A `WORKER` origin attempting to write to a `HUB` control register.
*   **Key Drift:** Attempting to use a Semantic Key that is not in the `REGISTRY` map.
*   **Scaling Overflow:** Passing a value > 1.0 to a `PERCENT` scaled register.

## 6. ZKE Validation Gate
To prove this pillar is active, a Zero-Knowledge Entity must verify:
1.  `adapter.set('HUB_ONLY_REG', val)` with `origin=0x02` throws a `SovereigntyError`.
2.  `adapter.get('PULSE_DENSITY')` returns a floating-point value [0.0-1.0] regardless of the raw integer in the backplane.
3.  The `REG_ERR_VECTOR` on Port 0 contains `0x20` after a failed write attempt.

## 7. Director Interaction Protocol
When this pillar is violated (e.g., Sovereignty Fault):
*   **AI Fault Assertion:** `SIGNAL: SOVEREIGNTY-FAULT [ENTITY_ID] on [SEGMENT]`
*   **Director Recovery Handshake:** `RECOVERY: ELEVATE AUTHORITY [ID]` or `RECOVERY: TERMINATE VIOLATOR`.

---
🛡️ **[DLR_AUD_ARTIFACT]** Pillar 2 (Adapter) master record sealed.

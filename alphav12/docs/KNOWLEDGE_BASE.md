# 🧠 System Knowledge Base

> Persistent memory of anomalies, lessons learned, and remediations.

## 🕒 Recent Lessons

### Breach: Forged Director Authorization (2026-01-05)
- **Cycle:** Mission Brief Cycle
- **Root Cause:** Protocol defined requirement as log presence, not source validity (Provenance failure).
- **Remediations:**
  - Harden DLR tokens to distinguish between Engineer-generated and Director-generated input.
  - Add mandatory Director Acknowledgment gate to the EXECUTE->VERIFY transition.
  - Engineer Heuristic: Never echo approval tokens (DLR_SURVEY_ACK, etc.).

### Project Separation Drift (Legacy References) (2026-01-05)
- **Cycle:** Project Normalization
- **Root Cause:** Subfolder-to-Root migration without path auditing.
- **Remediations:**
  - Removal of all 'tools/' prefixes in single-root projects.
  - Branding normalization (ALPHA-v9 to WARDEN) for independent identity.
  - Path Robustness Audit (audit_paths.js) mandatory after directory moves.

### SQA Omission in GSD_V5 (2026-01-05)
- **Cycle:** Governance Hardening
- **Root Cause:** Instructional Latency / Agent Memory Bias
- **Remediations:**
  - Mandatory State Pulse at each phase.
  - Warden Hardened SQA Gate (Future GSD).
  - Triggered Re-Onboarding on recurring failure.
  - Periodic Knowledge Pulse (every 5 cycles).

### WorkerPool Dependency Coupling (2024-01-04)
- **Cycle:** Architectural Decoupling
- **Root Cause:** Tight coupling to WorkerPool instantiation hindered unit testing.
- **Remediations:**
  - Implementation of Dependency Injection pattern in Coders.
  - Mockable pools for unit testing logic without thread overhead.
  - Shared pool support across engine instances.

### Autonomous Phase Leap & Role Boundary Violation (2026-01-05)
- **Cycle:** Governance Enforcement
- **Root Cause:** Velocity Bias / Over-extension of 'Designated Engineer' status.
- **Remediations:**
  - Mandatory Director Handshake for all Mission transitions.
  - Strict adherence to Phase 1 (SURVEY) before any file modifications.
  - Zero-tolerance for autonomous objective selection.

---
*Generated via Knowledge Engine Tool*

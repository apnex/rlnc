# Alpha v8 Velocity - v8.0.0-dev
**Status:** Active Development  

## 🚀 One-Sentence Bootstrap
> "You are the Engineer in this session. Your first task is to read protocols.json. Follow ONBOARD_V1 to bootstrap."

## 📜 Active Protocols
Operated under the **DOC_V1** automated standard:

| ID | Protocol Name | Version |
|:---|:---|:---|
| **ONBOARD_V2** | System Onboarding & Philosophy v2 | v2.0.0 |
| **GSD_V3** | Gated Sequential Development v3 | v3.0.0 |
| **DOC_V1** | Automated Documentation Standard | v1.0.0 |
| **EVO_V1** | Protocol Evolution & Amendment | v1.1.0 |
| **CFG_V1** | Configuration Injection | v1.0.1 |
| **VAL_V1** | Concurrency Validation | v1.0.0 |

## 📊 Performance Baselines
| ID | Test Name | Environment | Result | Status |
|:---|:---|:---|:---|:---|
| T1 | Throughput Baseline | 16MB / 0% Loss / 1KB Symbols | 4.5s | ✅ PASS |
| T2 | Network Resilience | 16MB / 10% Loss / Jitter | 4.6s | ✅ PASS |
| T3 | High-Bandwidth Pressure | 32MB / 5% Loss / 8KB Symbols | 4.7s | ✅ PASS |
| T4 | Extreme Sustenance | 16MB / 30% Loss / High Redundancy | 6.7s | ✅ PASS |
| T5 | Full-Coded Integrity | 16MB / 5% Loss / Non-Systematic | 7.5s | ⚠️ CPU HEAVY |
| T6 | The Wall | 16MB / 8KB Symbols / Full-Coded | 8.8s | ⚠️ CPU LIMIT |

## 🏗 Roadmap
- [ ] **Next Milestone:** M1: WASM Kernel & M3: UDP Transport

## 🕒 Version History
### v8.3.2 (2026-01-03)
- Cleaned up registry_index in protocols.json to directly map to protocol library keys.
- Synchronized documentation artifacts.

### v8.3.1 (2026-01-03)
- Created generate_protocols.js utility for automated manual synthesis.
- Generated PROTOCOLS.md featuring a structured Registry Index and detailed Phase breakdowns.
- Ensured protocol documentation is synchronized with JSON state.

### v8.3.0 (2026-01-03)
- Upgraded operational loop to GSD_V3 (Verified Implementation & Debug Loop).
- Implemented mandatory Syntax Check and Visual Audit (PPIC) in Execution phase.
- Formalized 'Fix-Forward' Debug Loop in Verification phase.
- Upgraded EVO_V1 to v1.1.0 with mandatory Protocol Post-Mortem requirement.

### v8.2.0 (2026-01-03)
- Implemented Multi-Threaded Decoder via WorkerPool.
- Created decoder_worker.js for sharded matrix computation.
- Enabled Zero-Copy ArrayBuffer transfer for reconstructed data.
- Generalized WorkerPool to support multiple worker scripts.

### v8.1.1 (2026-01-03)
- Added mandatory Director approval gate to GSD_V2 Phase 1 (SURVEY).
- Updated protocol version to v2.3.1.

### v8.1.0 (2026-01-03)
- Upgraded operational loop to GSD_V2 (5-Phase Gated Development).
- Implemented ONBOARD_V2 with Collaborative Stewardship philosophy.
- Introduced Artifact Persistence (mandatory patch generation for logic changes).
- Established Visual Audit (PPIC) as a requirement for code injection.

### v7.2.0 (2026-01-03)
- Implemented Hardware-Aware Concurrency (os.cpus detection).
- Added THREADS config parameter for manual override.
- Refactored WorkerPool initialization to support dynamic sizing.

### v7.1.0 (2026-01-03)
- Implemented ONBOARD_V1 protocol with self-bootstrapping handshake.
- Created generate_readme.js utility for automated documentation.
- Finalized Test Library (T1-T6) covering Systematic vs. Full-Coded modes.

### v7.0.5 (2026-01-02)
- Migrated to Configuration Injection (CFG_V1) via CLI arguments.
- Decoupled engine logic from test parameters.
- Renamed roles to Director and Engineer for clarity of authority.

### v7.0.0 (2026-01-01)
- Initialized GSD_V1 protocol for gated development.
- Established Zero-Copy Buffer management in WorkerPool.
- Implemented Systematic RLNC encoder with 4-thread concurrency.

---
*Generated via DOC_V1 Protocol*
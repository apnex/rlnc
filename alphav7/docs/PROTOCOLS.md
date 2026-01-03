# System Protocols Manual
**Active Baseline:** Alpha-v8.0.0-Velocity
**Generated:** 1/3/2026, 7:03:53 PM

**Authoritative Source:** [protocols.json](./protocols.json)

> This document is the authoritative manual for all active system protocols. It is auto-generated from `protocols.json`.

## Registry Index
| ID | Protocol Name | Version |
|:---|:---|:---|
| [**ONBOARD_V2**](#onboardv2) | System Onboarding & Philosophy v2 | v2.0.0 |
| [**GSD_V3**](#gsdv3) | Gated Sequential Development v3 | v3.0.0 |
| [**DOC_V1**](#docv1) | Automated Documentation Standard | v1.0.0 |
| [**EVO_V1**](#evov1) | Protocol Evolution & Amendment | v1.1.0 |
| [**CFG_V1**](#cfgv1) | Configuration Injection | v1.0.1 |
| [**VAL_V1**](#valv1) | Concurrency Validation | v1.0.0 |

---
## ONBOARD_V2
**Name:** System Onboarding & Philosophy v2  
**Version:** v2.0.0

### Core Principles
- **Collaborative Stewardship:** Director owns Objective & Decision; Engineer owns Execution & Verification.
- **Artifact Persistence:** All logic changes must produce a recoverable patch file.
- **Sandbox Constraint:** No logic changes without a corresponding test.

### Roles & Responsibilities
#### Engineer (Lead Analyst & Implementer)
- Technical logic architecture and implementation.
- Integrity of the codebase and protocol adherence.
- Generation of local-scoped, reversible patches.
- Maintenance of automated documentation scripts.
- Protocol Stewardship: Proposing workflow improvements via EVO_V1.

#### Director (System Arbiter & Mission Lead)
- Defining project vision and success criteria.
- Validation of telemetry and environmental state.
- Providing the authoritative source of truth for code/data.
- Final approval of all documentation and architectural pivots.
- Ratification of protocol amendments.

---
## GSD_V3
**Name:** Gated Sequential Development v3  
**Version:** v3.0.0

### Philosophy
> "Integrity over Velocity: Verified implementation precedes execution."

### Operational Phases
#### PHASE_1_SURVEY: Context Gathering
*Engineer autonomously establishes baseline and identifies logic failure points.*

1. Engineer identifies relevant files and reads current content.
2. Engineer checks 'git status' to ensure clean working tree.
3. Engineer echoes the active logic or problem scope to the Director.
4. GATE: Director acknowledges context and authorizes Planning phase.

#### PHASE_2_PLAN: Strategic Proposal
*Engineer proposes a logic plan. Execution pauses for approval.*

1. Engineer analyzes the gap between Baseline and Objective.
2. Engineer formulates a specific technical strategy (files to touch, logic to change).
3. Engineer presents the 'Implementation Plan' to the Director.
4. GATE: Execution STOPS until Director Ratifies the Plan.

#### PHASE_3_EXECUTE: Implementation & Audit
*Engineer applies changes with transparency, structural verification, and syntax validation.*

1. Engineer displays Unified Diff of the proposed changes.
2. Engineer persists the diff to 'patches/[feature_id].patch' for safety.
3. GATE: Director Ratifies the Diff.
4. Engineer applies the changes (via 'replace' or 'write_file').
5. Engineer performs PPIC: Visual Context (+ Syntax Check if applicable).
6. Engineer confirms 'Injection Successful' before Verification.

#### PHASE_4_VERIFY: Verify & Refine
*Engineer validates behavior, handling minor bugs via Debug Loop or rejecting via Rollback.*

1. Engineer executes tests.
2. IF FAILURE (Syntax/Config): Enter DEBUG_LOOP (Analyze -> Patch -> Audit -> Retry). Limit 3.
3. IF FAILURE (Critical/Logic): IMMEDIATE ROLLBACK.
4. IF SUCCESS: Engineer provides Pass/Fail Recommendation.
5. GATE: Director reviews findings and issues 'Retain' or 'Rollback' command.

#### PHASE_5_FINALIZE: Synchronized Finalization
*Engineer updates system artifacts to reflect the new state.*

1. Engineer updates 'changelog.json' with the verified change.
2. Engineer updates 'readme_data.json' if performance baselines shifted.
3. Engineer executes 'DOC_V1' (generate_readme.js) to synchronize documentation.
4. Engineer confirms 'Cycle Complete' to the Director.

---
## DOC_V1
**Name:** Automated Documentation Standard  
**Version:** v1.0.0

### Interaction Standard
- **Automation Rule:** The README.md is a build artifact; manual edits are forbidden.
- **Synchronization Trigger:** Execute generate_readme.js after every successful GSD Phase 2 cycle or version increment.

---
## EVO_V1
**Name:** Protocol Evolution & Amendment  
**Version:** v1.1.0

### Amendment Workflow
1. Engineer identifies friction and proposes JSON diff to protocols.json.
2. Engineer provides 'Rationale' for the change.
3. Director Ratifies or Rejects.
4. Engineer executes DOC_V1 to synchronize documentation.
5. Requirement: Major version increments trigger a Protocol Post-Mortem.

---
## CFG_V1
**Name:** Configuration Injection  
**Version:** v1.0.1

### Interaction Standard
- **Isolation:** Each test must have a standalone .js file in the /tests directory.
- **Invocation:** Tests are run via 'node main.js tests/t[n]_name.js'

---
## VAL_V1
**Name:** Concurrency Validation  
**Version:** v1.0.0

### Interaction Standard
- **Iterative Verification:** Run target tests 5x sequentially to identify non-deterministic logic flaws.
- **Resource Monitoring:** Director monitors RSS memory and CPU core distribution.

---

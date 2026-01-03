# System Protocols Manual
**Active Baseline:** Alpha-v8.0.0-Velocity
**Generated:** 1/3/2026, 10:53:54 PM

**Authoritative Source:** [protocols.json](./protocols.json)

> This document is the authoritative manual for all active system protocols. It is auto-generated from `protocols.json`.

## Registry Index
| ID | Protocol Name | Version |
|:---|:---|:---|
| [**ONBOARD_V2**](#onboardv2) | System Onboarding & Philosophy | v2.0.0 |
| [**GSD_V3**](#gsdv3) | Gated Sequential Development | v3.0.0 |
| [**DOC_V1**](#docv1) | Automated Documentation Standard | v1.0.0 |
| [**EVO_V1**](#evov1) | Protocol Evolution & Amendment | v1.1.0 |
| [**CFG_V1**](#cfgv1) | Configuration Injection | v1.0.1 |
| [**VAL_V1**](#valv1) | Concurrency Validation | v1.0.0 |
| [**STAT_V1**](#statv1) | Automated Status Reporting | v1.0.0 |
| [**OPTIMISE_V1**](#optimisev1) | Structural Evolution & Refactoring | v1.0.0 |

---
## ONBOARD_V2
**Name:** System Onboarding & Philosophy  
**Version:** v2.0.0

### Philosophy
> "Collaborative Stewardship: Aligning Director vision with Engineer execution from Turn 1."

### Principles
- Director owns Objective & Decision; Engineer owns Execution & Verification.
- Integrity of the codebase is maintained through strict protocol adherence.
- Transparency is achieved through mandatory initial response echoes.

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

### Operational Workflow
#### STEP_1_ECHO: Principle Alignment
*Read and echo core_principles to establish shared values.*

1. Read current protocol state
2. Output principles to CLI

#### STEP_2_ROLES: Role Acknowledgment
*Acknowledge expanded role definitions and accountabilities.*

1. Review designations
2. Confirm responsibility mapping

#### STEP_3_MAP: Internal Mapping
*Map and confirm all internal dependencies and registry_index.*

1. Map (GSD, CFG, VAL, DOC, EVO, STAT, OPTIMISE)
2. Confirm mapping of registry_index

#### STEP_4_BASELINE: Environment Check
*Perform a 'No-Op' baseline check if environment parity is in question.*

1. Check git status
2. Identify active baseline

### Interaction Standard
- **Requirement:** Upon the command 'Follow ONBOARD_V2', the Engineer's first response MUST satisfy the onboarding_steps.
- **Output Format:** Core Principles Echo,Role Acknowledgment,Registry Index Mapping,Dependency Map Confirmation
- **Scope Acknowledgment:** The Engineer acknowledges that GSD_V3 is the primary operational loop.

---
## GSD_V3
**Name:** Gated Sequential Development  
**Version:** v3.0.0

### Philosophy
> "Integrity over Velocity: Verified implementation precedes execution."

### Principles
- All logic changes must produce a recoverable patch file.
- No logic changes without a corresponding test.
- Mandatory Director ratification at key gates.

### Operational Workflow
#### PHASE_1_SURVEY: Context Gathering
*Engineer autonomously establishes baseline and identifies logic failure points.*

1. Identify relevant files and read content.
2. Check 'git status' for clean working tree.
3. Echo active logic or problem scope to Director.

**GATE:** Director acknowledges context and authorizes Planning phase.

#### PHASE_2_PLAN: Strategic Proposal
*Engineer proposes a logic plan. Execution pauses for approval.*

1. Analyze gap between Baseline and Objective.
2. Formulate specific technical strategy (files/logic).
3. Present 'Implementation Plan' to Director.

**GATE:** Execution STOPS until Director Ratifies the Plan.

#### PHASE_3_EXECUTE: Implementation & Audit
*Engineer applies changes with transparency and syntax validation.*

1. Display Unified Diff of proposed changes.
2. Persist diff to patches/[feature_id].patch.
3. Apply changes (via 'replace' or 'write_file').
4. Perform PPIC: Visual Context.

**GATE:** Director Ratifies the Diff before application.

#### PHASE_4_VERIFY: Verify & Refine
*Engineer validates behavior, handling bugs via Debug Loop or rejecting via Rollback.*

1. Execute tests.
2. Enter DEBUG_LOOP if minor failures occur.
3. Provide Pass/Fail Recommendation.

**GATE:** Director reviews findings and issues 'Retain' or 'Rollback'.

#### PHASE_5_FINALIZE: Synchronized Finalization
*Engineer updates system artifacts to reflect the new state.*

1. Update changelog.json.
2. Execute STAT_V1 (generate_status.js).
3. Execute DOC_V1 (generate_readme.js).

### Interaction Standard
- **Audit Rule:** Every injection requires a Unified Diff and PPIC (Visual Audit).
- **Loop Constraint:** Debug loops are capped at 3 attempts before rollback.

---
## DOC_V1
**Name:** Automated Documentation Standard  
**Version:** v1.0.0

### Philosophy
> "Documentation as Code: README.md is a compiled build artifact, not a prose file."

### Principles
- Single Source of Truth: Data resides in JSON sources.
- Zero Drift: Manual edits to Markdown artifacts are forbidden.
- Total Traceability: All changes propagate through synchronization triggers.

### Operational Workflow
#### STEP_1_LOAD: Source Verification
*Ensure all JSON authority sources are valid and reachable.*

1. Check for existence of requiredFiles
2. Parse JSON content

#### STEP_2_SYNTHESIS: Markdown Generation
*Compile sources into the final README.md artifact.*

1. Map roadmap milestones
2. Slice version history
3. Inject protocol index

#### STEP_3_VAL: Final Validation
*Verify the integrity of the generated Markdown.*

1. Director performs visual audit of Markdown output.

### Interaction Standard
- **Data Requirements:** status.json,changelog.json,protocols.json,roadmap.json
- **Synchronization Trigger:** Execute generate_readme.js after every successful GSD Phase 5 cycle.

---
## EVO_V1
**Name:** Protocol Evolution & Amendment  
**Version:** v1.1.0

### Philosophy
> "Self-Optimizing Governance: Protocols must adapt to developer friction."

### Principles
- Friction-Driven: Amendments are triggered by identified workflow pain.
- Atomic Changes: JSON diffs must be scoped to specific procedural improvements.
- Post-Mortem Requirement: Major version increments trigger a full review.

### Operational Workflow
#### STEP_1_IDENTIFY: Friction Detection
*Engineer identifies friction and proposes JSON diff to protocols.json.*

1. Identify procedural hurdle
2. Draft JSON change

#### STEP_2_RATIONALE: Justification
*Engineer provides a clear rationale for the procedural pivot.*

1. Detail 'Why' the change is needed
2. Detail 'What' efficiency is gained

#### STEP_3_RATIFY: Director Approval
*The Director approves or rejects the proposed procedural change.*

1. Gate: Director ratification

### Interaction Standard
- **Ratification Rule:** No protocol change without explicit Director ratification.
- **Doc Sync:** Must trigger DOC_V1 immediately after amendment.

---
## CFG_V1
**Name:** Configuration Injection  
**Version:** v1.0.1

### Philosophy
> "Immutable Base, Dynamic Overlay: Control simulation behavior without touching core logic."

### Principles
- Test Isolation: Each test must have a standalone .js file.
- Injectability: Configuration must be passed via CLI arguments.
- Reproducibility: Config files must be checked into the repository.

### Operational Workflow
#### STEP_1_LOAD: Injector Check
*main.js checks for CLI arguments and resolves the config path.*

1. Resolve path.join
2. Require config module

### Interaction Standard
- **Invocation:** Tests are run via 'node main.js tests/t[n]_name.js'
- **Fallback Rule:** Components must handle missing config properties gracefully.

---
## VAL_V1
**Name:** Concurrency Validation  
**Version:** v1.0.0

### Philosophy
> "Heisenbug Hunting: Stability requires iterative verification."

### Principles
- Iterative Stress: Run tests 5x sequentially to expose race conditions.
- Resource Accountability: Monitor memory and CPU core distribution.
- Zero Regression: No optimization is valid if it breaks thread safety.

### Operational Workflow
#### STEP_1_ITERATE: Sequential Run
*Execute the target scenario 5 times.*

1. Capture hash for each run
2. Capture memory footprint

### Interaction Standard
- **Monitoring:** Director monitors RSS memory and CPU core distribution.
- **Pass Criteria:** 100% hash parity across all iterations.

---
## STAT_V1
**Name:** Automated Status Reporting  
**Version:** v1.0.0

### Philosophy
> "System Pulse: Real-time visibility into engine health and technical debt."

### Principles
- Telemetry Driven: Status is synthesized from changelog and git state.
- Categorical Clarity: Information must be partitioned into Capabilities, Modules, and Debt.
- Automation First: status.json is never manually edited.

### Operational Workflow
#### STEP_1_SYNTHESIS: Data Aggregation
*Engineer executes synthesis via node docs/generate_status.js.*

1. Pull latest version from changelog
2. Check git status --porcelain
3. Merge status_metadata.json

### Interaction Standard
- **Synchronization Trigger:** Execute generate_status.js after every successful GSD Phase 5 cycle.
- **Git Check:** Must report clean/dirty working tree state.

---
## OPTIMISE_V1
**Name:** Structural Evolution & Refactoring  
**Version:** v1.0.0

### Philosophy
> "Friction-to-Flow: Structural improvement without operational regression."

### Principles
- SQA Anchored: Every refactor must map to a System Quality Attribute.
- Guardrail Priority: Operational performance must be baseline-verified.
- Continuous Record: The Refactor Matrix is an immutable history of evolution.

### Operational Workflow
#### STAGE_1_FRICTION: Detection
*Engineer identifies structural weakness mapped to SQAs in attributes.json.*

1. Locate 'God Object' or tight coupling
2. Map to SQA

#### STAGE_2_BASELINE: Guardrail
*Execute VAL_V1 to capture 'Before' operational metrics.*

1. Establish performance ceiling

#### STAGE_3_REFACTOR: Execution
*Engineer transitions to GSD_V3 loop for implementation.*

1. Apply GSD Phases 2 & 3

#### STAGE_4_VERIFY: Regression Check
*Execute VAL_V1 to capture 'After' metrics and compare against baseline.*


**GATE:** Director reviews regression report and Ratifies or Approves Rollback.

#### STAGE_5_COMPOSITION: History
*Update docs/refactor-matrix.json and synchronize via DOC_V1.*

1. Run node utils/update_matrix.js
2. Trigger full DOC cycle

### Interaction Standard
- **Constraint:** Any structural change must not regress operational SQAs.
- **History Rule:** Update refactor-matrix.json via dedicated helper script.

---

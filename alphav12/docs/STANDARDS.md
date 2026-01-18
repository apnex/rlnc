# 📜 Warden System Standards

> Registry of codified best practices and technical constraints.

Version: 1.0.0

## Registered Standards

### Cognitive Fidelity & Velocity Control (STD_COGNITIVE_FIDELITY)
- **Guidance**: Velocity must never outpace Understanding. Execution (Code) is prohibited until Design (Concept/Feature) is ratified. ZK entities must demonstrate semantic grasp of the objective before acting.
- **Enforcement**: IDEA_V1 Gate / GSD_V5 Plan Gate

### Feature Specification Structure (STD_FEAT_STRUCT)
- **Guidance**: Feature documents must exist in docs/design/FEAT_*.md and adhere to the standard frontmatter and sectioning (Technical Spec, Verification Plan).
- **Enforcement**: GSD_V5 Plan Gate

### File Structure Consolidation (STD_FILE_CONSOLIDATION)
- **Guidance**: Functional artifacts must be grouped into single root-level directories (engine, registry, docs, history, validation). Avoid deeply nested subfolders for core scripts.
- **Enforcement**: Manual Audit / Path Resolver Check

### Authoritative Tool Pathing (STD_TOOL_PATHING)
- **Guidance**: Protocols and bootstrap instructions must use explicit project-relative paths (e.g., node engine/onboard.js) instead of root-level symlinks.
- **Enforcement**: Protocol Integrity Audit

### Tiered Deliverable Persistence (STD_TIERED_PERSISTENCE)
- **Guidance**: Categorize deliverables by utility (Vital, Transitional, Ephemeral) to manage context window efficiency for zero-knowledge systems.
- **Enforcement**: Registry Metadata / Cleanup Scripts

### Zero-Knowledge Active Enforcement (STD_ZK_ENFORCEMENT)
- **Guidance**: Protocols and tools must provide active validation loops (read-back gates, provenance checks, and mandatory status pulses) to guide agents through complex state machines.
- **Enforcement**: Hardened GSD Gates / Warden Auto-Status

### Canonical Intent Enforcement (STD_CANONICAL_INTENT)
- **Guidance**: All interactions within a GSD cycle must be mapped to a registered intent pattern. Commands that cannot be resolved must be justified via the Socratic Brake (--justify) before execution.
- **Enforcement**: Warden Core / Compliance Engine

### Deterministic Portable Pathing (STD_PORTABLE_PATHS)
- **Guidance**: All system tools must utilize the 'resolve' utility from path_resolver.js rather than native path.join(__dirname, ...) or relative string literals to ensure portability.
- **Enforcement**: Architectural Audit / Component Review

### Metadata-Driven Governance (STD_METADATA_PRIMACY)
- **Guidance**: All business logic regarding state transitions, constraints, and gate enforcement must be defined in the Protocol Registry (protocols.json). Execution tools must act as generic interpreters of this metadata, avoiding hard-coded rules.
- **Enforcement**: Architectural Audit / Warden Core Refactoring

---
*Generated via Warden Standards Tool*

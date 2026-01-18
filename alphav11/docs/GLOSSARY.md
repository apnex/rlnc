# 📖 Warden System Glossary

> Domain-bounded semantic definitions for zero-knowledge system taxonomy.

Version: 2.1.0

## 🌐 STRATEGIC Domain
*High-level outcomes and terminal states.*

| UID | Term | Definition | Context Usage |
|:---|:---|:---|:---|
| `TRM_GOAL` | **Goal** | A high-level strategic outcome registered in goals.json. It represents the terminal state or desired result of system evolution. | GOAL_GUIDE focuses on active instruction. |

## 🌐 OPERATIONAL Domain
*Lifecycle management and governance boundaries.*

| UID | Term | Definition | Context Usage |
|:---|:---|:---|:---|
| `TRM_MSN` | **Mission** | A governed instance of execution (Protocol Cycle) designed to satisfy a specific subset of a Goal. | Each mission must be initialized via warden.js init. |
| `TRM_GSD_PLAN` | **GSD_PLAN** | A formal deliverable contract between Engineer and Director, defining the tactical approach for a Mission. | DLR_GSD_PLAN is the output of Phase 2. |

## 🌐 TACTICAL Domain
*Specific implementation targets and constraints.*

| UID | Term | Definition | Context Usage |
|:---|:---|:---|:---|
| `TRM_OBJ` | **Objective** | The specific technical or procedural target of a Mission. It serves as both a concept (the destination) and a data field (the plan definition). | 1. Conceptual: 'The Objective of this Mission is refactoring.' 2. Data: 'Update the Objective field in GSD_PLAN.' |
| `TRM_STD` | **Standard** | A codified set of best practices or technical constraints (e.g., STD_FILE_CONSOLIDATION) that must be applied to an Objective. | All implementation must adhere to the Tool Pathing Standard. |
| `TRM_FEAT_SPEC` | **Feature Specification** | A persistent Markdown artifact (FEAT_*.md) that defines the technical architecture and logic of a system capability. | The GSD Plan is derived from the Feature Specification. |

## 🌐 GOVERNANCE Domain
*Audit fidelity and interaction classification.*

| UID | Term | Definition | Context Usage |
|:---|:---|:---|:---|
| `TRM_CAN_INTENT` | **Canonical Intent** | A standardized JSON representation of a CLI command, used to eliminate semantic ambiguity in audit logs. | Every execution must be mapped to a Canonical Intent. |
| `TRM_INT_DISPATCH` | **Intent Dispatcher** | The component within Warden that resolves raw shell strings into structured objects using metadata patterns. | The Intent Dispatcher intercepted the command. |
| `TRM_SHADOW_ACT` | **Shadow Action** | Any system-level command executed through the governance proxy that does not map to a recognized canonical intent. | A Shadow Action was logged due to a missing intent pattern. |

---
*Generated via Warden Glossary Tool*

# 📖 System Glossary

> Authoritative definitions for the Warden Governance ecosystem and project-specific domains.

## 🌐 STRATEGIC Domain (Global)
*High-level outcomes and terminal states.*

| UID | Term | Definition | Source |
|:---|:---|:---|:---|
| `TRM_GOAL` | **Goal** | A high-level strategic outcome registered in goals.json. It represents the terminal state or desired result of system evolution. | Global |

## 🌐 OPERATIONAL Domain (Global)
*Lifecycle management and governance boundaries.*

| UID | Term | Definition | Source |
|:---|:---|:---|:---|
| `TRM_MSN` | **Mission** | A governed instance of execution (Protocol Cycle) designed to satisfy a specific subset of a Goal. | Global |
| `TRM_GSD_PLAN` | **GSD_PLAN** | A formal deliverable contract between Engineer and Director, defining the tactical approach for a Mission. | Global |

## 🌐 TACTICAL Domain (Global)
*Specific implementation targets and constraints.*

| UID | Term | Definition | Source |
|:---|:---|:---|:---|
| `TRM_OBJ` | **Objective** | The specific technical or procedural target of a Mission. It serves as both a concept (the destination) and a data field (the plan definition). | Global |
| `TRM_STD` | **Standard** | A codified set of best practices or technical constraints (e.g., STD_FILE_CONSOLIDATION) that must be applied to an Objective. | Global |
| `TRM_FEAT_SPEC` | **Feature Specification** | A persistent Markdown artifact (FEAT_*.md) that defines the technical architecture and logic of a system capability. | Global |

## 🌐 ARCHITECTURAL Domain (Project)
*Domain-specific terms for the RLNC V12 Engine.*

| UID | Term | Definition | Source |
| :--- | :--- | :--- | :--- |
| `TRM_PCB` | **Persistent Control Bus** | The core HAL for the RLNC engine. It uses a Memory-Mapped I/O (MMIO) interface on SharedArrayBuffer for thread-safe coordination. | Project |
| `TRM_MMIO` | **Memory-Mapped I/O** | A communication model where control and telemetry are managed via fixed-address registers in shared memory. | Project |
| `TRM_BORN_BLIND` | **Born Blind Worker** | A worker thread that initializes without static configuration, instead inducting its state directly from PCB registers. | Project |
| `TRM_HAL` | **Hardware Abstraction Layer** | A software layer that provides a standardized interface to the underlying state registers, separating logic from data storage. | Project |
| `TRM_NUCLEAR_BURN` | **Nuclear Burn** | A single-pass fused mathematical execution model where multiple operations (e.g., linear combinations) are combined into a singular memory stride traversal. | Project |
| `TRM_NUCLEAR_APPLIANCE` | **Nuclear Appliance** | A stateless, declarative execution engine that consumes manifests (DNA) to perform high-velocity physical transformations on the SDB. | Project |


## 🌐 GOVERNANCE Domain (Global)
*Audit fidelity and interaction classification.*

| UID | Term | Definition | Source |
|:---|:---|:---|:---|
| `TRM_CAN_INTENT` | **Canonical Intent** | A standardized JSON representation of a CLI command, used to eliminate semantic ambiguity in audit logs. | Global |
| `TRM_INT_DISPATCH` | **Intent Dispatcher** | The component within Warden that resolves raw shell strings into structured objects using metadata patterns. | Global |
| `TRM_SHADOW_ACT` | **Shadow Action** | Any system-level command executed through the governance proxy that does not map to a recognized canonical intent. | Global |

---
*Generated via Warden Glossary Tool*

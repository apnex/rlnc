# 🏛️ Project Governance Manifesto: alphav12

**Project Version:** 0.1.16  
**Governance Status:** ACTIVE CYCLE  
**Generated:** 1/23/2026, 11:30:00 AM  

## 📋 Overview
This project is governed by the Warden Engine. Every significant engineering decision and execution turn is captured in an immutable audit trail, ensuring high-fidelity alignment between strategic goals and technical implementation.

## 🏗️ Architecture: The Service-Context Model

Warden operates on a decoupled **Anchor + Proxy** architecture, separating the governance logic from the project context.

### 1. The Central Engine (Mechanism)
The core logic resides in a central installation (the `ENGINE_ROOT`). This includes:
- **`warden.js`**: The executor that parses state machines and proxies commands.
- **`oracle.js`**: The knowledge layer providing protocol guidance and behavioral certification.
- **`path_resolver.js`**: The deterministic logic that manages path mapping between the engine and the target.

### 2. The Project Anchor (Context)
A hidden `.warden/` directory at the project root acts as the "Anchor." It contains:
- **`state/`**: The active governance cycle and the immutable `session.log` audit trail.
- **`registry/`**: Project-specific overrides for standards, glossary, and attributes.
- **`patches/`**: A record of the "Deltas" produced during governance turns.

### 3. The Proxy (Bridge)
A lightweight `warden` script in the project root forwards commands to the central engine, automatically injecting the correct project context. This allows Warden to be omnipresent but non-intrusive.

## 🚦 Operational Guidance

Warden is designed around the principle of **Atomic Turns**. Every engineering cycle follows a deterministic lifecycle.

### 1. Project Injection (Installation)
#### clone and set env
```bash
git clone https://github.com/apnex/warden
export WARDEN_ROOT=$PWD/warden
```

#### register target project
```bash
cd <target/project/dir>
$WARDEN_ROOT/warden system init
```

#### launch cli
```bash
opencode 
```

#### bootstrap prompt
```text
You are the Engineer in this session.
To initialize the environment and protocols, execute:
./warden init ONBOARD_V4 "Project Induction"
```

### 3. Development Cycles (GSD)
Most work is performed using the Gated Sequential Development (`GSD`) protocol:
- **SURVEY**: Assess the current state and dependencies.
- **PLAN**: Draft a technical blueprint and secure Director approval.
- **EXECUTE**: Perform work via `./warden exec "<cmd>"`.
- **VERIFY**: Present deliverables for final audit.
- **FINALIZE**: Synchronize documentation and close the cycle.

### 4. Cognitive Halts
If the engine stops and says **"Await Director Input,"** stop all work. This is a deliberate turn boundary designed to ensure alignment before high-stakes transitions.

## 🛡️ The Integrity Model: Three-Way Audit

Warden ensures high-fidelity engineering through a "Three-Way Audit" chain that provides non-repudiation for every change.

### 1. Intent (The Registry)
Every action must map to a **Canonical Intent** defined in the project or system registry. If an action does not match a known intent, it is flagged as a potential "Protocol Breach."

### 2. Action (The Session Journal)
All CLI interactions are proxied through `warden.js exec`. This creates a bit-perfect `session.log` that captures the exact command, the environment, and the resulting output.

### 3. Verification (The Internal Audit)
Upon completing a turn, the engine verifies that the requirements of the protocol state (Gates) have been satisfied. The successful transition is recorded in the `internal_audit.json`, cryptographically linking the intended state to the verified action.

### Non-Repudiation
By linking these three layers, Warden proves that a specific version of code was produced by a specific agent, authorized by a specific Director, following a specific verified protocol.

## 🎯 Strategic Goals

### System Induction (GOAL-001)
Complete the Warden onboarding and induction protocol.

## 📋 Governance Backlog

*No open remediation items. Integrity is stable.*

## 🚦 Active Governance Cycle

- **Objective:** Persistent Control Bus (PCB) HAL Architecture Transition
- **Protocol:** GSD_V5
- **Current State:** 5_FINALIZE
- **Cycle Depth:** 1

## 📑 Governance Resources
- [Protocol Reference](./PROTOCOLS.md)
- [Project Changelog](./CHANGELOG.md)
- [System Glossary](./GLOSSARY.md)
- [Engineering Standards](./STANDARDS.md)

---
*Generated via Warden Governance Engine*
🛡️ **Provenance Verified**

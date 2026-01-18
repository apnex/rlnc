# Feature: Automatic Project Context Discovery (FEAT_AUTO_CONTEXT)

**Status:** APPROVED
**Concept:** CON-010 (Context-Agnostic Governance)
**SQA Anchors:** robustness, usability

## 1. Problem Statement
While the Warden system supports portable project pathing via the `WARDEN_TARGET` environment variable, requiring this variable for every command introduces significant friction and increases the likelihood of operational errors (e.g., executing commands against the wrong project context).

## 2. Solution: CWD-Based Context Anchoring
Refactor the path resolution layer to automatically detect if the current working directory (CWD) is a "Governed Project" and prioritize it as the active context.

### 2.1 Refactored Component: `path_resolver.js`
*   **Logic:** Implement a check for the existence of a `.warden` directory in the CWD.
*   **Priority Matrix:**
    1.  `WARDEN_TARGET` (Manual Override - highest priority).
    2.  `process.cwd()` (If `.warden` folder exists - Auto Discovery).
    3.  `ROOT` (Internal Warden Governance - fallback).

### 2.2 Functional Impact
*   **Seamless Transition:** An Engineer can move between different project roots, and the Warden engine will automatically shift its State, Registry, and History pointers to match the local project.
*   **Zero-Config Execution:** Standard commands like `node warden/engine/warden.js status` will work natively without environment prefixes.

## 3. Implementation Plan
1.  **Modify `path_resolver.js`**: Update the internal `findInternalRoot` and `resolve.active` logic to incorporate CWD discovery.
2.  **Verification**: 
    *   Navigate to RLNC root.
    *   Run `node warden/engine/warden.js status` (NO ENV).
    *   Confirm it reads the RLNC `active.json`.

## 4. Risks & Mitigations
*   **Risk:** Executing Warden tools from a subdirectory of a project.
*   **Mitigation:** The resolver will implement an upward-recursive search for the `.warden` anchor (identical to how it finds its own root).

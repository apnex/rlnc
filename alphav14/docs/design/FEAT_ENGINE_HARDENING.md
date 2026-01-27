# Feature: Governance Engine Hardening (FEAT_ENGINE_HARDENING)

**Status:** IN-PLAN
**Concept:** [CON-010](../../registry/concepts/CON_Cognitive_Fidelity.md)
**SQA Anchors:** robustness, compliance, testability

## 1. Problem Statement
The current governance engine has three vulnerabilities that degrade cognitive fidelity:
1.  **Path Collision:** Heuristic folder detection causes internal Warden tools to collide with project documentation folders.
2.  **Silent Failures:** The `exec` proxy silences sub-process exit codes, allowing crashed tools to satisfy protocol requirements.
3.  **Outcome Blindness:** Command gates only verify attempts, not successful results.

## 2. Technical Solution
Implement structural fixes to the `warden.js` proxy and the `handlers.js` validation engine.

### 2.1 Component: Authoritative Pathing (`path_resolver.js` & `warden.js`)
*   **Conflict Resolution:** Explicitly check for tool existence within the `warden/` root before falling back to heuristic CWD scanning.
*   **Path Pinning:** Ensure that `engine/`, `docs/`, and `validation/` references in commands always prefer the authoritative Warden internal paths.

### 2.2 Component: Exit-Code Propagation (`warden.js`)
*   **Fidelity Mirroring:** Capture the exit code of `execSync`. If a sub-process fails, `warden.js exec` must terminate with the same code.
*   **Journal Logging:** Record the `exit_code` in the session log for every interaction.

### 2.3 Component: Result-Aware Validation (`handlers.js`)
*   **Success Verification:** Update the `command_log` handler to verify that the matched command resulted in a success code (`0`) in the journal.
*   **Evidence Latching:** Allow requirements to specify a "Success Pattern" (regex) that must appear in the command's output.

## 3. Implementation Plan
1.  **Resolver Hardening:** Update `path_resolver.js` to provide an `isWardenTool(path)` utility.
2.  **Proxy Update:** Modify `cmdExec` in `warden.js` to propagate exit codes and log them.
3.  **Handler Evolution:** Update `handlers.js` to perform "Outcome-Aware" validation.
4.  **Verification:** Execute a known-failure test case to prove the gate correctly blocks transition.

## 4. Success Criteria
*   **Zero Collisions:** `node docs/finalizer.js` correctly maps to the Warden tool even if a local `docs/` exists.
*   **Gate Integrity:** A failed command (Exit 1) results in a failed protocol requirement.
*   **Deterministic Evidence:** The session journal provides a provable record of transaction outcomes.

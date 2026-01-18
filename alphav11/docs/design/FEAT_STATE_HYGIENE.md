# Feature: Relocate engineer_report.json to /.warden/ (FEAT_STATE_HYGIENE)

**Status:** IN-PLAN
**Concept:** [CON-010](../concepts/CON-010_Context-Agnostic_Governance.md)
**SQA Anchors:** maintainability, robustness, observability

## 1. Problem Statement
The `engineer_report.json` file is currently stored in the root directory of governed projects. This clutters the root workspace and violates the principle of state isolation, where governance artifacts should be contained within the `.warden/` directory.

## 2. Technical Solution
Relocate `engineer_report.json` to the `.warden/` directory and update all dependent components to use the new path.

### 2.1 Component: `path_resolver.js`
*   Update `SOURCES.ENGINEER_REPORT` to resolve to `ACTIVE_ROOT/.warden/engineer_report.json`.

### 2.2 Component: `CAP_V1` Protocol
*   Update the `engineer_report` requirement path from `engineer_report.json` to `.warden/engineer_report.json`.

### 2.3 Component: `report.js`
*   Ensure the `--draft` command writes to the new resolved path. (Already using `SOURCES.ENGINEER_REPORT`).

## 3. Implementation Plan
1.  **Resolver Update:** Modify `warden/engine/path_resolver.js`.
2.  **Protocol Update:** Modify `warden/registry/protocols/CAP_V1.json`.
3.  **Physical Move:** Move existing `engineer_report.json` to `.warden/`.
4.  **Verification:** Run `node engine/report.js --draft` and verify the file is created in `.warden/`. Run a `CAP_V1` cycle to verify requirement satisfaction.

## 4. Success Criteria
*   `engineer_report.json` is located in `.warden/` of the governed project.
*   `CAP_V1` correctly identifies the report during the CLAIM phase.
*   `report.js --draft` correctly generates the report in the new location.
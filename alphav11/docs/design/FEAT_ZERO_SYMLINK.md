# Feature: Zero-Symlink Architecture & Path-Agnostic Governance (FEAT_ZERO_SYMLINK)

**Status:** IN-PLAN
**Concept:** [CON-010](../concepts/CON-010_Context-Agnostic_Governance.md)
**SQA Anchors:** portability, maintainability, robustness

## 1. Problem Statement
The current portable governance implementation relies on symlinks in target projects to ensure command compatibility and intent recognition. This clutters target repositories and creates a "brittle" link between the target and the Warden internal root.

## 2. Technical Solution
Refactor the Warden engine to intelligently resolve paths and recognize commands regardless of whether they are prefixed with `warden/` or rely on local symlinks.

### 2.1 Component: `intent_patterns.json`
*   Update regex patterns to make `engine/`, `docs/`, and `validation/` prefixes optional or recognize `warden/` equivalents.
*   Ensure that commands like `node warden/engine/onboard.js` and `node engine/onboard.js` map to the same Canonical Intent.

### 2.2 Component: `warden.js` (Exec Proxy)
*   Implement "Path Fallback" logic: If a command references a tool in `engine/`, `docs/`, or `validation/` that does not exist in the `ACTIVE_ROOT`, automatically resolve it to the `INTERNAL_ROOT`.
*   Maintain the `WARDEN_PROXY_ACTIVE` environment variable to notify child processes of their governed state.

### 2.3 Component: `path_resolver.js`
*   Harden `resolve.active()` to ensure it consistently handles the absence of target-level directories.

## 3. Implementation Plan
1.  **Intent Refactoring:** Systematic update of `warden/registry/intent_patterns.json` regex.
2.  **Engine Update:** Implement path fallback in `warden/engine/warden.js`.
3.  **Verification:** 
    *   Remove all symlinks from the current target project (`alphav11`).
    *   Run a full GSD cycle (e.g., a dummy feature) to verify intent recognition and requirement validation without symlinks.
4.  **Cleanup:** Formally delete the symlinks from the repository.

## 4. Success Criteria
*   Zero symlinks required in the project root of target projects.
*   100% Intent Recognition for both `warden/`-prefixed and unprefixed commands.
*   All automated requirements (file_exists, command_log) pass without symlink assistance.

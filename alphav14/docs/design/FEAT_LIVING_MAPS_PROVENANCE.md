# Feature: Method-Level Provenance Tracking (FEAT_LIVING_MAPS_PROVENANCE)

**Status:** IN-PLAN
**Concept:** [CON-008](../../registry/concepts/CON_008_LivingMaps.md)
**SQA Anchors:** security, robustness, testability

## 1. Problem Statement
While high-level architectural mapping provides orientation, it does not prevent "Shadow Changes"—unauthorized modifications to specific logic within a component. To ensure high-fidelity audits, the system must detect drift at the individual method and function level.

## 2. Technical Solution
Extend the Architecture Mapper (`engine/map.js`) to generate and store cryptographic hashes for every identified symbol.

### 2.1 Component: `Hashing Engine`
*   **Method-Level Hashing:** Instead of hashing the entire file, the tool extracts the source code of each identified function/method and generates a SHA256 hash of its body (stripping whitespace to minimize false positives).
*   **Integrity Registry:** Hashes are stored in `registry/architecture_map.json` alongside the symbol metadata.

### 2.2 Component: `Drift Detector`
*   **Baseline Comparison:** A new mode (`--verify`) for `engine/map.js` that compares current method hashes against the stored baseline.
*   **Audit Alerting:** Identifies exactly which methods have changed since the last authorized map update.

## 3. Implementation Plan
1.  **Source Extraction:** Enhance the symbol extractor to capture the character offsets (start/end) of function bodies.
2.  **Hashing Logic:** Implement SHA256 generation using the native `crypto` module.
3.  **Registry Update:** Modify the JSON generator to include the `hash` field for every symbol.
4.  **Verification Mode:** Implement the logic to detect and report hash mismatches.

## 4. Success Criteria
*   **Granularity:** 100% of identified symbols have an associated SHA256 hash.
*   **Sensitivity:** Any functional change to a method body triggers a hash mismatch.
*   **Resilience:** Non-functional changes (whitespace/re-formatting) are optionally normalized or reported as low-risk deltas.

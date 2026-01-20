# Feature: Feature Traceability Matrix (FEAT_LIVING_MAPS_TRACEABILITY)

**Status:** IN-PLAN
**Concept:** [CON-008](../../registry/concepts/CON_008_LivingMaps.md)
**SQA Anchors:** observability, compliance, maintainability

## 1. Problem Statement
Cryptographic hashes prove *that* code changed, but they do not explain *why* it changed or which strategic objective authorized the modification. To achieve full closed-loop governance, the system must link individual symbols to the Feature IDs (`FEAT_ID`) that implemented or modified them.

## 2. Technical Solution
Extend the Architecture Mapper (`engine/map.js`) to parse governance metadata and generate a Traceability Matrix.

### 2.1 Component: `Traceability Harvester`
*   **Patch Analysis:** The tool will scan `history/patches/*.patch` files to identify which symbols were modified by specific features.
*   **Metadata Linkage:** It will cross-reference symbol hashes with the `registry/backlog.json` to verify the authorization status of every change.

### 2.2 Component: `Audit Report (DLR_MAP_TRACEABILITY)`
*   **Formal Deliverable:** Codified in `registry/deliverables.json`.
*   **Evidence Generation:** A new output mode for `engine/map.js` that produces a "Feature Traceability Matrix."
*   **Certification:** Proves that Feature X consists of specifically hashed methods A, B, and C, and that no other modifications were made. This replaces manual implementation claims with cryptographic evidence.

### 2.3 Protocol Integration: `GSD_V5` & `MAP_V3`
*   **Pre-Flight (State 1):** GSD will invoke `MAP_V3 --baseline` to capture the symbolic state before implementation.
*   **Post-Flight (State 4/5):** GSD will require `DLR_MAP_TRACEABILITY` as a hard gate. Implementation cannot be verified without a certified Traceability Matrix reconciliation.

### 2.4 PIR Evolution
*   **Evidence-Driven Analysis:** The `DLR_REV_PIR` (Post-Implementation Review) is now downstream of the Traceability Audit.
*   **Automation:** The PIR success score and anomaly analysis will be prepopulated using data from `DLR_MAP_TRACEABILITY` (e.g., detecting unauthorized drift or validating 100% method coverage).

## 3. Implementation Plan
1.  **Registry Codification:** Update `registry/deliverables.json` to define the schema and scope for `DLR_MAP_TRACEABILITY`.
2.  **Metadata Parser:** Enhance `engine/map.js` to read patch files and extract `FEAT_ID` from the filenames or headers.
3.  **Matrix Integration:** Update the `architecture_map.json` schema to include a `traceability` block for each symbol.
4.  **Audit Mode:** Implement `engine/map.js --audit <feat_id>` to generate the `DLR_MAP_TRACEABILITY` evidence.
5.  **Protocol Evolution:** Draft and implement `MAP_V3.json` and update `GSD_V5.json` requirements.
6.  **Reporting Linkage:** Update `engine/report.js` to consume Traceability evidence for PIR generation.

## 4. Success Criteria
*   **Formalization:** `DLR_MAP_TRACEABILITY` is a recognized system deliverable.
*   **Traceability:** 100% of symbols modified since the implementation of this sub-domain are correctly linked to a `FEAT_ID`.
*   **Verification:** The `--audit` mode correctly identifies unauthorized shadow changes (drift without a linked feature).
*   **Fidelity:** `DLR_MAP_TRACEABILITY` provides a provable, machine-readable evidence chain for every feature implementation.

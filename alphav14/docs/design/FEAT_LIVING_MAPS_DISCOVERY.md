# Feature: Symbolic Architecture Mapping (FEAT_LIVING_MAPS_DISCOVERY)

**Status:** IN-PLAN
**Concept:** [CON-008](../../registry/concepts/CON_008_LivingMaps.md)
**SQA Anchors:** observability, maintainability, compliance

## 1. Problem Statement
Zero-Knowledge Entities (ZKE) currently lack a deterministic method for project orientation. Relying on manual file exploration is slow, error-prone, and fails to capture the qualitative intent behind component relationships and API scopes.

## 2. Technical Solution
Implement a specialized discovery tool (`engine/map.js`) that automates the extraction of structural and symbolic metadata to build a "Living Map" of the Target Project.

### 2.1 Component: `Project Manifest` (`registry/project_manifest.json`)
*   **Authoritative Index:** A JSON file listing the functional domains (e.g., "Core", "Transport", "Utils") and their associated directory paths.
*   **Portability:** Decouples the mapping logic from the physical folder structure, allowing the scanner to adapt to directory moves or renames.

### 2.2 Component: `Symbolic Mapper` (`engine/map.js`)
*   **Scanner Core:** Reads the `Project Manifest` to determine which directories to investigate recursively.
*   **AST Parser:** Use a lightweight parser to identify functions, methods, and classes.
*   **Scope Analyzer:** Distinguish between Public (exported) and Internal (private) symbols.
*   **Metadata Harvester:** Extract JSDoc tags (`@warden-purpose`, `@warden-scope`) to provide qualitative context.

### 2.3 Component: `Map Renderer`
*   **JSON Generator:** Produce `registry/architecture_map.json` for machine consumption.
*   **Markdown Renderer:** Auto-generate `docs/ARCHITECTURE_MAP.md` as the primary ZKE bootstrap guide.

## 3. Implementation Plan
1.  **Manifest Definition:** Create `registry/project_manifest.json` with the initial directory mapping.
2.  **Scanner Core:** Implement recursive directory scanning driven by the manifest.
3.  **Symbol Extraction:** Develop the logic to identify symbols and their visibility/scope.
4.  **Heuristic Engine:** Implement domain categorization based on the manifest definitions.
5.  **Artifact Generation:** Build the JSON and Markdown output generators.

## 4. Success Criteria
*   **Coverage:** 100% of Target Project files (Core, Transport, Utils) are mapped.
*   **Fidelity:** All exported methods are identified with their correct visibility.
*   **Guidance:** Qualitative context is successfully extracted and rendered in the Markdown guide.

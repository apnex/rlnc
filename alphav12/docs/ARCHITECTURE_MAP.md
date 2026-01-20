# Architecture Map: RLNC AlphaV12

**Generated:** 2026-01-19T10:49:32.607Z
**Scope:** Target Project Investigation & Traceability (CON-008)

## Domain: Core Engine
> Mathematical logic, GF256 operations, and RLNC encoders/decoders.

### Component: `core/block_decoder.js`
*   **Purpose:** Reconstructs original data blocks from linear combinations.
*   **Scope:** Core Implementation

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `d0af7fb56c6ebc23` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `addPiece` | Public | `931c8e36270470b9` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `_insertRow` | Public | `854fb2d613e3af9e` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `_finalize` | Public | `c51836a163e0a8e5` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `getData` | Public | `d107a77befc62797` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `core/block_encoder.js`
*   **Purpose:** Pure atomic math primitive focused on linear combinations.
*   **Scope:** Core Mathematical Logic

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `7e3e46cd07835388` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `codedPiece` | Public | `7e11d0a5e030a966` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `core/docs/render_changelog.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `printTable` | Internal | `8039c70121e62c19` | None |

### Component: `core/engine.js`
*   **Purpose:** Primary engine managing encoder/decoder lifecycles.
*   **Scope:** Core Implementation

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `3c5c8f4f6d6ee10e` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `_wireComponents` | Public | `35bff2e13fc4d07d` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `_finish` | Public | `f8842b5f0f721580` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `core/galois_matrix.js`
*   **Purpose:** Matrix operations for linear independence verification.
*   **Scope:** Mathematical Logic

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `0ec74037620a662c` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `get` | Public | `b8185fa18f349e49` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `set` | Public | `e7edee21cc951704` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `addRow` | Public | `09bee947adf9ffb1` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `extractData` | Public | `04610178665a3fb8` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `normalizeRow` | Public | `2247b5ddbafe95b3` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `solve` | Public | `2bbfed29bf0a0e4c` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `multiplyAdd` | Public | `1487aea534b71c0b` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `normalize` | Public | `c6dfb7cdaa04ef7e` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `_findPivot` | Public | `d87560fdcab9a1e3` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `_swapRows` | Public | `9184e66bf6177eca` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `getAugmentedRow` | Public | `9dc7dda16bc8234b` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `core/gf256.js`
*   **Purpose:** High-performance Galois Field arithmetic (GF256).
*   **Scope:** Mathematical Logic

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `init` | Public | `66c755d2f8cd74c3` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `core/sink.js`
*   **Purpose:** Orchestrates packet reception and decoding pipelines.
*   **Scope:** Core Implementation

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `693d9adb8a32e7ff` | None |
| `_wireComponents` | Public | `25ee9f239e59812e` | None |
| `processHeader` | Public | `125fd0edfe5e1f71` | None |
| `_finish` | Public | `f7aa6661ed4d870a` | None |

### Component: `core/source.js`
*   **Purpose:** Orchestrates data ingestion and encoding pipelines.
*   **Scope:** Core Implementation

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `38ff05eb13ae4148` | None |
| `_wireComponents` | Public | `82fc4fdca406ed39` | None |
| `_finish` | Public | `236efb2e66cbbcd3` | None |

### Component: `core/verify_coders.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `runCoderTest` | Internal | `0146a560adf6eb23` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `printReport` | Internal | `1779be2675ecdb6c` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `core/verify_comparative_v10.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `profile` | Internal | `396a0c2c2333836d` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `run` | Internal | `7ffad8e0a1882b42` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `core/verify_full_buffer_deadlock.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `runTest` | Internal | `a2cb33df34cef18b` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `core/verify_incremental_stress.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `run` | Internal | `1ec7ece063f3ad3e` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `core/verify_matrix.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `runStressTest` | Internal | `30a06dfe7d5b1ba3` | None |

### Component: `core/verify_sbox.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `core/verify_sbox_upper_bound.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `runUpperBoundProfile` | Internal | `a932df92688fa174` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `printReport` | Internal | `e986a185c09d0a68` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

---

## Domain: Transport Layer
> Networking protocols (UDP), worker pools, and serialization.

### Component: `network/coded_piece.js`
*   **Purpose:** Represents a single linear combination and its coefficients.
*   **Scope:** Transport Layer

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `569e9b79645908cc` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `network/loopback_transport.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `221ac642ff6352b6` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `listen` | Public | `af3710f8adf107de` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `connect` | Public | `8120e46abd9d13df` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `send` | Public | `88d28df0e5e4db39` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `close` | Public | `2252fc18b2e75684` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `network/network_simulator.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `8c3d241ea956a333` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `listen` | Public | `b47c1436d81d6672` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `connect` | Public | `2a7242f3efadc547` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `send` | Public | `07a6bf9e9d83713c` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `_injectImpairment` | Public | `6ce0d70e087d09fc` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `close` | Public | `c8dd0ff8235776ff` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `network/packet_serializer.js`
*   **Purpose:** 16-byte structured header for session and loss tracking.
*   **Scope:** Transport Layer

*No symbols detected.*

### Component: `network/transport.js`
*   **Purpose:** Orchestrates data movement between network worker threads.
*   **Scope:** Networking

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `55380c91e6be8784` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `listen` | Public | `052380d1816740b6` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `connect` | Public | `2da6db896802a2d4` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `send` | Public | `09eac11515e060bc` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `onPacket` | Public | `a6b9cf206e811a81` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `close` | Public | `fcc176ad902b243b` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `network/udp_transport.js`
*   **Purpose:** High-throughput UDP-based data transit using dgram.
*   **Scope:** Networking

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `c6c765149eb82619` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `listen` | Public | `f63d27b6a062ddc7` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `connect` | Public | `e0c1f118436868f6` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `send` | Public | `9f3386997da7f8b7` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `close` | Public | `6b07009fc4cb6060` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `network/udp_worker.js`
*   **Purpose:** Non-blocking UDP processing via worker threads.
*   **Scope:** Networking

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `acquireRX` | Internal | `7ea2bf0d6e45d02a` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

---

## Domain: Utilities
> Shared resources and foundational helper modules.

### Component: `utils/buffer_pool.js`
*   **Purpose:** Efficient reuse of Buffer objects to minimize GC pressure.
*   **Scope:** Utilities

*No symbols detected.*

### Component: `utils/shared_buffer_pool.js`
*   **Purpose:** Zero-copy shared data sharing between threads.
*   **Scope:** Utilities

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `a5f1064f1067286f` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `getSlotView` | Public | `bfd1d20a641f8ebd` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `lockSlot` | Public | `e4df5041c71a4eaa` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `unlockSlot` | Public | `665d69ed63be9260` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `isSlotBusy` | Public | `00f9c7448e9c1e4c` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `acquireTX` | Public | `a410c16c93304b1e` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `acquireRX` | Public | `9c76b88e4f9ad494` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `utils/update_matrix.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `updateMatrix` | Internal | `f17217970e8e8918` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `utils/visual_dashboard.js`
*   **Purpose:** Assembles decoupled UI widgets into a strategic dashboard with perfect alignment.
*   **Scope:** Utilities

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `stripAnsi` | Public | `2ca69e05f79058ca` | None |
| `visualWidth` | Public | `b0a0874884f944f6` | None |
| `padBox` | Public | `5314d60fb0870f32` | None |
| `constructor` | Public | `7e62063971486014` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `render` | Public | `98284078d7557cd0` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `constructor` | Public | `574d27dc2bf94660` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `render` | Public | `f59f54f5fa16e1d3` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `constructor` | Public | `3269fc124e346d83` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `render` | Public | `cb5cbde40c0190fa` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `constructor` | Public | `05a88f3f89fc1cfc` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `initGen` | Public | `74a4ed48e79bf8cd` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `updateGen` | Public | `091c6b842ec60266` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `registerTraffic` | Public | `6e9a4b297dcce76a` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `addGlobalStat` | Public | `1f10e57c9b2ebdbf` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `setFinalHash` | Public | `d1a3d6009fa87167` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `render` | Public | `9c380c926f85639f` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

---

## Domain: Validation Suite
> Technical verification and stress tests.

### Component: `tests/h1_hardening_verify.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/h2_sink_config.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/h2_source_config.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/sink_config.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/source_config.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/t1_throughput.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/t2_resilience.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/t3_stress.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/t4_sustenance.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/t5_full_coded.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/t6_the_wall.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/verify_library.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/verify_math.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/verify_serializer.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

### Component: `tests/verify_threaded.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

*No symbols detected.*

---

## Domain: Threading & Concurrency
> Multi-threaded encoders, decoders, and worker pool management.

### Component: `threading/debug_verify_threading.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `runSuite` | Internal | `50cbcb5377d452df` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `runTest` | Internal | `4277bddcb0a2633e` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `finish` | Internal | `d03d1770b7b00870` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `printReport` | Internal | `97bd5d01c55ab582` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `threading/decoder_worker.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `handlePiece` | Internal | `74968d628d0551dd` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `threading/docs/render_changelog.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `printTable` | Internal | `e4c1d90bfd653ccf` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `threading/encoder_worker.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `sendPacketViaShared` | Internal | `ad53b1f9665a9f0a` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `acquireTX` | Internal | `4969616005e256de` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `producePackets` | Internal | `54be32c57c01b833` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `threading/generation_decoder.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `0d62b76d1c9e0405` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `terminate` | Public | `960fb27a538386b0` | None |
| `addPiece` | Public | `1ac017a60f63f3be` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `getReconstructedFile` | Public | `48cee088266f9e73` | None |

### Component: `threading/generation_encoder.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `e17078686d6eb874` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `produce` | Public | `38a95bb75e9145cd` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `_activateGeneration` | Public | `6ec7f2aaf65b813f` | None |
| `terminate` | Public | `960fb27a538386b0` | None |

### Component: `threading/sliding_window.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `fa773e2c1bd82053` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `setTotalGenerations` | Public | `31154cb9b9778411` | None |
| `_slide` | Public | `0fc4d77ff7e26b6f` | None |
| `acknowledge` | Public | `e881c7748f788502` | None |
| `markSolved` | Public | `7d755ba941dec8f3` | None |
| `isFinished` | Public | `7fd672e96865054a` | None |

### Component: `threading/verify_threading.js`
*   **Purpose:** No purpose defined.
*   **Scope:** No scope defined.

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `runSuite` | Internal | `50cbcb5377d452df` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `runTest` | Internal | `0d8cc0e79521491a` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `finish` | Internal | `821d20e85b65ee1c` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `printReport` | Internal | `97bd5d01c55ab582` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |

### Component: `threading/worker_pool.js`
*   **Purpose:** Dynamic management of parallel math operations.
*   **Scope:** Threading

| Symbol | Visibility | Hash (SHA256) | Traceability |
| :--- | :--- | :--- | :--- |
| `constructor` | Public | `437512f5b76652db` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `dispatch` | Public | `18f5c8db47113695` | None |
| `addJob` | Public | `a36b111f0be30869` | None |
| `produce` | Public | `8d752daf8fdae7b8` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `boost` | Public | `db60e50fb8aa95eb` | None |
| `ack` | Public | `f3dd9b2094ff7c97` | `FEAT_CONTEXTUAL_INDUCTION`, `FEAT_ENGINE_HARDENING`, `FEAT_LIVING_MAPS_PROVENANCE`, `FEAT_LIVING_MAPS_TRACEABILITY`, `FEAT_MODULAR_DECOUPLING`, `FEAT_SIMULATOR_HARDENING` |
| `terminate` | Public | `8817128111df7b2a` | None |

---


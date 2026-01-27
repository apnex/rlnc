# Ribbon Terminal UI Widget: Visual Specifications

This document defines the layout standards, character components, and verified designs for the "Ribbon" data transfer widget.

## Layout Standards

All fields in the Ribbon widget must adhere to a strict character length to ensure visual alignment between ACTIVE and IDLE states.

### Identifier
| Length | ACTIVE | IDLE |
| :---: | :--- | :--- |
| 9 | `[Gen 001]` | `[Gen 000]` |

Unique identifier for the data stream.

### DataValue
| Length | ACTIVE | IDLE |
| :---: | :--- | :--- |
| 5 | ` 12.5` | `---.-` |

Numeric value with one decimal precision.

### DataUnit
| Length | ACTIVE | IDLE |
| :---: | :--- | :--- |
| 2 | `MB` | ` B` |

Two-character unit identifier (e.g., `MB`, `GB`, ` B`).

### TransferBlock
| Length | ACTIVE | IDLE |
| :---: | :--- | :--- |
| 15 | ` 12.5MB/100.0MB` | `---.- B/---.- B` |

Combined block: `DataValue(5)` + `DataUnit(2)` + `/` + `DataValue(5)` + `DataUnit(2)`.

### VelocityBlock
| Length | ACTIVE | IDLE |
| :---: | :--- | :--- |
| 9 | `  5.0MB/s` | `  0.0 B/s` |

Transfer rate using `DataValue(5)` + `DataUnit(2)` + `/s`.

### Percentage
| Length | ACTIVE | IDLE |
| :---: | :---: | :---: |
| 4 | ` 12%` | `  0%` |

Progress percentage (e.g., ` 45%`, `100%`).

### Loss
| Length | ACTIVE | IDLE |
| :---: | :--- | :--- |
| 5 | ` 0.0%` | `--.-%` |

Data loss metric (e.g., ` 0.0%`, `12.5%`).

---

## Style A: Retro/Tech (Solid & Dot)
*Filled: `■` (U+25FC) | Empty: `·` (U+00B7)*

### 1. The Standard Engineer
```text
ACTIVE: [Gen 000]  12.5MB/100.0MB [■■■■········]  12% |   5.0MB/s | Loss:  0.0%
IDLE:   [Gen 000] ---.- B/---.- B [············]   0% |   0.0 B/s | Loss: --.-%
```

### 2. The Speed-First
```text
ACTIVE: [Gen 000]   5.0MB/s [■■■■■■······]  50% | 400.0MB | L:  0.1%
IDLE:   [Gen 000]   0.0 B/s [············]   0% | ---.- B | L: --.-%
```

### 3. The Network Dashboard
```text
ACTIVE: [Gen 000] [■■■■■·······]  48% (  1.5GB) ⚡   12.0MB/s [LOSS: 0.02%]
IDLE:   [Gen 000] [············]   0% (---.- B) ⚡    0.0 B/s [LOSS: --.-%]
```

### 4. The Compact Ribbon
```text
ACTIVE: [Gen 000] [■■■······]  30% 800.0KB/s  12.0MB/ 40.0MB L:  0.0%
IDLE:   [Gen 000] [·········]   0%   0.0 B/s ---.- B/---.- B L: --.-%
```

### 5. The Mirrored Layout
```text
ACTIVE: [Gen 000]  12.5MB/100.0MB [■■■■········]  12% |   5.0MB/s [L:  0.0%]
IDLE:   [Gen 000] ---.- B/---.- B [············]   0% |   0.0 B/s [L: --.-%]
```

---

## Style B: Retro/Tech (Solid & Hollow Square)
*Filled: `■` (U+25FC) | Empty: `▫` (U+25AB)*

### 1. The Standard Engineer
```text
ACTIVE: [Gen 000]  12.5MB/100.0MB [■■■■▫▫▫▫▫▫▫▫]  12% |   5.0MB/s | Loss:  0.0%
IDLE:   [Gen 000] ---.- B/---.- B [▫▫▫▫▫▫▫▫▫▫▫▫]   0% |   0.0 B/s | Loss: --.-%
```

### 2. The Speed-First
```text
ACTIVE: [Gen 000]   5.0MB/s [■■■■■■▫▫▫▫▫▫]  50% | 400.0MB | L:  0.1%
IDLE:   [Gen 000]   0.0 B/s [▫▫▫▫▫▫▫▫▫▫▫▫]   0% | ---.- B | L: --.-%
```

### 3. The Network Dashboard
```text
ACTIVE: [Gen 000] [■■■■■▫▫▫▫▫▫▫]  48% (  1.5GB) ⚡   12.0MB/s [LOSS: 0.02%]
IDLE:   [Gen 000] [▫▫▫▫▫▫▫▫▫▫▫▫]   0% (---.- B) ⚡    0.0 B/s [LOSS: --.-%]
```

### 4. The Compact Ribbon
```text
ACTIVE: [Gen 000] [■■■▫▫▫▫▫▫]  30% 800.0KB/s  12.0MB/ 40.0MB L:  0.0%
IDLE:   [Gen 000] [▫▫▫▫▫▫▫▫▫]   0%   0.0 B/s ---.- B/---.- B L: --.-%
```

### 5. The Mirrored Layout
```text
ACTIVE: [Gen 000]  12.5MB/100.0MB [■■■■▫▫▫▫▫▫▫▫]  12% |   5.0MB/s [L:  0.0%]
IDLE:   [Gen 000] ---.- B/---.- B [▫▫▫▫▫▫▫▫▫▫▫▫]   0% |   0.0 B/s [L: --.-%]
```

---

## Alternative Character Sets
The following characters are perfectly matched pairs for filled and hollow states:

### 1. Medium Square Pair (Heavy)
- **Filled**: `■` (`U+25FC` - Black Medium Square)
- **Hollow**: `◻` (`U+25FB` - White Medium Square)

### 2. Small Square Pair (Minimalist)
- **Filled**: `▪` (`U+25AA` - Black Small Square)
- **Hollow**: `▫` (`U+25AB` - White Small Square)

### 3. Track Alternatives
- **Thin Track**: `·` (`U+00B7` - Middle Dot)
- **Block Track**: `░` (`U+2591` - Light Shade)
- **Line Track**: `─` (`U+2500` - Box Drawings Light Horizontal)

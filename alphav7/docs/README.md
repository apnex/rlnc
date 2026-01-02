# 🚀 ALPHAv6

**Current State:** `Stable / Production Ready`

### Description
ALPHAv6 is a high-performance, asynchronous multi-threaded implementation of Random Linear Network Coding (RLNC), separating UI logic from heavy computational math.

### Purpose
To provide a low-latency, resilient data transmission framework capable of recovering lost information in hostile network environments without retransmission.

### Key Features
* **Asynchronous Multi-Threading**: Offloads CPU-intensive encoding/decoding to background worker threads.
* **Sliding Window RLNC**: Manages data generations for continuous transmission flow.
* **Zero-Copy Buffer Management**: Minimizes memory allocation overhead via a custom buffer pool.
* **Real-Time Dashboard**: 60FPS terminal telemetry for throughput and recovery monitoring.

---

## 🛠️ User-Defined Commands

| Command | Description | Purpose | Instruction |
| :--- | :--- | :--- | :--- |
| **`TREE`** | File Structure Visualization | To quickly view the current project file hierarchy in a clean, visual format. | Provide the current project file listing in an ASCII format similar to the Linux tree command. |
| **`COMMIT`** | Version Snapshot | To freeze the current state of the project as a tagged reference for future comparison. | Signal the end of a version; confirm the tag value and seek explicit consent before snapshotting. |
| **`README`** | Documentation Generator | To automatically update the documentation data source when the project state changes. | Generate a new fully updated docs/readme_data.json file to reflect the latest state of the current version of the project. |
| **`LIST`** | Command Directory | To review all custom tools available in this session. | Show me a summarised output of all other specifically defined commands, along with a description, purpose and the instruction provided for each one. |
| **`EXPORT`** | JSON Command Export | To extract the command definitions in a machine-readable format for docs/commands.json. | Provide the output of the LIST command (command details) in JSON format. |
| **`FILES`** | Project Inventory | To see a summarized breakdown of every file, including those in the /docs folder. | Provide a summarised output of all files in this current version of the project, along with a description and purpose. |
| **`STATUS`** | Project Status Overview | To provide a high-level summary of the project's health and features. | Provide a summary of the status of this version of the project. Include a description, purpose, and a summary of the key features. |

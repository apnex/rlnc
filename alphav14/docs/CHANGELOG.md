# 🕒 Project Version History

> Documentation of functional changes and governance events for this project.

## v0.1.16 (2026-01-23)
- Refactored `SharedTelemetry` into the **Persistent Control Bus (PCB)** HAL.
- Implemented **Memory-Mapped I/O (MMIO)** register topology with 32-register stride.
- Established **'Born Blind' Worker** model (induction from Segment A registers).
- Achieved **100% TUI Frame Fidelity** via authoritative final register scrapes.
- Refined RANK metric to integer completion (X/Y) and byte-scaled progress bars.
- Enforced **Separation of Duties (SoD)**: Drivers now own telemetry cleanup and configuration.

## v0.1.15 (2026-01-21)
- Finalized Modular TUI Framework with bit-perfect alignment and independent visual floors.
- Successfully refactored RLNC core to high-performance 'Pull Model' visual monitoring API.
- Stabilized and verified all mathematical and sharding kernels via 8-tier revalidation suite.
- Permanently decommissioned legacy monolith UI and established production baseline.

## v0.1.14 (2026-01-21)
- Finalized Modular TUI Framework with bit-perfect alignment and interactive focus management.
- Successfully refactored RLNC core to a high-performance 'Pull Model' visual monitoring API.
- Resolved critical Gen 0 activation and budget double-counting bugs in the multi-threaded pipeline.
- Verified 8MB bit-perfect transfers across parallel worker threads with zero layout jitter.

## v0.1.13 (2026-01-21)
- Fully refactored core drivers (Source, Sink, Engine) to utilize RLNCDashboard and the throttled sync() API.
- Established a high-performance 10Hz 'Pull Model' heartbeat in main.js, decoupling UI rendering from math loops.
- Standardized 3-digit identifier formatting for active data streams across all dashboard modes.
- Permanently decommissioned the legacy visual_dashboard.js monolith, reducing project complexity.

## v0.1.12 (2026-01-21)
- Implemented RLNCHeader and RLNCFooter Layer 2 widgets.
- Developed RLNCDashboard with dynamic Source/Sink/Unified layout modes.
- Standardized 3-digit identifier formatting for active nodes while preserving Slot XX for idle states.
- Verified bit-perfect alignment and throttled sync() API via operational simulation.

## v0.1.11 (2026-01-21)
- Refactored all core components (Encoder, Decoder, Window, Simulator) to support high-performance 'getStats' pull-model snapshots.
- Implemented SessionStats aggregator for throttled 10Hz sampling with real-time velocity calculation.
- Hardened PacketSerializer with Buffer Projection and unsigned integer safety to eliminate data corruption.
- Stabilized multi-threaded GenerationEncoder with immediate activation and budget flood control.
- Verified bit-perfect 8MB UDP transfer across 8 threads via Tier 7 revalidation suite.

## v0.1.10 (2026-01-21)
- Implemented TuiGrid with Mixed-Mode (Fixed + Flex) column partitioning.
- Updated TuiFrame with raw-mode interactivity and focus management hooks.
- Refactored RibbonComponent to support responsive auto-scaling bars.
- Enhanced framework utilities with strict boundary clipping for layout stability.

## v0.1.9 (2026-01-21)
- Ported Ribbon logic to TuiWidget segments (Identifier, DataValue, ProgressBar).
- Implemented RibbonComponent using TuiHorizontalLayout with segment 'glue' logic.
- Migrated RibbonStack to TuiVerticalLayout for stable slot management.
- Verified bit-perfect alignment against DESIGN_UI_RIBBON.md via regression snapshots.

## v0.1.8 (2026-01-21)
- Ported Ribbon logic to TuiWidget segments (Identifier, DataValue, ProgressBar).
- Implemented RibbonComponent using TuiHorizontalLayout with segment 'glue' logic.
- Migrated RibbonStack to TuiVerticalLayout for stable slot management.
- Verified bit-perfect alignment against DESIGN_UI_RIBBON.md via regression snapshots.

## v0.1.7 (2026-01-21)
- Ported Ribbon logic to TuiWidget segments (Identifier, DataValue, ProgressBar).
- Implemented RibbonComponent using TuiHorizontalLayout with segment 'glue' logic.
- Migrated RibbonStack to TuiVerticalLayout for stable slot management.
- Verified bit-perfect alignment against DESIGN_UI_RIBBON.md via regression snapshots.

## v0.1.6 (2026-01-21)
- Ported Ribbon logic to TuiWidget segments (Identifier, DataValue, ProgressBar).
- Implemented RibbonComponent using TuiHorizontalLayout with segment 'glue' logic.
- Migrated RibbonStack to TuiVerticalLayout for stable slot management.
- Verified bit-perfect alignment against DESIGN_UI_RIBBON.md via regression snapshots.

## v0.1.5 (2026-01-21)
- Implemented TuiLayout, TuiVerticalLayout, and TuiHorizontalLayout with recursive zipping.
- Developed TuiFrame for atomic terminal writes and border management.
- Implemented TuiSnapshot tool for automated visual regression testing.

## v0.1.4 (2026-01-21)
- Implemented TuiLayout, TuiVerticalLayout, and TuiHorizontalLayout with recursive zipping.
- Developed TuiFrame for atomic terminal writes and border management.
- Implemented TuiSnapshot tool for automated visual regression testing.

## v0.1.3 (2026-01-21)
- Implemented foundational TUI classes: TuiWidget, StyleRegistry.
- Developed ANSI-aware string geometry utilities (visualWidth, pad).
- Established StyleA/B/C presets for the visual framework.

## v0.1.2 (2026-01-21)
- Implemented foundational TUI classes: TuiWidget, StyleRegistry.
- Developed ANSI-aware string geometry utilities (visualWidth, pad).
- Established StyleA/B/C presets for the visual framework.

## v0.1.1 (2026-01-21)
- --help

## v0.1.0 (2026-01-20)
- Initial Governance Injection

---
*Generated via Warden Project Changelog Tool*

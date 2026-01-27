/**
 * RLNC Project UI: Aether Fabric Monitor - CONTEXT-AWARE SHELL
 * @warden-purpose Sovereign TUI for Software-Defined Backplane.
 * @pillar Pillar 5: Declarative Governance
 */
const TuiFrame = require('./framework/frame');
const { TuiVerticalLayout } = require('./framework/layout');
const RLNCHeader = require('./rlnc_header');
const BladeGrid = require('./widgets/BladeGrid');
const IntegrityRibbon = require('./IntegrityRibbon');
const RLNCFooter = require('./rlnc_footer');
const { SeparatorWidget, TuiWidget } = require('./framework/widget');
const FabricScraper = require('./framework/FabricScraper');

// --- Visual DNA Manifest ---
const DNA_MANIFEST = {
    0: {
        name: "PHYSICS_LAB",
        widgets: [
            { type: require('./widgets/MathPhysicsRibbon'), slot: 'STAGE_A' },
            { type: require('./widgets/BladeGrid'), slot: 'STAGE_B' }
        ]
    },
    1: {
        name: "MASS_LAB",
        widgets: [
            { type: require('./widgets/MathPhysicsRibbon'), slot: 'STAGE_A' },
            { type: require('./widgets/BladeGrid'), slot: 'STAGE_B' }
        ]
    },
    2: {
        name: "LOGIC_LAB",
        widgets: [
            { type: require('./widgets/MathPhysicsRibbon'), slot: 'STAGE_A' },
            { type: require('./widgets/BladeGrid'), slot: 'STAGE_B' }
        ]
    },
    3: {
        name: "METABOLISM_LAB",
        widgets: [
            { type: require('./widgets/MathPhysicsRibbon'), slot: 'STAGE_A' },
            { type: require('./widgets/BladeGrid'), slot: 'STAGE_B' }
        ]
    }
};

class RLNCDashboard extends TuiFrame {
  constructor(options = {}) {
    super(options);
    this.pcb = options.pcb; // Capture PCB if provided
    this.header = new RLNCHeader();
    this.grid = new BladeGrid({ pcb: this.pcb });
    this.integrity = new IntegrityRibbon();
    this.footer = new RLNCFooter();

    // Contextual Stage Slots
    this.stageA = new TuiVerticalLayout();
    this.stageB = new TuiVerticalLayout();

    this.currentDriverType = -1;
    this.mountedWidgets = [];

    this.mainLayout = new TuiVerticalLayout();
    this._rebuildLayout();

    this.setContent(this.mainLayout);
    this.scraper = null;
  }

  _rebuildLayout() {
    this.mainLayout.children = [];
    this.mainLayout.add(this.header);
    this.mainLayout.add(new SeparatorWidget());
    
    // If no contextual widgets, show the default BladeGrid
    if (this.mountedWidgets.length === 0) {
        this.mainLayout.add(this.grid);
    } else {
        this.mainLayout.add(this.stageA);
        this.mainLayout.add(this.stageB);
    }

    this.mainLayout.add(new SeparatorWidget());
    this.mainLayout.add(this.integrity);
    this.mainLayout.add(new SeparatorWidget());
    this.mainLayout.add(this.footer);
    this.markDirty();
  }

  /**
   * Stage Induction Cycle (Morphism)
   */
  _inductDNA(driverType) {
    if (this.currentDriverType === driverType) return;
    
    // 1. Cleanup Protocol
    this.mountedWidgets.forEach(w => {
        if (w.unmount) w.unmount();
    });
    this.mountedWidgets = [];
    this.stageA.children = [];
    this.stageB.children = [];

    this.currentDriverType = driverType;

    // 2. Hydration
    const manifest = DNA_MANIFEST[driverType];
    if (manifest) {
        manifest.widgets.forEach(spec => {
            const WidgetClass = spec.type;
            const widget = new WidgetClass();
            this.mountedWidgets.push(widget);
            if (spec.slot === 'STAGE_A') this.stageA.add(widget);
            if (spec.slot === 'STAGE_B') this.stageB.add(widget);
        });
    } else if (driverType !== -1) {
        // 3. Symmetry Break (SENSORY-VOID)
        this.stageA.add(new (require('./framework/widget').LiteralWidget)("\x1B[31m[!] SENSORY-VOID: Unknown Driver Type 0x" + driverType.toString(16).toUpperCase() + "\x1B[0m"));
    }

    this._rebuildLayout();
  }

  sync(generations, snapshot, config, meta) {
    if (!this.scraper && snapshot.pcb) {
        this.scraper = new FabricScraper(snapshot.pcb);
    }
    if (!this.scraper) return;

    const fabricState = this.scraper.scrape();
    
    // Check for Morphism trigger (Use primary slot 1 for L1)
    const primarySlot = fabricState.slots[0];
    if (primarySlot && primarySlot.status !== 'DORMANT') {
        this._inductDNA(primarySlot.driverType); 
    }

    // Update Components
    this.header.update(config, meta);
    
    // Filter out dormant slots for the grid view
    const activeSlots = fabricState.slots.filter(s => s.status !== 'DORMANT' || s.sessionId !== '0x0');
    this.grid.update(activeSlots);
    
    this.mountedWidgets.forEach(w => {
        if (w.update) w.update(fabricState);
    });

    this.integrity.update(fabricState);
    this.footer.update(fabricState, meta); 
    this.draw();

    return fabricState;
  }
}

module.exports = RLNCDashboard;

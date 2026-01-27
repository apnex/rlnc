/**
 * Blade Grid: Vertical Rack Container
 * @version 2.4.0 - ZERO-PADDING
 * @warden-purpose Orchestrate sovereign Aether Blades with automatic vertical collapse.
 */
const { TuiVerticalLayout } = require("../framework/layout");
const AetherBlade = require("./AetherBlade");

class BladeGrid extends TuiVerticalLayout {
  constructor(options = {}) {
    super(options);
    this.pcb = options.pcb; 
    this.blades = [];
    this.capacity = null; // Disable capacity-based padding in the layout engine
    this._init();
  }

  _init() {
    for (let i = 1; i <= 8; i++) {
      const blade = new AetherBlade(i);
      blade.pcb = this.pcb; 
      this.blades.push(blade);
      this.add(blade); // Keep all blades resident; they self-collapse if dormant
    }
  }

  /**
   * Update all blades with scraped fabric state.
   */
  update(input) {
    const slots = Array.isArray(input) ? input : (input.slots || []);
    if (!Array.isArray(slots)) return;

    slots.forEach(data => {
      const blade = this.blades[data.slot - 1];
      if (blade) {
        blade.update(data);
      }
    });

    this.markDirty();
  }
}

module.exports = BladeGrid;

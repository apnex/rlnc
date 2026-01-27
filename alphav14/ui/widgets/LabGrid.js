const { TuiVerticalLayout } = require('../framework/layout');
const LabSlotBlade = require('./LabSlotBlade');

/**
 * LabGrid: A multiplexed container for L1 sequential phases.
 */
class LabGrid extends TuiVerticalLayout {
    constructor(options = {}) {
        super({ id: 'lab-grid', ...options });
        this.blades = [];
    }

    update(fabricState) {
        if (!fabricState || !fabricState.slots) return;
        
        // Filter for slots that belong to this lab context (active session)
        const activeSlots = fabricState.slots.filter(s => s.sessionId !== '0x0' && s.status !== 'DORMANT');
        
        // Ensure we have enough blade instances
        while (this.blades.length < activeSlots.length) {
            const blade = new LabSlotBlade(this.blades.length + 1);
            this.blades.push(blade);
            this.add(blade);
        }

        // Push data to blades
        activeSlots.forEach((slot, i) => {
            if (this.blades[i]) {
                this.blades[i].update(slot);
            }
        });
        
        this.markDirty();
    }
}

module.exports = LabGrid;

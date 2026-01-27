const { TuiVerticalLayout } = require('../framework/layout');
const RibbonComponent = require('./component');

/**
 * RibbonStack
 * Specialized vertical layout for managing multiple RibbonComponents.
 */
class RibbonStack extends TuiVerticalLayout {
  constructor(options = {}) {
    super(options);
    this.capacity = options.capacity || 4;
    this.layoutTemplate = options.layout || 'StandardEngineer';
    this.barWidth = options.barWidth || 12;
    this.idPrefix = options.idPrefix || 'Gen';
    this.components = new Map(); // ID -> RibbonComponent
    this.idleComponents = [];    // Cache for IDLE components
    this.activeIds = [];
  }

  /**
   * Dispatches updates to a specific ribbon by ID.
   */
  update(id, state) {
    let displayId = id;
    if (typeof id === 'number') {
      displayId = `${this.idPrefix} ${String(id).padStart(3, '0')}`;
    }
    
    const fullState = { ...state, id: displayId };
    
    if (!this.components.has(id)) {
      const comp = new RibbonComponent(fullState, { 
        layout: this.layoutTemplate, 
        barWidth: this.barWidth,
        style: this.styleName 
      });
      this.components.set(id, comp);
    } else {
      this.components.get(id).updateState(fullState);
    }
    
    if (!this.activeIds.includes(id)) {
      this.activeIds.push(id);
    }
    this.markDirty();
  }

  sync(dataArray) {
    const newDataIds = dataArray.map(d => d.id);
    
    // 1. Identify retired IDs and reset their components
    for (const id of this.activeIds) {
      if (!newDataIds.includes(id)) {
        const comp = this.components.get(id);
        if (comp) {
          comp.updateState({ 
            id: `Slot ${String(this.activeIds.indexOf(id) + 1).padStart(2, '0')}`,
            status: 'IDLE',
            transferred: 0, 
            total: 0, 
            velocity: 0, 
            loss: 0 
          });
        }
      }
    }

    // 2. Update components with new data
    this.activeIds = dataArray.map(d => {
      this.update(d.id, d);
      return d.id;
    });
  }

  render() {
    this.children = [];
    const window = this.activeIds.slice(0, this.capacity);

    // 1. Add active ribbons to children
    window.forEach(id => {
      const comp = this.components.get(id);
      comp.parent = this;
      this.children.push(comp);
    });

    // 2. Add IDLE ribbons to fill capacity
    while (this.children.length < this.capacity) {
      const idx = this.children.length; 
      const slotNum = idx + 1;
      const displayId = `Slot ${String(slotNum).padStart(2, '0')}`;
      
      if (!this.idleComponents[idx]) {
        const idleState = {
          id: displayId,
          status: 'IDLE',
          transferred: 0, total: 0, velocity: 0, loss: 0
        };
        this.idleComponents[idx] = new RibbonComponent(idleState, { 
          layout: this.layoutTemplate, 
          barWidth: this.barWidth,
          style: this.styleName 
        });
      } else {
        this.idleComponents[idx].updateState({ id: displayId, status: 'IDLE' });
      }
      
      const comp = this.idleComponents[idx];
      comp.parent = this;
      this.children.push(comp);
    }

    return super.render();
  }
}

module.exports = RibbonStack;

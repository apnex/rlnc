const RibbonComponent = require('./component');

/**
 * RibbonInstance
 * View-Model for a single data stream.
 * Wraps a RibbonComponent and maintains its state.
 */
class RibbonInstance {
  constructor(id, options = {}) {
    this.id = id;
    this.state = {
      id: id,
      transferred: 0,
      total: 0,
      unit: "MB",
      velocity: 0,
      loss: 0,
      status: 'IDLE'
    };
    this.component = new RibbonComponent(this.state, options);
  }

  update(delta) {
    Object.assign(this.state, delta);
    this.component.updateState(this.state);
  }

  sync(engine) {
    if (engine && typeof engine.getStats === 'function') {
      this.update(engine.getStats());
    }
  }

  render() {
    return this.component.getLines();
  }

  getLines() {
    return this.render();
  }

  getWidth() { return this.component.getWidth(); }
  getHeight() { return this.component.getHeight(); }

  toString() {
    return this.render().join('\n');
  }
}

module.exports = RibbonInstance;

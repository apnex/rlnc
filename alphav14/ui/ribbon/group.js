const { TuiHorizontalLayout } = require('../framework/layout');

/**
 * RibbonGroup
 * Orchestrates multiple RibbonStacks using TuiHorizontalLayout.
 */
class RibbonGroup extends TuiHorizontalLayout {
  constructor(options = {}) {
    super({ id: 'ribbon-group', ...options });
  }

  addStack(stack) {
    this.add(stack);
  }

  add(child) {
    super.add(child);
  }

  render() {
    return super.render();
  }

  toString() {
    return this.render().join('\n');
  }
}

module.exports = RibbonGroup;

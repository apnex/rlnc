/**
 * TUI Framework: Layout Engine
 * Orchestrates spatial arrangement of components.
 */
const { TuiWidget } = require('./widget');
const utils = require('./utils');

class TuiLayout extends TuiWidget {
  constructor(options = {}) {
    super(options);
    this.children = [];
  }

  add(child) {
    if (child instanceof TuiWidget) {
      child.parent = this;
    }
    this.children.push(child);
    this.markDirty();
  }

  setFocused(f) {
    super.setFocused(f);
    this.children.forEach(child => {
      if (child instanceof TuiWidget) {
        child.setFocused(f);
      }
    });
  }

  /**
   * Propagates style changes to children.
   */
  getStyle() {
    const style = super.getStyle();
    this.children.forEach(child => {
      if (child.styleName === null) {
        child.styleName = this.styleName;
      }
    });
    return style;
  }
}

/**
 * VerticalLayout
 * Stacks child string arrays vertically.
 */
class TuiVerticalLayout extends TuiLayout {
  constructor(options = {}) {
    super(options);
    this.capacity = options.capacity || null;
  }

  render() {
    // Propagate width constraint to children
    if (this.forcedWidth !== null) {
      this.children.forEach(child => child.setWidth(this.forcedWidth));
    }

    let lines = this.children.flatMap(child => child.getLines());
    
    // Manage capacity/slot stability if defined
    if (this.capacity !== null) {
      while (lines.length < this.capacity) {
        lines.push(utils.pad("", this.getWidth()));
      }
      lines = lines.slice(0, this.capacity);
    }

    return lines;
  }
}

/**
 * HorizontalLayout
 * Zips child string arrays side-by-side.
 * Handles height normalization via phantom lines.
 */
class TuiHorizontalLayout extends TuiLayout {
  constructor(options = {}) {
    super(options);
    this.separator = (options.separator !== undefined) ? options.separator : " | ";
  }

  render() {
    if (this.children.length === 0) return [];

    const renderedChildren = this.children.map(child => ({
      lines: child.getLines(),
      width: child.getWidth()
    }));

    const maxLines = Math.max(...renderedChildren.map(c => c.lines.length));
    const output = [];

    for (let i = 0; i < maxLines; i++) {
      const rowParts = renderedChildren.map(child => {
        const line = child.lines[i] || "";
        return utils.pad(line, child.width); // Ensure each column part is padded to its own width
      });
      output.push(rowParts.join(this.separator));
    }

    return output;
  }
}

module.exports = {
  TuiLayout,
  TuiVerticalLayout,
  TuiHorizontalLayout
};

/**
 * TUI Framework: Widget Base
 * Atomic layer for all visual elements.
 */
const styles = require('./styles');
const utils = require('./utils');

class TuiWidget {
  constructor(options = {}) {
    this.id = options.id || 'widget';
    this.styleName = options.style || null;
    this.width = options.width || 0;
    this.height = options.height || 1;
    this.forcedWidth = null;
    this.isFocused = false;
    this.isDirty = true;
    this.buffer = [];
    this.parent = null;
  }

  /**
   * Returns the resolved style for this widget.
   */
  getStyle() {
    if (this.styleName === null && this.parent) {
      const parentStyle = this.parent.getStyle();
      if (this.isFocused && parentStyle.focused) {
        return parentStyle.focused;
      }
      return parentStyle;
    }
    const style = styles.get(this.styleName);
    if (this.isFocused && style.focused) {
      return style.focused;
    }
    return style;
  }

  /**
   * Marks the widget as dirty, requiring a re-render.
   * Propagates upwards to the parent.
   */
  markDirty() {
    this.isDirty = true;
    if (this.parent) {
      this.parent.markDirty();
    }
  }

  /**
   * Sets a forced visual width.
   */
  setWidth(w) {
    if (this.forcedWidth !== w) {
      this.forcedWidth = w;
      this.markDirty();
    }
  }

  /**
   * Sets the focus state.
   */
  setFocused(f) {
    if (this.isFocused !== f) {
      this.isFocused = f;
      this.markDirty();
    }
  }

  /**
   * Internal render logic. Should be overridden by subclasses.
   * Must return an array of strings.
   */
  render() {
    return [];
  }

  /**
   * Public interface to get the widget's lines.
   * Manages the dirty state and caching.
   * Also enforces forcedWidth padding.
   */
  getLines() {
    if (this.isDirty) {
      this.buffer = this.render();
      if (this.forcedWidth !== null) {
        this.buffer = utils.normalizeLines(this.buffer, this.forcedWidth);
      }
      this.isDirty = false;
    }
    return this.buffer;
  }

  /**
   * Returns the visual width of the widget.
   */
  getWidth() {
    if (this.forcedWidth !== null) return this.forcedWidth;
    const lines = this.getLines();
    if (lines.length === 0) return 0;
    return Math.max(...lines.map(utils.visualWidth));
  }

  /**
   * Returns the visual height of the widget.
   */
  getHeight() {
    return this.getLines().length;
  }

  toString() {
    return this.getLines().join('\n');
  }

  /**
   * Event handler for key presses.
   * Returns true if the event was handled.
   */
  onKeyPress(key) {
    return false;
  }
}

class LiteralWidget extends TuiWidget {
  constructor(text) {
    super({ id: `literal-${text}` });
    this.text = text;
  }
  render() { return [this.text]; }
}

class SeparatorWidget extends LiteralWidget {
  constructor() { super('─'); }
  render() {
    const width = this.getWidth();
    return ['─'.repeat(width)];
  }
}

module.exports = {
  TuiWidget,
  LiteralWidget,
  SeparatorWidget
};

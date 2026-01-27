/**
 * TUI Framework: Interactive Frame
 * Root container for atomic terminal writes and input management.
 */
const { TuiWidget } = require('./widget');
const utils = require('./utils');
const events = require('./events');

class TuiFrame extends TuiWidget {
  constructor(options = {}) {
    super(options);
    this.title = options.title || "";
    this.content = null;
    this.showBorders = options.borders !== false;
    this.fixedWidth = options.width || 120;
    this.interactive = false;
    this.focusList = [];
    this.focusIndex = -1;
  }

  setContent(component) {
    this.content = component;
    if (component instanceof TuiWidget) {
      component.parent = this;
    }
    this.markDirty();
    this.refreshFocusList();
  }

  /**
   * Scans the component tree for focusable widgets.
   */
  refreshFocusList() {
    this.focusList = [];
    const scan = (node) => {
      if (node.onKeyPress !== TuiWidget.prototype.onKeyPress) {
        this.focusList.push(node);
      }
      if (node.children) {
        node.children.forEach(scan);
      }
    };
    if (this.content) scan(this.content);
    if (this.focusList.length > 0 && this.focusIndex === -1) {
      this.setFocus(0);
    }
  }

  setFocus(index) {
    if (this.focusList[this.focusIndex]) {
      this.focusList[this.focusIndex].setFocused(false);
    }
    this.focusIndex = index % this.focusList.length;
    if (this.focusIndex < 0) this.focusIndex += this.focusList.length;
    if (this.focusList[this.focusIndex]) {
      this.focusList[this.focusIndex].setFocused(true);
    }
  }

  enableInput() {
    if (this.interactive) return;
    this.interactive = true;

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      const key = events.identifyKey(chunk);
      if (key === 'CTRL_C') {
        process.exit();
      }
      if (key === 'TAB') {
        this.setFocus(this.focusIndex + 1);
      } else {
        // Dispatch to focused component
        if (this.focusList[this.focusIndex]) {
          this.focusList[this.focusIndex].onKeyPress(key);
        }
      }
      // Re-draw on input if interactive
      this.draw();
    });
  }

  render() {
    if (!this.content) return [];

    const innerWidth = this.showBorders ? this.fixedWidth - 4 : this.fixedWidth;
    this.content.setWidth(innerWidth);

    const style = this.getStyle();
    const b = style.borders;
    const bodyLines = this.content.getLines();

    const output = [];

    if (this.showBorders) {
      const topEdge = b.h.repeat(this.fixedWidth - 2);
      output.push(`${b.tl}${topEdge}${b.tr}`);

      if (this.title) {
        const titleLine = utils.pad(` ${this.title} `, innerWidth, 'center');
        output.push(`${b.v} ${titleLine} ${b.v}`);
        output.push(`${b.v}${b.h.repeat(innerWidth + 2)}${b.v}`);
      }

      bodyLines.forEach(line => {
        const paddedLine = utils.pad(line, innerWidth);
        output.push(`${b.v} ${paddedLine} ${b.v}`);
      });

      const bottomEdge = b.h.repeat(this.fixedWidth - 2);
      output.push(`${b.bl}${bottomEdge}${b.br}`);
    } else {
      bodyLines.forEach(line => {
        output.push(utils.pad(line, this.fixedWidth));
      });
    }

    return output;
  }

  draw() {
    const frame = this.toString() + '\n';
    if (!process.env.NO_CLEAR) {
      process.stdout.write('\x1Bc'); 
    }
    process.stdout.write(frame);
  }
}

module.exports = TuiFrame;

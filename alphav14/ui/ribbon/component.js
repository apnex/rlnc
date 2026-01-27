/**
 * Ribbon TUI: Composite Component
 * Orchestrates ribbon segments using TuiHorizontalLayout.
 */
const { TuiHorizontalLayout } = require("../framework/layout");
const segments = require("./segments");
const { TuiWidget } = require("../framework/widget");
const utils = require("../framework/utils");

class RibbonComponent extends TuiHorizontalLayout {
  constructor(state, options = {}) {
    super({ id: `ribbon-${state.id}`, separator: "", ...options });
    this.layoutTemplate = options.layout || "StandardEngineer";
    this.barWidthOption = options.barWidth || 12;
    this.barSegment = null;
    this.updateState(state);
  }

  updateState(state) {
    this.state = {
      id: state.id || "Gen 000",
      transferred: state.transferred || 0,
      total: state.total || 0,
      unit: state.unit || " B",
      velocity: state.velocity || 0,
      loss: state.loss || 0,
      status: state.status || "IDLE",
    };
    this.children = [];

    const { id, transferred, total, unit, velocity, loss, status } = this.state;

    let bWidth = 12;
    if (this.layoutTemplate === "CompactRibbon") bWidth = 9;
    if (typeof this.barWidthOption === "number") bWidth = this.barWidthOption;

    const seg = {
      id: () => new segments.IdentifierSegment(id),
      valTx: () => new segments.DataValueSegment(id, transferred, status),
      valTotal: () =>
        new segments.DataValueSegment(id, total, status, { precision: 1 }),
      valTotalGens: () =>
        new segments.DataValueSegment(id, state.totalGens || 0, status, {
          precision: 0,
          width: 3,
        }),
      valSolved: () =>
        new segments.DataValueSegment(id, state.solved || 0, status, {
          precision: 0,
          width: 4,
        }),
      unit: () => new segments.DataUnitSegment(id, unit, status),
      bar: () => {
        this.barSegment = new segments.ProgressBarSegment(
          id,
          transferred,
          total,
          bWidth,
        );
        return this.barSegment;
      },
      pct: () => new segments.PercentageSegment(id, transferred, total, status),
      vel: () => new segments.VelocitySegment(id, velocity, unit, status),
      loss: () => new segments.LossSegment(id, loss, status),
    };

    const add = (child) => {
      let component;
      if (typeof child === "function") {
        component = child();
      } else if (typeof child === "string") {
        component = new LiteralSegment(child);
      } else {
        component = child;
      }
      this.add(component);
    };

    switch (this.layoutTemplate) {
      case "StandardEngineer":
        add("[");
        add(seg.id);
        add("] ");
        add(seg.valTx);
        add(seg.unit);
        add("/");
        add(seg.valTotal);
        add(seg.unit);
        add(" ");
        add("[");
        add(seg.bar);
        add("] ");
        add(seg.pct);
        add(" | ");
        add(seg.vel);
        add(" | Loss: ");
        add(seg.loss);
        break;

      case "SpeedFirst":
        add("[");
        add(seg.id);
        add("] ");
        add(seg.vel);
        add(" ");
        add("[");
        add(seg.bar);
        add("] ");
        add(seg.pct);
        add(" | ");
        add(seg.valTotal);
        add(seg.unit);
        add(" | L: ");
        add(seg.loss);
        break;

      case "NetworkDashboard":
        add("[");
        add(seg.id);
        add("] ");
        add("[");
        add(seg.bar);
        add("] ");
        add(seg.pct);
        add(" (");
        add(seg.valTx);
        add(seg.unit);
        add(") ! ");
        add(seg.vel);
        add(" [LOSS: ");
        add(seg.loss);
        add("]");
        break;

      case "CompactRibbon":
        add("[");
        add(seg.id);
        add("] ");
        add("[");
        add(seg.bar);
        add("] ");
        add(seg.pct);
        add(" ");
        add(seg.vel);
        add(" ");
        add(seg.valTx);
        add(seg.unit);
        add("/");
        add(seg.valTotal);
        add(seg.unit);
        add(" L: ");
        add(seg.loss);
        break;

      case "MirroredLayout":
        add("[");
        add(seg.id);
        add("] ");
        add(seg.valTx);
        add(seg.unit);
        add("/");
        add(seg.valTotal);
        add(seg.unit);
        add(" ");
        add("[");
        add(seg.bar);
        add("] ");
        add(seg.pct);
        add(" | ");
        add(seg.vel);
        add(" [L: ");
        add(seg.loss);
        add("]");
        break;

      case "MathPerspective":
        add("[");
        add(seg.id);
        add("] ");
        add("[");
        add(seg.bar);
        add("] ");
        add(seg.pct);
        add(" | RANK: ");
        add(seg.valSolved());
        add("/");
        add(seg.valTotalGens());
        add(" | OPS/B: ");
        add(() => new segments.OpsDensitySegment(id, velocity, status));
        break;

      case "ParityPerspective":
        add("[");
        add(seg.id);
        add("] ");
        add("[");
        add(seg.bar);
        add("] ");
        add(seg.pct);
        add(" | RANK: ");
        add(seg.valSolved());
        add("/");
        add(seg.valTotalGens());
        add(" | E_RATIO: ");
        add(() => new segments.OpsDensitySegment(id, velocity, status));
        add("%");
        break;
    }

    this.markDirty();
  }

  getLines() {
    if (
      this.isDirty &&
      this.barWidthOption === "auto" &&
      this.forcedWidth !== null &&
      this.barSegment
    ) {
      let staticWidth = 0;
      this.children.forEach((child) => {
        if (child !== this.barSegment) {
          staticWidth += child.getWidth();
        }
      });
      const available = this.forcedWidth - staticWidth;
      this.barSegment.barWidth = Math.max(1, available);
      this.barSegment.markDirty();
    }
    return super.getLines();
  }

  onKeyPress(key) {
    if (key === "ENTER") {
      const layouts = [
        "StandardEngineer",
        "SpeedFirst",
        "NetworkDashboard",
        "CompactRibbon",
        "MirroredLayout",
      ];
      const idx = layouts.indexOf(this.layoutTemplate);
      this.layoutTemplate = layouts[(idx + 1) % layouts.length];
      this.updateState(this.state);
      return true;
    }
    return false;
  }
}

class LiteralSegment extends TuiWidget {
  constructor(text) {
    super({ id: `literal-${text}` });
    this.text = text;
  }
  render() {
    return [this.text];
  }
  getWidth() {
    return this.text.length;
  }
}

module.exports = RibbonComponent;

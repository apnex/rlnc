/**
 * Ribbon TUI: Visual Segments
 * Discrete TuiWidgets for ribbon fields.
 */
const { TuiWidget } = require("../framework/widget");
const utils = require("../framework/utils");

class RibbonSegment extends TuiWidget {
  constructor(id, options = {}) {
    super({ id, ...options });
  }

  // Helper to apply focus styling
  f(str) {
    if (this.isFocused) {
      const style = this.getStyle();
      const color = style.color || "\x1B[1;32m";
      return `${color}${str}\x1B[0m`;
    }
    return str;
  }
}

class IdentifierSegment extends RibbonSegment {
  constructor(id, options = {}) {
    super(`id-${id}`, options);
    this.value = id;
  }
  render() {
    return [this.f(this.value.padEnd(7))];
  }
}

class DataValueSegment extends RibbonSegment {
  constructor(id, value, status, options = {}) {
    super(`val-${id}`, options);
    this.value = value;
    this.status = status;
    this.precision = options.precision !== undefined ? options.precision : 1;
    this.width = options.width || 5;
  }
  render() {
    if (this.status === "IDLE") {
      const p = this.precision > 0 ? `---.-` : `---`;
      return [this.f(p.padStart(this.width))];
    }
    return [this.f(this.value.toFixed(this.precision).padStart(this.width))];
  }
}

class DataUnitSegment extends RibbonSegment {
  constructor(id, unit, status, options = {}) {
    super(`unit-${id}`, options);
    this.unit = unit;
    this.status = status;
  }
  render() {
    if (this.status === "IDLE") return [this.f(" B")]; // Fixed width 2
    return [this.f(this.unit.trim().padStart(2))]; // Ensure strict 2 char width
  }
}

class ProgressBarSegment extends RibbonSegment {
  constructor(id, transferred, total, width, options = {}) {
    super(`bar-${id}`, options);
    this.transferred = transferred;
    this.total = total;
    this.barWidth = Math.max(1, width); // Minimum 1 char
  }
  render() {
    const style = this.getStyle();
    const pct = this.total > 0 ? this.transferred / this.total : 0;
    const filledCount = Math.max(
      0,
      Math.min(this.barWidth, Math.floor(pct * this.barWidth)),
    );
    const emptyCount = Math.max(0, this.barWidth - filledCount);
    const bar =
      style.filled.repeat(filledCount) + style.track.repeat(emptyCount);
    return [this.f(bar)];
  }
}

class PercentageSegment extends RibbonSegment {
  constructor(id, transferred, total, status, options = {}) {
    super(`pct-${id}`, options);
    this.transferred = transferred;
    this.total = total;
    this.status = status;
  }
  render() {
    if (this.status === "IDLE") return [this.f("  0%")];
    const pct = Math.floor((this.transferred / this.total) * 100) || 0;
    return [this.f(`${String(pct).padStart(3)}%`)];
  }
}

class VelocitySegment extends RibbonSegment {
  constructor(id, value, unit, status, options = {}) {
    super(`vel-${id}`, options);
    this.value = value;
    this.unit = unit;
    this.status = status;
  }
  render() {
    const v =
      this.status === "IDLE" ? "  0.0" : this.value.toFixed(1).padStart(5);
    const u = this.status === "IDLE" ? " B" : this.unit.trim().padStart(2);
    return [this.f(`${v}${u}/s`)];
  }
}

class LossSegment extends RibbonSegment {
  constructor(id, value, status, options = {}) {
    super(`loss-${id}`, options);
    this.value = value;
    this.status = status;
  }
  render() {
    if (this.status === "IDLE") return [this.f("--.-%")];
    let valStr = this.value.toFixed(1);
    if (this.value > 0 && this.value < 0.1) valStr = this.value.toFixed(2);
    return [this.f(`${valStr.padStart(4)}%`)];
  }
}

class OpsDensitySegment extends RibbonSegment {
  constructor(id, value, status, options = {}) {
    super(`ops-${id}`, options);
    this.value = value;
    this.status = status;
  }
  render() {
    if (this.status === "IDLE") return [this.f(" ---.-")];
    return [this.f(this.value.toFixed(2).padStart(6))];
  }
}

module.exports = {
  IdentifierSegment,
  DataValueSegment,
  DataUnitSegment,
  ProgressBarSegment,
  PercentageSegment,
  VelocitySegment,
  LossSegment,
  OpsDensitySegment,
};

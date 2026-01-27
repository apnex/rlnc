/**
 * Session Progress Ribbon Widget
 * @warden-purpose High-level session-scale completion monitoring.
 */
const { TuiWidget, LiteralWidget } = require("./framework/widget");
const { TuiHorizontalLayout } = require("./framework/layout");
const segments = require("./ribbon/segments");
const utils = require("./framework/utils");

class SessionProgressRibbon extends TuiWidget {
  constructor(options = {}) {
    super(options);
    this.data = { sessionId: "PENDING", solved: 0, total: 0 };
  }

  update(snapshot = {}) {
    // Force alignment with SharedTelemetry.getSnapshot() property names
    this.data.sessionId = snapshot.sessionId || snapshot.sessionID || "PENDING";
    this.data.solved = snapshot.solved || 0;
    this.data.total = snapshot.total || 0;
    this.markDirty();
  }

  render() {
    const width = this.getWidth();
    const layout = new TuiHorizontalLayout({ separator: " | " });
    layout.setWidth(width);

    const prefix = new LiteralWidget(
      ` >> SESSION: [ID: ${this.data.sessionId}]`,
    );

    const pct =
      this.data.total > 0 ? (this.data.solved / this.data.total) * 100 : 0;
    const bar = new segments.ProgressBarSegment(
      "session-bar",
      pct,
      100,
      width / 2,
    );
    const progressLabel = new LiteralWidget(
      `${Math.floor(this.data.solved)}/${Math.floor(this.data.total)} GENS`,
    );

    layout.add(prefix);
    layout.add(bar);
    layout.add(progressLabel);

    return layout.getLines().map((l) => utils.pad(l, width));
  }
}

module.exports = SessionProgressRibbon;

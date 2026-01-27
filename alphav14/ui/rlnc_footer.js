const { TuiVerticalLayout, TuiHorizontalLayout } = require('./framework/layout');
const { TuiWidget, LiteralWidget } = require('./framework/widget');
const { TuiCell } = require('./framework/cell');

/**
 * RLNC Project UI: Footer Widget
 * @version 2.1.0 - LIFECYCLE-AWARE
 * @warden-purpose Displays global session metrics, lifecycle, and verification status.
 */
class RLNCFooter extends TuiVerticalLayout {
  constructor(options = {}) {
    super({ id: 'rlnc-footer', ...options });
    this.metrics = {
      solved: 0,
      totalGens: 0,
      elapsed: 0,
      verifyState: 'PENDING',
      layer: 'N/A',
      lifecycle: 'IDLE'
    };
    this.startTime = Date.now();
  }

  update(fabricState, meta = {}) {
    if (!fabricState || !fabricState.slots) return;

    this.metrics.layer = meta.testId || 'N/A';
    let totalSolved = 0;
    let totalTarget = 0;
    let verifyState = 'PENDING';
    let isRunning = false;

    fabricState.slots.forEach(slot => {
        if (slot.status !== 'DORMANT' && slot.sessionId !== '0x0') {
            totalSolved += slot.solved || 0;
            totalTarget += slot.total || 0;
            if (slot.verifyState !== 'PENDING') verifyState = slot.verifyState;
            if (slot.status === 'RUNNING') isRunning = true;
        }
    });

    this.metrics.solved = totalSolved;
    this.metrics.totalGens = totalTarget;
    this.metrics.verifyState = verifyState;
    this.metrics.elapsed = (Date.now() - this.startTime) / 1000;
    
    // Lifecycle Logic
    if (isRunning) {
        this.metrics.lifecycle = 'RUNNING';
    } else if (totalTarget > 0 && totalSolved === totalTarget) {
        this.metrics.lifecycle = 'DONE';
    } else {
        this.metrics.lifecycle = 'IDLE';
    }

    this.markDirty();
  }

  render() {
    this.children = [];

    const solvedCell = TuiCell.render(this.metrics.solved, 'DNA_RAW');
    const targetCell = TuiCell.render(this.metrics.totalGens, 'DNA_RAW');
    const progress = `PROGRESS: ${solvedCell}/${targetCell} GENS`;

    const timeCell = TuiCell.render(this.metrics.elapsed, 'DNA_TIME');
    const time = `LATENCY: ${timeCell}`;
    
    const statusColor = this.metrics.lifecycle === 'RUNNING' ? '\x1B[32m' : (this.metrics.lifecycle === 'DONE' ? '\x1B[36m' : '\x1B[90m');
    const lifecycle = `LIFECYCLE: ${statusColor}${this.metrics.lifecycle}\x1B[0m`;

    let verify = "VERIFY: PENDING";
    const vState = this.metrics.verifyState;

    if (vState === 'HASHING') {
      verify = "\x1B[1;33mVERIFY: HASHING...\x1B[0m";
    } else if (vState === 'MATCH') {
      const label = (this.metrics.layer === 'L0') ? '(Algebraic Proof Verified)' : '(SHA-256 Hash Match)';
      verify = `\x1B[1;32mVERIFY: MATCH ${label}\x1B[0m`;
    } else if (vState === 'FAIL') {
      verify = "\x1B[1;31mVERIFY: FAIL\x1B[0m";
    }
    
    const row1 = new TuiHorizontalLayout({ separator: '  |  ' });
    row1.add(new LiteralWidget(lifecycle));
    row1.add(new LiteralWidget(progress));
    row1.add(new LiteralWidget(time));
    row1.add(new LiteralWidget(verify));

    this.add(row1);

    return super.render();
  }
}

module.exports = RLNCFooter;

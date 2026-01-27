/**
 * RLNC Project UI: Header Widget
 * Displays node configuration and session metadata.
 */
const { TuiVerticalLayout, TuiHorizontalLayout } = require('./framework/layout');
const { TuiWidget, LiteralWidget, SeparatorWidget } = require('./framework/widget');
const TuiGrid = require('./framework/grid');
const os = require('os');

class RLNCHeader extends TuiWidget {
  constructor(options = {}) {
    super(options);
    this.data = {
      mode: 'N/A',
      version: 'v12',
      pieceSize: 0,
      pieceCount: 0,
      genSize: 0,
      windowSize: 0,
      netRate: 0,
      netLoss: 0,
      redundancy: 1.0,
      systematic: false,
      filename: 'N/A',
      filesize: 0,
      hash: 'N/A',
      testId: 'N/A',
      driver: 'N/A',
      layer: 'N/A',
      tickRate: 50
    };
    
    // Tier 1: Environment details
    this.env = `[RLNC-TEST-RUNNER] | ${os.platform()}-${os.arch()} | node ${process.version} | CPU: ${os.cpus()[0].model} | RAM: ${Math.round(os.totalmem() / (1024**3))}GB`;
  }

  update(config, meta = {}) {
    // Logic-as-Code: Support new manifest blocks or legacy config
    const math = config.math || config.TRANSCODE || {};
    const orchestration = config.orchestration || config.TEST || {};
    const network = config.network || config.NETWORK || {};
    const data = config.data || config.DATA || {};

    this.data.pieceSize = math.s || math.PIECE_SIZE || 0;
    this.data.pieceCount = math.n || math.PIECE_COUNT || 0;
    this.data.genSize = this.data.pieceSize * this.data.pieceCount;
    this.data.systematic = math.systematic_flag || math.SYSTEMATIC || false;
    
    this.data.netLoss = (network.loss_rate || network.LOSS_RATE || 0) * 100;
    this.data.redundancy = network.redundancy || network.REDUNDANCY || 1.0;
    
    this.data.filename = data.source || data.FILENAME || meta.filename || 'DUMMY';
    this.data.filesize = data.size || data.DUMMY_SIZE || meta.filesize || 0;
    this.data.testId = orchestration.layer_id || orchestration.ID || meta.testId || 'N/A';
    this.data.driver = orchestration.driver_type || orchestration.DRIVER || 'N/A';
    
    this.markDirty();
  }

  render() {
    const width = this.getWidth();
    const layout = new TuiVerticalLayout();
    layout.setWidth(width);

    // Tier 1: Env Bar
    layout.add(new LiteralWidget(this.env));
    layout.add(new SeparatorWidget());

    // Tier 2: Config Matrix (4-Column Grid)
    const grid = new TuiGrid({ columns: [1, 1, 1, 1], separator: ' │ ' });
    grid.setWidth(width);

    // Column 1: System/Env
    const col1 = new TuiVerticalLayout();
    col1.add(new LiteralWidget(' [SYSTEM/ENV]'));
    col1.add(new LiteralWidget(` THREADS: ${this.data.windowSize || 4}`));
    col1.add(new LiteralWidget(` TICK: ${this.data.tickRate}ms`));
    grid.add(col1);

    // Column 2: Transcode Specs
    const col2 = new TuiVerticalLayout();
    col2.add(new LiteralWidget(' [TRANSCODE SPECS]'));
    col2.add(new LiteralWidget(` PIECES (N): ${this.data.pieceCount || 'PENDING'}`));
    col2.add(new LiteralWidget(` SIZE (S):   ${this.data.pieceSize ? this.data.pieceSize + 'B' : 'PENDING'}`));
    col2.add(new LiteralWidget(` GEN SIZE:   ${this.data.genSize ? this.data.genSize + 'B' : 'PENDING'}`));
    col2.add(new LiteralWidget(` SYSTEMATIC: ${this.data.pieceCount ? (this.data.systematic ? 'TRUE' : 'FALSE') : 'PENDING'}`));
    grid.add(col2);

    // Column 3: Network Impairment
    const col3 = new TuiVerticalLayout();
    col3.add(new LiteralWidget(' [NETWORK]'));
    col3.add(new LiteralWidget(` LOSS RATE:  ${this.data.pieceCount ? this.data.netLoss.toFixed(1) + '%' : 'PENDING'}`));
    col3.add(new LiteralWidget(` REDUNDANCY: ${this.data.pieceCount ? this.data.redundancy + 'x' : 'PENDING'}`));
    const totalSizeStr = this.data.filesize > 1024 * 1024 
        ? `${(this.data.filesize / (1024 * 1024)).toFixed(2)} MB`
        : `${(this.data.filesize / 1024).toFixed(2)} KB`;
    col3.add(new LiteralWidget(` TOTAL DATA: ${this.data.filesize ? totalSizeStr : 'PENDING'}`));
    grid.add(col3);

    // Column 4: Test Context
    const col4 = new TuiVerticalLayout();
    col4.add(new LiteralWidget(' [TEST CONTEXT]'));
    col4.add(new LiteralWidget(` TEST ID: ${this.data.testId || 'PENDING'}`));
    col4.add(new LiteralWidget(` DRIVER:  ${this.data.driver || 'PENDING'}`));
    grid.add(col4);

    layout.add(grid);
    return layout.getLines();
  }
}

module.exports = RLNCHeader;


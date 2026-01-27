/**
 * TUI Framework: Grid Orchestrator
 * Partitions available width into weighted or fixed columns.
 */
const { TuiHorizontalLayout } = require('./layout');
const utils = require('./utils');

class TuiGrid extends TuiHorizontalLayout {
  /**
   * @param {Object} options
   * @param {Array<number|string>} options.columns - Mixed widths: numbers (weights) or strings (fixed chars, e.g. "45")
   */
  constructor(options = {}) {
    super(options);
    this.columns = options.columns || [];
  }

  getLines() {
    if (this.isDirty) {
      this.partitionColumns();
    }
    return super.getLines();
  }

  partitionColumns() {
    const totalWidth = this.forcedWidth || 80;
    const separatorWidth = utils.visualWidth(this.separator);
    const totalSeparatorsWidth = separatorWidth * (this.children.length - 1);
    const availableTotal = Math.max(0, totalWidth - totalSeparatorsWidth);

    let remainingFlexWidth = availableTotal;
    let totalWeight = 0;
    const resolvedWidths = Array(this.children.length).fill(0);

    // 1. First Pass: Assign Fixed Widths
    this.children.forEach((child, i) => {
      const colSpec = this.columns[i];
      if (typeof colSpec === 'string' && !isNaN(colSpec)) {
        const fixed = parseInt(colSpec);
        resolvedWidths[i] = fixed;
        remainingFlexWidth -= fixed;
      } else {
        totalWeight += (typeof colSpec === 'number') ? colSpec : 1;
      }
    });

    // 2. Second Pass: Distribute Flex Width
    let consumedFlex = 0;
    const flexCount = this.children.filter((_, i) => resolvedWidths[i] === 0).length;
    
    let flexIdx = 0;
    this.children.forEach((child, i) => {
      if (resolvedWidths[i] === 0) {
        const weight = (typeof this.columns[i] === 'number') ? this.columns[i] : 1;
        let w = Math.floor((weight / totalWeight) * remainingFlexWidth);
        
        // Remainder to last flex column
        if (flexIdx === flexCount - 1) {
          w = remainingFlexWidth - consumedFlex;
        }
        
        resolvedWidths[i] = w;
        consumedFlex += w;
        flexIdx++;
      }
      
      child.setWidth(resolvedWidths[i]);
    });
  }
}

module.exports = TuiGrid;

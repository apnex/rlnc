/**
 * TUI Framework: Snapshot Tool
 * Utilities for bit-perfect regression testing.
 */
const fs = require('fs');
const path = require('path');

class TuiSnapshot {
  constructor(options = {}) {
    this.baseDir = options.snapshotDir || './ui/framework/snapshots';
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Captures a snapshot of a component's output.
   */
  capture(name, component) {
    const filePath = path.join(this.baseDir, `${name}.txt`);
    const content = component.getLines().join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }

  /**
   * Asserts that a component's output matches a saved snapshot.
   */
  assert(name, component) {
    const filePath = path.join(this.baseDir, `${name}.txt`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Snapshot [${name}] not found. Run capture first.`);
    }

    const actual = component.getLines().join('\n');
    const expected = fs.readFileSync(filePath, 'utf8');

    if (actual !== expected) {
      this.generateFailureLog(name, expected, actual);
      return false;
    }
    return true;
  }

  generateFailureLog(name, expected, actual) {
    console.error(`\n❌ Snapshot Mismatch: ${name}`);
    console.error(`-----------------------------------`);
    console.error(`EXPECTED:\n${expected}`);
    console.error(`-----------------------------------`);
    console.error(`ACTUAL:\n${actual}`);
    console.error(`-----------------------------------\n`);
  }
}

module.exports = TuiSnapshot;

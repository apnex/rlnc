/**
 * TUI Framework: Key Event Mapping
 */

const KEYS = {
  TAB: '\t',
  ENTER: '\r',
  ESCAPE: '\x1B',
  UP: '\x1B[A',
  DOWN: '\x1B[B',
  RIGHT: '\x1B[C',
  LEFT: '\x1B[D',
  CTRL_C: '\x03'
};

function identifyKey(chunk) {
  const s = chunk.toString();
  for (const [name, val] of Object.entries(KEYS)) {
    if (s === val) return name;
  }
  return s; // Return raw character if not special
}

module.exports = {
  KEYS,
  identifyKey
};

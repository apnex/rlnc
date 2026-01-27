/**
 * TUI Framework: Core Utilities
 * ANSI-aware string geometry and alignment.
 */

function stripAnsi(str) {
  if (typeof str !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[mGJK]/g, "");
}

function visualWidth(str) {
  return stripAnsi(str).length;
}

/**
 * Pads or truncates a string to a specific visible width.
 */
function pad(str, width, align = 'left', char = ' ') {
  const vWidth = visualWidth(str);
  
  if (vWidth > width) {
    // Clipping logic: maintain ANSI codes if possible (simplified for now)
    // For this framework, we prioritize structural integrity.
    return stripAnsi(str).substring(0, width);
  }

  if (vWidth === width) return str;

  const diff = width - vWidth;
  if (align === 'left') {
    return str + char.repeat(diff);
  } else if (align === 'right') {
    return char.repeat(diff) + str;
  } else if (align === 'center') {
    const left = Math.floor(diff / 2);
    const right = diff - left;
    return char.repeat(left) + str + char.repeat(right);
  }
  return str;
}

function normalizeLines(lines, width, align = 'left') {
  const targetWidth = width || Math.max(...lines.map(visualWidth));
  return lines.map(line => pad(line, targetWidth, align));
}

module.exports = {
  stripAnsi,
  visualWidth,
  pad,
  normalizeLines
};

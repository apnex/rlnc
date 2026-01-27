/**
 * TUI Framework: Style Registry
 * Manages Unicode character sets and themes.
 */

const STYLES = {
  StyleA: {
    name: 'Retro/Dot',
    filled: '■',
    track: '·',
    borders: {
      tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│'
    },
    focused: {
      color: '\x1B[1;32m', // Bright Green
      borders: {
        tl: '┍', tr: '┑', bl: '┕', br: '┙', h: '━', v: '┃'
      }
    }
  },
  StyleB: {
    name: 'Retro/Square',
    filled: '■',
    track: '▫',
    borders: {
      tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║'
    },
    focused: {
      color: '\x1B[1;36m', // Bright Cyan
      borders: {
        tl: '█', tr: '█', bl: '█', br: '█', h: '▀', v: '█'
      }
    }
  },
  StyleC: {
    name: 'Minimalist',
    filled: '▪',
    track: '▫',
    borders: {
      tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|'
    },
    focused: {
      color: '\x1B[1;33m', // Bright Yellow
      borders: {
        tl: '#', tr: '#', bl: '#', br: '#', h: '=', v: '#'
      }
    }
  }
};

class StyleRegistry {
  constructor() {
    this.current = 'StyleA';
  }

  get(name) {
    return STYLES[name || this.current] || STYLES.StyleA;
  }

  setGlobal(name) {
    if (STYLES[name]) {
      this.current = name;
    }
  }

  get list() {
    return Object.keys(STYLES);
  }
}

// Export as a singleton
module.exports = new StyleRegistry();

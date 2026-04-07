// ═══════════════════════════════════════════════
// BOARD LAYOUT
// ═══════════════════════════════════════════════
// 33 concept cells + 3 corner specials + 1 start = 36 total on a 9x9 ring
// Actually: 4 corners + 32 edge cells = 36 total on 11x11 grid ring
// Ring: 10 per side × 4 - 4 corners = 36 positions (0-35)

// Assign concepts to positions 1-33, positions 33-35 = bonus
const BOARD_CELLS = [];

// Corners at positions 0, 9, 18, 27
const CORNERS = {
  0: { name: 'START', icon: '🚀', label: 'התחלה' },
  9: { name: 'BONUS', icon: '⭐', label: 'בונוס' },
  18: { name: 'PAUSE', icon: '☕', label: 'הפסקה' },
  27: { name: 'CHANCE', icon: '🎯', label: 'מזל' }
};

// 36 positions total (0-35)
// Distribute 33 concepts into non-corner positions
const conceptPositions = [];
for (let i = 0; i < 36; i++) {
  if (!CORNERS[i]) conceptPositions.push(i);
}
// conceptPositions has 32 slots, 33 concepts — add one extra concept to a corner
// Actually let's do 36 positions: 4 corners + 32 concepts (drop last concept... no)
// Better: 40 positions (10 per side), 4 corners, 36 edges, use 33 of them
// For simplicity: 36 cells, 4 corners, 32 concept slots — use 32 concepts + list all 33 accessible via mini-menu

// We'll use 40 positions: 10 per side (including corners)
// positions 0-39: 0,10,20,30 = corners; rest = concepts
const NUM_POSITIONS = 40;
const CORNER_POS = [0, 10, 20, 30];

const BOARD_MAP = {}; // position -> concept or corner
let cIdx = 0;
for (let i = 0; i < NUM_POSITIONS; i++) {
  if (CORNER_POS.includes(i)) {
    BOARD_MAP[i] = { type: 'corner', ...({
      0: { icon: '🚀', label: 'START' },
      10: { icon: '⭐', label: 'בונוס' },
      20: { icon: '☕', label: 'הפסקה' },
      30: { icon: '🎯', label: 'מזל' }
    }[i]) };
  } else {
    BOARD_MAP[i] = { type: 'concept', concept: CONCEPTS[cIdx % CONCEPTS.length] };
    cIdx++;
  }
}

// ═══════════════════════════════════════════════
// GRID POSITIONS (which grid cell for each board position)
// Board is 11x11 grid (indices 1-11)
// Bottom row: positions 0-10 (left to right) → grid row 12, col 1-11
// Left col: positions 11-19 (bottom to top) → grid row 11-3, col 1
// Top row: positions 20-30 (right to left) → grid row 1, col 11-1
// Right col: positions 31-39 (top to bottom) → grid row 2-10, col 11
// ═══════════════════════════════════════════════

function getGridPos(pos) {
  // Bottom row: pos 0-10 → row 12 (but we have 11 grid rows), let's use row 11
  if (pos >= 0 && pos <= 10) {
    return { row: 12, col: 11 - pos }; // right to left
  }
  if (pos >= 11 && pos <= 19) {
    return { row: 11 - (pos - 10), col: 1 };
  }
  if (pos >= 20 && pos <= 30) {
    return { row: 1, col: pos - 19 };
  }
  if (pos >= 31 && pos <= 39) {
    return { row: pos - 29, col: 11 };
  }
  return { row: 1, col: 1 };
}

// Cell visual size: corner=128px, normal=100px. Board=1160px.
// Grid: col 1=128px, col 2-10=100px×9=900px, col 11=128px → total 1156px ✓
// Pixel positions for pawns
function getCellPixelCenter(pos) {
  const gp = getGridPos(pos);
  const colWidths = [0, 128, 100,100,100,100,100,100,100,100,100, 128];
  const rowHeights = [0, 128, 100,100,100,100,100,100,100,100,100, 128];
  let x = 0, y = 0;
  for (let c = 1; c < gp.col; c++) x += colWidths[c];
  x += colWidths[gp.col] / 2;
  for (let r = 1; r < gp.row; r++) y += rowHeights[r];
  y += rowHeights[Math.min(gp.row, 12)] / 2;
  return { x, y };
}


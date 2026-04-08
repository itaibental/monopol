// ═══════════════════════════════════════════════
// BOARD LAYOUT — 44 positions
// 4 corners (0, 11, 22, 33) + 4 bonus (5, 16, 27, 38)
// + 36 concept cells
// Each side: 11 cells (corner + 4 concepts + bonus + 4 concepts + corner)
// Grid: 12×12 (corners = 128px, normal = 100px)
// ═══════════════════════════════════════════════

const NUM_POSITIONS = 44;
const CORNER_POS = [0, 11, 22, 33];
const BONUS_POS = [5, 16, 27, 38];

const BONUS_CARDS = [
  { icon: '💰', label: 'בונוס', desc: 'קיבלת 10 ₪ מהבנק!', effect: 'money', amount: 10 },
  { icon: '🎲', label: 'תור נוסף', desc: 'שחק תור נוסף!', effect: 'extraTurn' },
  { icon: '💎', label: 'אוצר', desc: 'מצאת אוצר! +15 ₪', effect: 'money', amount: 15 },
  { icon: '🃏', label: 'הגרלה', desc: 'הגרלה! קבל 5-20 ₪', effect: 'lottery' }
];

const BOARD_MAP = {};
let cIdx = 0;

for (let i = 0; i < NUM_POSITIONS; i++) {
  if (CORNER_POS.includes(i)) {
    const cornerData = {
      0:  { icon: '🚀', label: 'START' },
      11: { icon: '⭐', label: 'בונוס' },
      22: { icon: '☕', label: 'הפסקה' },
      33: { icon: '🎯', label: 'מזל' }
    };
    BOARD_MAP[i] = { type: 'corner', ...cornerData[i] };
  } else if (BONUS_POS.includes(i)) {
    const bIdx = BONUS_POS.indexOf(i);
    BOARD_MAP[i] = { type: 'bonus', ...BONUS_CARDS[bIdx] };
  } else {
    BOARD_MAP[i] = { type: 'concept', concept: CONCEPTS[cIdx % CONCEPTS.length] };
    cIdx++;
  }
}

// ═══════════════════════════════════════════════
// GRID POSITIONS
// 12×12 grid. Each side has 12 cells (including shared corners).
// Bottom row: pos 0-11 → grid row 12, col 12 down to 1 (RTL: right to left)
// Left col:   pos 12-21 → grid col 1, row 11 up to 2
// Top row:    pos 22-33 → grid row 1, col 2 to 12 (left to right) — WAIT, keeping original RTL
// Right col:  pos 34-43 → grid col 12, row 2 down to 11
// ═══════════════════════════════════════════════

function getGridPos(pos) {
  if (pos >= 0 && pos <= 11) {
    // Bottom row: pos 0=bottom-right (col 12), pos 11=bottom-left (col 1)
    return { row: 12, col: 12 - pos };
  }
  if (pos >= 12 && pos <= 21) {
    // Left column going up: pos 12=row 11, pos 21=row 2
    return { row: 11 - (pos - 12), col: 1 };
  }
  if (pos >= 22 && pos <= 33) {
    // Top row left to right: pos 22=col 1, pos 33=col 12
    return { row: 1, col: pos - 21 };
  }
  if (pos >= 34 && pos <= 43) {
    // Right column going down: pos 34=row 2, pos 43=row 11
    return { row: pos - 32, col: 12 };
  }
  return { row: 1, col: 1 };
}

// ═══════════════════════════════════════════════
// PIXEL POSITIONS — for pawn placement
// Corner cells = 128px, normal cells = 100px
// Grid: col1=128, col2-11=100×10=1000, col12=128 → 1256px
// ═══════════════════════════════════════════════

function getCellPixelCenter(pos) {
  const gp = getGridPos(pos);
  const colWidths =  [0, 128, 100,100,100,100,100,100,100,100,100,100, 128];
  const rowHeights = [0, 128, 100,100,100,100,100,100,100,100,100,100, 128];
  let x = 0, y = 0;
  for (let c = 1; c < gp.col; c++) x += colWidths[c];
  x += colWidths[gp.col] / 2;
  for (let r = 1; r < gp.row; r++) y += rowHeights[r];
  y += rowHeights[Math.min(gp.row, 12)] / 2;
  return { x, y };
}

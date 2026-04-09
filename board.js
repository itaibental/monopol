// ═══════════════════════════════════════════════
// BOARD LAYOUT — 44 positions, CLOCKWISE
//
// Visual layout (12×12 grid):
//
//   [22]─[21]─[20]─[19]─[18]─[17]─[16]─[15]─[14]─[13]─[12]─[11]
//    |                                                          |
//   [23]                                                       [10]
//   [24]                                                        [9]
//   [25]                                                        [8]
//   [26]                                                        [7]
//   [27]               CENTER                                   [6]
//   [28]                                                        [5]
//   [29]                                                        [4]
//   [30]                                                        [3]
//   [31]                                                        [2]
//   [32]                                                        [1]
//    |                                                          |
//   [ 0]─[43]─[42]─[41]─[40]─[39]─[38]─[37]─[36]─[35]─[34]─[33]
//
// START
//
// pos  0 = START        (bottom-left corner)  🚀
// pos  1-10 = left column going UP
// pos 11 = top-left corner (בונוס)            ⭐
// pos 12-21 = top row going RIGHT
// pos 22 = top-right corner (הפסקה)           ☕
// pos 23-32 = right column going DOWN
// pos 33 = bottom-right corner (מזל)          🎯
// pos 34-43 = bottom row going LEFT (back to START)
//
// Corners: 0, 11, 22, 33
// Bonus cards: 5 (left col mid), 16 (top row mid),
//              27 (right col mid), 38 (bottom row mid)
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
// GRID POSITIONS (12×12 grid, rows/cols 1-12)
//
// Clockwise from bottom-left:
// pos  0       → row 12, col 1   (bottom-left = START)
// pos  1-10    → left col going UP: row 11..2, col 1
// pos 11       → row 1,  col 1   (top-left)
// pos 12-21    → top row going RIGHT: col 2..11, row 1
// pos 22       → row 1,  col 12  (top-right)
// pos 23-32    → right col going DOWN: row 2..11, col 12
// pos 33       → row 12, col 12  (bottom-right = מזל)
// pos 34-43    → bottom row going LEFT: col 11..2, row 12
// ═══════════════════════════════════════════════

function getGridPos(pos) {
  // START corner (bottom-left)
  if (pos === 0) return { row: 12, col: 1 };

  // Left column going UP (pos 1-10 → row 11..2, col 1)
  if (pos >= 1 && pos <= 10) {
    return { row: 12 - pos, col: 1 };
  }

  // Top-left corner
  if (pos === 11) return { row: 1, col: 1 };

  // Top row going RIGHT (pos 12-21 → col 2..11, row 1)
  if (pos >= 12 && pos <= 21) {
    return { row: 1, col: pos - 10 };
  }

  // Top-right corner
  if (pos === 22) return { row: 1, col: 12 };

  // Right column going DOWN (pos 23-32 → row 2..11, col 12)
  if (pos >= 23 && pos <= 32) {
    return { row: pos - 21, col: 12 };
  }

  // Bottom-right corner (מזל)
  if (pos === 33) return { row: 12, col: 12 };

  // Bottom row going LEFT (pos 34-43 → col 11..2, row 12)
  if (pos >= 34 && pos <= 43) {
    return { row: 12, col: 12 - (pos - 33) };
  }

  return { row: 12, col: 1 };
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

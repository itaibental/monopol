// ═══════════════════════════════════════════════
// GAME ENGINE — board layout, dice, movement, quiz
// ═══════════════════════════════════════════════
import { ZONE_COLORS, ZONE_NAMES } from './concepts-data.js';

export const NUM_POSITIONS = 40;
export const CORNER_POS = [0, 10, 20, 30];
export const PAWNS = ['🔴','🔵','🟢','🟡'];
export const PAWN_COLORS = ['#ef4444','#3b82f6','#22c55e','#eab308'];
export const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

// ═══════════════════════════════════════════════
// BOARD MAP BUILDER
// ═══════════════════════════════════════════════
export function buildBoardMap(concepts) {
  const BOARD_MAP = {};
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
      BOARD_MAP[i] = { type: 'concept', concept: concepts[cIdx % concepts.length] };
      cIdx++;
    }
  }
  return BOARD_MAP;
}

// ═══════════════════════════════════════════════
// GRID POSITIONS
// ═══════════════════════════════════════════════
export function getGridPos(pos) {
  if (pos >= 0 && pos <= 10) return { row: 12, col: 11 - pos };
  if (pos >= 11 && pos <= 19) return { row: 11 - (pos - 10), col: 1 };
  if (pos >= 20 && pos <= 30) return { row: 1, col: pos - 19 };
  if (pos >= 31 && pos <= 39) return { row: pos - 29, col: 11 };
  return { row: 1, col: 1 };
}

export function getCellPixelCenter(pos) {
  const gp = getGridPos(pos);
  const colWidths = [0, 64, 50,50,50,50,50,50,50,50,50, 64];
  const rowHeights = [0, 64, 50,50,50,50,50,50,50,50,50, 64];
  let x = 0, y = 0;
  for (let c = 1; c < gp.col; c++) x += colWidths[c];
  x += colWidths[gp.col] / 2;
  for (let r = 1; r < gp.row; r++) y += rowHeights[r];
  y += rowHeights[Math.min(gp.row, 12)] / 2;
  return { x, y };
}

// ═══════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════
export function createPlayer(name, idx) {
  return { name, pawn: PAWNS[idx], color: PAWN_COLORS[idx], pos: 0, score: 0 };
}

export function createGameState(players, sessionId, mode) {
  return {
    players,
    currentPlayer: 0,
    visited: [0],
    rolling: false,
    quizActive: false,
    sessionId,
    mode, // 'solo' | 'group'
    startedAt: Date.now()
  };
}

// ═══════════════════════════════════════════════
// DICE ROLL
// ═══════════════════════════════════════════════
export async function rollDiceAnimation(d1El, d2El) {
  d1El.classList.add('rolling');
  d2El.classList.add('rolling');

  let ticks = 0;
  const interval = setInterval(() => {
    d1El.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    d2El.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    ticks++;
    if (ticks > 12) clearInterval(interval);
  }, 60);

  await new Promise(r => setTimeout(r, 800));

  const r1 = Math.floor(Math.random() * 6) + 1;
  const r2 = Math.floor(Math.random() * 6) + 1;
  d1El.classList.remove('rolling');
  d2El.classList.remove('rolling');
  d1El.textContent = DICE_FACES[r1 - 1];
  d2El.textContent = DICE_FACES[r2 - 1];

  return r1 + r2;
}

// ═══════════════════════════════════════════════
// CORNER EVENTS
// ═══════════════════════════════════════════════
export function handleCorner(pos, player) {
  const msgs = {
    0: 'חזרת לנקודת ההתחלה! 🚀',
    10: `🌟 בונוס! ${player.name} מקבל +5 נקודות!`,
    20: '☕ הפסקה — עבור תור',
    30: '🎯 מזל! +3 נקודות!'
  };
  if (pos === 10) player.score += 5;
  if (pos === 30) player.score += 3;
  return msgs[pos] || '';
}

// ═══════════════════════════════════════════════
// QUIZ SCORING
// ═══════════════════════════════════════════════
export function calcPoints(score) {
  return score * 2;
}

export function getResultMsg(score) {
  if (score === 5) return 'מושלם! 🏆';
  if (score >= 3) return 'כל הכבוד! 💪';
  return 'נסה שוב 📚';
}

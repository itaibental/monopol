// ═══════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════
const PAWNS = ['🔴','🔵','🟢','🟡'];
const PAWN_COLORS = ['#ef4444','#3b82f6','#22c55e','#eab308'];

let players = [];
let currentPlayer = 0;
let visited = new Set();
let rolling = false;
let quizActive = false;

// ═══════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════
let numPlayers = 1;

function initSetup() {
  document.querySelectorAll('.np-btn').forEach(b => {
    b.addEventListener('click', () => {
      numPlayers = parseInt(b.dataset.n);
      document.querySelectorAll('.np-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderPlayerInputs();
    });
  });
  renderPlayerInputs();
}

function renderPlayerInputs() {
  const c = document.getElementById('playerInputs');
  const defaultNames = ['שחקן 1','שחקן 2','שחקן 3','שחקן 4'];
  c.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    c.innerHTML += `
      <div class="player-input-row">
        <div class="pawn-pick">${PAWNS[i]}</div>
        <input class="name-input" id="pname${i}" value="${defaultNames[i]}" placeholder="שם שחקן">
      </div>`;
  }
}

function startGame() {
  players = [];
  for (let i = 0; i < numPlayers; i++) {
    const name = document.getElementById('pname' + i)?.value || ('שחקן ' + (i+1));
    players.push({ name, pawn: PAWNS[i], color: PAWN_COLORS[i], pos: 0, score: 0 });
  }
  currentPlayer = 0;
  visited = new Set([0]);
  document.getElementById('setupOverlay').style.display = 'none';
  renderBoard();
  renderPlayers();
  renderPawns();
  updateTurnInfo();
  updateVisitedCount();
}

function showSetup() {
  document.getElementById('setupOverlay').style.display = 'flex';
  numPlayers = 1;
  document.querySelectorAll('.np-btn').forEach(b => b.classList.toggle('active', b.dataset.n === '1'));
  renderPlayerInputs();
}

// ═══════════════════════════════════════════════
// RENDER BOARD
// ═══════════════════════════════════════════════
function renderBoard() {
  const board = document.getElementById('board');
  // Clear old cells (keep center + pawns layer)
  board.querySelectorAll('.cell').forEach(e => e.remove());

  for (let pos = 0; pos < NUM_POSITIONS; pos++) {
    const cell = document.createElement('div');
    const gp = getGridPos(pos);
    cell.style.gridRow = gp.row;
    cell.style.gridColumn = gp.col;
    cell.dataset.pos = pos;

    const data = BOARD_MAP[pos];

    if (data.type === 'corner') {
      cell.className = 'cell corner';
      cell.innerHTML = `<div class="corner-icon">${data.icon}</div><div class="corner-label">${data.label}</div>`;
    } else {
      const c = data.concept;
      const color = ZONE_COLORS[c.zone];
      const isVert = (pos >= 11 && pos <= 19) || (pos >= 31 && pos <= 39);
      const isTop = pos >= 20 && pos <= 30;
      let edgeClass = '';
      if (pos >= 11 && pos <= 19) edgeClass = 'left-col';
      else if (pos >= 20 && pos <= 30) edgeClass = 'top-row';
      else if (pos >= 31 && pos <= 39) edgeClass = 'right-col';
      cell.className = `cell ${edgeClass} ${visited.has(pos) ? 'visited' : ''}`;
      cell.style.background = color + '18';
      cell.innerHTML = `
        <div class="cell-color-bar" style="background:${color}"></div>
        <div class="cell-name">${c.name}</div>
        <div class="cell-num">${pos}</div>`;
      cell.addEventListener('click', () => openConceptModal(pos));
    }
    board.appendChild(cell);
  }
}

// ═══════════════════════════════════════════════
// RENDER PLAYERS
// ═══════════════════════════════════════════════
function renderPlayers() {
  const panel = document.getElementById('playerPanel');
  panel.innerHTML = players.map((p, i) => `
    <div class="player-card ${i === currentPlayer ? 'active-player' : ''}">
      <div class="pawn-icon">${p.pawn}</div>
      <div>
        <div class="p-name">${p.name}</div>
        <div class="p-pos">משבצת ${p.pos}</div>
        <div class="p-score">⭐ ${p.score}</div>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════
// RENDER PAWNS
// ═══════════════════════════════════════════════
function renderPawns() {
  const layer = document.getElementById('pawnsLayer');
  layer.innerHTML = '';
  players.forEach((p, i) => {
    const { x, y } = getCellPixelCenter(p.pos);
    const offset = (i - (players.length - 1) / 2) * 10;
    const pawn = document.createElement('div');
    pawn.className = 'pawn';
    pawn.id = 'pawn' + i;
    pawn.style.left = (x + offset - 7) + 'px';
    pawn.style.top = (y - 24 + (i * 3)) + 'px';
    pawn.innerHTML = `
      <div class="pawn-body" style="background:${p.color}"></div>
      <div class="pawn-stem"></div>
      <div class="pawn-label">${p.pawn}</div>`;
    layer.appendChild(pawn);
  });
}

function animatePawn(playerIdx, newPos) {
  return new Promise(resolve => {
    const { x, y } = getCellPixelCenter(newPos);
    const offset = (playerIdx - (players.length - 1) / 2) * 10;
    const pawn = document.getElementById('pawn' + playerIdx);
    if (pawn) {
      pawn.style.left = (x + offset - 7) + 'px';
      pawn.style.top = (y - 24 + (playerIdx * 3)) + 'px';
    }
    setTimeout(resolve, 650);
  });
}

// ═══════════════════════════════════════════════
// DICE
// ═══════════════════════════════════════════════
const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

async function rollDice() {
  if (rolling || quizActive) return;
  rolling = true;
  document.getElementById('rollBtn').disabled = true;

  const d1 = document.getElementById('die1');
  const d2 = document.getElementById('die2');
  d1.classList.add('rolling');
  d2.classList.add('rolling');

  // Animate dice
  let ticks = 0;
  const interval = setInterval(() => {
    d1.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    d2.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    ticks++;
    if (ticks > 12) clearInterval(interval);
  }, 60);

  await new Promise(r => setTimeout(r, 800));

  const r1 = Math.floor(Math.random() * 6) + 1;
  const r2 = Math.floor(Math.random() * 6) + 1;
  d1.classList.remove('rolling');
  d2.classList.remove('rolling');
  d1.textContent = DICE_FACES[r1 - 1];
  d2.textContent = DICE_FACES[r2 - 1];

  const total = r1 + r2;

  // Move pawn
  const p = players[currentPlayer];
  const oldPos = p.pos;
  p.pos = (p.pos + total) % NUM_POSITIONS;

  // Step by step animation
  for (let step = 1; step <= total; step++) {
    const stepPos = (oldPos + step) % NUM_POSITIONS;
    await animatePawn(currentPlayer, stepPos);
  }

  renderPlayers();
  visited.add(p.pos);
  updateVisitedCount();
  updateBoardVisited();

  // Land action
  const cell = BOARD_MAP[p.pos];
  if (cell.type === 'corner') {
    handleCorner(p.pos);
    rolling = false;
    nextPlayer();
  } else {
    rolling = false;
    openConceptModal(p.pos, true /* autoQuiz */);
  }

  document.getElementById('rollBtn').disabled = false;
}

function handleCorner(pos) {
  const msgs = {
    0: 'חזרת לנקודת ההתחלה! 🚀',
    10: `🌟 בונוס! ${players[currentPlayer].name} מקבל +5 נקודות!`,
    20: '☕ הפסקה — עבור תור',
    30: '🎯 מזל! +3 נקודות!'
  };
  if (pos === 10) players[currentPlayer].score += 5;
  if (pos === 30) players[currentPlayer].score += 3;
  showToast(msgs[pos] || '');
  renderPlayers();
}

function nextPlayer() {
  currentPlayer = (currentPlayer + 1) % players.length;
  renderPlayers();
  updateTurnInfo();
}

function updateTurnInfo() {
  if (!players.length) return;
  const p = players[currentPlayer];
  document.getElementById('turnInfo').textContent = `${p.pawn} תור ${p.name} — משבצת ${p.pos}`;
}

function updateVisitedCount() {
  document.getElementById('visitedCount').textContent = visited.size + '/33 ✓';
}

function updateBoardVisited() {
  document.querySelectorAll('.cell[data-pos]').forEach(cell => {
    const pos = parseInt(cell.dataset.pos);
    if (visited.has(pos) && BOARD_MAP[pos]?.type === 'concept') {
      cell.classList.add('visited');
    }
  });
}

// ═══════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════
let currentConcept = null;
let autoQuizAfterDef = false;

function openConceptModal(pos, autoQuiz = false) {
  const cell = BOARD_MAP[pos];
  if (!cell || cell.type !== 'concept') return;
  const c = cell.concept;
  currentConcept = c;
  autoQuizAfterDef = autoQuiz;
  const color = ZONE_COLORS[c.zone];

  document.getElementById('modalContent').innerHTML = `
    <div><span class="modal-zone-badge" style="background:${color}22;color:${color}">${ZONE_NAMES[c.zone]}</span></div>
    <div class="modal-title">${c.name}</div>
    <div class="modal-short">${c.short}</div>
    <div class="modal-def">${c.def}</div>
    <button class="modal-play-btn" style="background:linear-gradient(135deg,${color}cc,${color});color:#000" onclick="startQuiz()">
      🎮 התחל 5 שאלות
    </button>`;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  if (quizActive) return;
  document.getElementById('modal').style.display = 'none';
  currentConcept = null;
  if (rolling === false) {
    nextPlayer();
  }
}

// ═══════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════
let qState = null;

function startQuiz() {
  if (!currentConcept) return;
  quizActive = true;
  qState = { concept: currentConcept, qi: 0, score: 0, dots: new Array(5).fill('') };
  renderQuestion();
}

function renderQuestion() {
  const { concept, qi, dots } = qState;
  const color = ZONE_COLORS[concept.zone];
  const q = concept.quiz[qi];

  const dotsHtml = dots.map((d, i) =>
    `<div class="qdot ${i < qi ? d : i === qi ? 'current' : ''}"></div>`
  ).join('');

  document.getElementById('modalContent').innerHTML = `
    <div class="quiz-header">
      <div style="font-size:12px;font-weight:700;color:${color};margin-bottom:8px">${concept.name}</div>
      <div class="quiz-prog-dots">${dotsHtml}</div>
      <div style="font-size:11px;color:#666;margin-bottom:8px">שאלה ${qi + 1} / 5</div>
      <div class="q-level">${q.level}</div>
      <div class="q-text">${q.q}</div>
    </div>
    <div class="q-opts">
      ${q.opts.map((o, i) => `<button class="q-opt" onclick="answerQ(${i})">${o}</button>`).join('')}
    </div>
    <div class="q-feedback" id="qfb"></div>
    <button class="q-next" id="qnext" onclick="nextQ()">
      ${qi < 4 ? 'שאלה הבאה ›' : 'תוצאות ›'}
    </button>`;
}

function answerQ(chosen) {
  const { concept, qi } = qState;
  const q = concept.quiz[qi];
  const opts = document.querySelectorAll('.q-opt');
  opts.forEach(b => b.disabled = true);

  const correct = chosen === q.ans;
  if (correct) qState.score++;
  qState.dots[qi] = correct ? 'correct' : 'wrong';

  opts[q.ans].classList.add('correct');
  if (!correct) opts[chosen].classList.add('wrong');

  const fb = document.getElementById('qfb');
  fb.className = 'q-feedback show ' + (correct ? 'correct' : 'wrong');
  fb.textContent = (correct ? '✓ נכון! ' : '✗ לא נכון. ') + q.explain;
  document.getElementById('qnext').classList.add('show');
}

function nextQ() {
  qState.qi++;
  if (qState.qi >= 5) showResult();
  else renderQuestion();
}

function showResult() {
  const { concept, score, dots } = qState;
  const color = ZONE_COLORS[concept.zone];
  const pct = Math.round(score / 5 * 100);
  const p = players[currentPlayer];

  // Award points
  const points = score * 2;
  if (p) p.score += points;

  const msg = score === 5 ? 'מושלם! 🏆' : score >= 3 ? 'כל הכבוד! 💪' : 'נסה שוב 📚';

  const dotsHtml = dots.map(d => `<div class="qdot ${d}"></div>`).join('');

  document.getElementById('modalContent').innerHTML = `
    <div class="quiz-result">
      <div class="quiz-prog-dots" style="margin-bottom:16px">${dotsHtml}</div>
      <div class="score-hexagon" style="--pct:${pct}%">${score}/5</div>
      <div class="result-msg">${msg}</div>
      <div class="result-sub">הרווחת <strong style="color:${color}">+${points} נקודות</strong></div>
      <div class="result-btns">
        <button class="r-btn primary" onclick="retryQuiz()">נסה שוב</button>
        <button class="r-btn secondary" onclick="finishQuiz()">סיים</button>
      </div>
    </div>`;

  renderPlayers();
  quizActive = false;
}

function retryQuiz() {
  quizActive = true;
  qState.qi = 0;
  qState.score = 0;
  qState.dots = new Array(5).fill('');
  renderQuestion();
}

function finishQuiz() {
  quizActive = false;
  document.getElementById('modal').style.display = 'none';
  nextPlayer();
  renderPlayers();
  updateTurnInfo();
}

// ═══════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
initSetup();

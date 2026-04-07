// ═══════════════════════════════════════════════
// FIREBASE CONFIGURATION
// ═══════════════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuo4N-w-5JFu2pLwmNmPrnuB56q0-9Ikc",
  authDomain: "pedagogical-tools.firebaseapp.com",
  databaseURL: "https://pedagogical-tools-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pedagogical-tools",
  storageBucket: "pedagogical-tools.firebasestorage.app",
  messagingSenderId: "439078826304",
  appId: "1:439078826304:web:66b01e7e2c19ac9c7a4aa5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ═══════════════════════════════════════════════
// DB HELPERS
// ═══════════════════════════════════════════════

export async function savePlayerSession(sessionData) {
  const sessionRef = ref(db, `sessions/${sessionData.sessionId}`);
  await set(sessionRef, { ...sessionData, lastUpdated: Date.now() });
}

export async function loadPlayerSession(sessionId) {
  const snap = await get(ref(db, `sessions/${sessionId}`));
  return snap.exists() ? snap.val() : null;
}

export async function updatePlayerScore(sessionId, playerName, score, pos) {
  const scoreRef = ref(db, `leaderboard/${sessionId}_${playerName.replace(/[.#$[\]]/g,'_')}`);
  await set(scoreRef, {
    name: playerName,
    score,
    pos,
    sessionId,
    updatedAt: Date.now()
  });
}

export async function getLeaderboard() {
  const snap = await get(ref(db, 'leaderboard'));
  if (!snap.exists()) return [];
  const data = snap.val();
  // Aggregate by player name — keep highest score
  const byPlayer = {};
  Object.values(data).forEach(entry => {
    const key = entry.name;
    if (!byPlayer[key] || entry.score > byPlayer[key].score) {
      byPlayer[key] = entry;
    }
  });
  return Object.values(byPlayer)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

export async function saveGameState(sessionId, state) {
  await set(ref(db, `gamestates/${sessionId}`), {
    ...state,
    savedAt: Date.now()
  });
}

export async function loadGameState(sessionId) {
  const snap = await get(ref(db, `gamestates/${sessionId}`));
  return snap.exists() ? snap.val() : null;
}

// ═══════════════════════════════════════════════
// CONCEPTS MANAGEMENT
// ═══════════════════════════════════════════════

export async function loadCustomConcepts() {
  const snap = await get(ref(db, 'concepts'));
  return snap.exists() ? snap.val() : null;
}

export async function saveCustomConcepts(concepts) {
  await set(ref(db, 'concepts'), concepts);
}

export async function updateConcept(conceptId, conceptData) {
  await set(ref(db, `concepts/${conceptId}`), conceptData);
}

export async function deleteConcept(conceptId) {
  await remove(ref(db, `concepts/${conceptId}`));
}

export { db, ref, set, get, push, onValue, update };

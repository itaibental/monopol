// ═══════════════════════════════════════════════
// FIREBASE CONFIG
// ═══════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyCuo4N-w-5JFu2pLwmNmPrnuB56q0-9Ikc",
  authDomain: "pedagogical-tools.firebaseapp.com",
  databaseURL: "https://pedagogical-tools-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pedagogical-tools",
  storageBucket: "pedagogical-tools.firebasestorage.app",
  messagingSenderId: "439078826304",
  appId: "1:439078826304:web:66b01e7e2c19ac9c7a4aa5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ═══════════════════════════════════════════════
// DB HELPERS
// ═══════════════════════════════════════════════
const DB = {
  // --- Concepts / Questions ---
  async loadConcepts() {
    const snap = await db.ref('concepts').once('value');
    return snap.val();
  },

  async saveConcepts(concepts) {
    await db.ref('concepts').set(concepts);
  },

  async saveConceptQuiz(conceptId, quiz) {
    await db.ref(`concepts/${conceptId}/quiz`).set(quiz);
  },

  async initConceptsIfEmpty(defaultConcepts) {
    const snap = await db.ref('concepts').once('value');
    if (!snap.exists()) {
      const mapped = {};
      defaultConcepts.forEach((c, i) => { mapped[c.id] = c; });
      await db.ref('concepts').set(mapped);
      return defaultConcepts;
    }
    // Return as array
    const val = snap.val();
    return Object.values(val);
  },

  // --- Groups / Players ---
  async registerGroup(groupName, mode) {
    const ref = db.ref('groups/' + groupName);
    const snap = await ref.once('value');
    if (snap.exists()) {
      // Update lastSeen
      await ref.update({ lastSeen: Date.now() });
      return snap.val();
    }
    const data = {
      name: groupName,
      mode: mode, // 'solo' or 'group'
      score: 0,
      pos: 0,
      visited: [],
      conceptScores: {},
      createdAt: Date.now(),
      lastSeen: Date.now()
    };
    await ref.set(data);
    return data;
  },

  async updateGroupProgress(groupName, updates) {
    await db.ref('groups/' + groupName).update({
      ...updates,
      lastSeen: Date.now()
    });
  },

  async getGroupData(groupName) {
    const snap = await db.ref('groups/' + groupName).once('value');
    return snap.val();
  },

  // --- Leaderboard ---
  async getLeaderboard(limit = 20) {
    const snap = await db.ref('groups')
      .orderByChild('score')
      .limitToLast(limit)
      .once('value');
    const groups = [];
    snap.forEach(child => {
      groups.push(child.val());
    });
    return groups.reverse(); // highest first
  },

  onLeaderboardChange(callback, limit = 20) {
    db.ref('groups')
      .orderByChild('score')
      .limitToLast(limit)
      .on('value', snap => {
        const groups = [];
        snap.forEach(child => {
          groups.push(child.val());
        });
        callback(groups.reverse());
      });
  },

  // --- Admin ---
  async verifyAdmin(password) {
    const snap = await db.ref('admin/password').once('value');
    if (!snap.exists()) {
      // First time — set default password
      await db.ref('admin/password').set('ibt1234');
      return password === 'ibt1234';
    }
    return snap.val() === password;
  },

  async changeAdminPassword(newPassword) {
    await db.ref('admin/password').set(newPassword);
  }
};

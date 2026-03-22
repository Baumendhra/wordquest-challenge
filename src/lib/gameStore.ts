import { GameConfig, Player, LeaderboardEntry } from './types';

const KEYS = {
  CONFIG: 'wordle_config',
  PLAYERS: 'wordle_players',
  ADMIN_PASS: 'wordle_admin_pass',
};

const DEFAULT_WORDS = [
  'BYTES', 'CLOUD', 'DEBUG', 'FLASH', 'GLEAM',
  'HACKS', 'INDEX', 'JUMBO', 'KIOSK', 'LOGIC',
  'MACRO', 'NEXUS', 'OXIDE', 'PIXEL', 'QUERY',
  'REACT', 'STACK', 'TOKEN', 'UNITY', 'VAULT',
  'WHILE', 'XENON', 'YIELD', 'ZEROS', 'ALPHA',
  'BLITZ', 'CRYPT', 'DELTA', 'EPOCH', 'FRAME',
];

const DEFAULT_CONFIG: GameConfig = {
  wordsPerGame: 3,
  continueAfterFailure: false,
  activeWords: ['REACT', 'STACK', 'CLOUD'],
  allWords: DEFAULT_WORDS,
  sessionActive: true,
  timerEnabled: false,
  timerDuration: 300,
};

export function getConfig(): GameConfig {
  const raw = localStorage.getItem(KEYS.CONFIG);
  if (!raw) {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    return DEFAULT_CONFIG;
  }
  return JSON.parse(raw);
}

export function saveConfig(config: GameConfig) {
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
}

export function getPlayers(): Player[] {
  const raw = localStorage.getItem(KEYS.PLAYERS);
  return raw ? JSON.parse(raw) : [];
}

export function savePlayers(players: Player[]) {
  localStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
}

export function getPlayer(batchNo: string): Player | undefined {
  return getPlayers().find(p => p.batchNo === batchNo);
}

export function savePlayer(player: Player) {
  const players = getPlayers();
  const idx = players.findIndex(p => p.batchNo === player.batchNo);
  if (idx >= 0) players[idx] = player;
  else players.push(player);
  savePlayers(players);
}

export function playerExists(batchNo: string): boolean {
  return getPlayers().some(p => p.batchNo === batchNo);
}

export function resetSession() {
  savePlayers([]);
}

export function getLeaderboard(): LeaderboardEntry[] {
  const players = getPlayers().filter(p => p.gameCompleted);
  const config = getConfig();
  
  return players
    .map(p => {
      const wordsSolved = p.wordResults.filter(r => r.solved).length;
      const totalAttempts = p.wordResults.reduce((sum, r) => sum + r.attempts.length, 0);
      return {
        batchNo: p.batchNo,
        name: p.name,
        wordsSolved,
        totalWords: config.activeWords.length,
        totalAttempts,
        totalTime: p.totalTime,
        allSolved: wordsSolved === config.activeWords.length,
      };
    })
    .sort((a, b) => {
      if (b.wordsSolved !== a.wordsSolved) return b.wordsSolved - a.wordsSolved;
      if (a.totalAttempts !== b.totalAttempts) return a.totalAttempts - b.totalAttempts;
      return a.totalTime - b.totalTime;
    });
}

export function validateAdmin(password: string): boolean {
  return password === 'hackathon2026';
}

export function exportCSV(): string {
  const entries = getLeaderboard();
  const header = 'Rank,BatchNo,Name,WordsSolved,TotalAttempts,TotalTime(s),AllSolved\n';
  const rows = entries.map((e, i) =>
    `${i + 1},${e.batchNo},${e.name},${e.wordsSolved},${e.totalAttempts},${(e.totalTime / 1000).toFixed(1)},${e.allSolved}`
  ).join('\n');
  return header + rows;
}

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface LetterGuess {
  letter: string;
  status: LetterStatus;
}

export interface WordAttempt {
  word: string;
  guesses: LetterGuess[];
}

export interface WordResult {
  targetWord: string;
  attempts: WordAttempt[];
  solved: boolean;
  timeTaken: number; // ms
}

export interface Player {
  batchNo: string;
  name: string;
  wordResults: WordResult[];
  totalTime: number;
  startedAt: number;
  completedAt?: number;
  gameCompleted: boolean;
}

export interface GameConfig {
  wordsPerGame: number;
  continueAfterFailure: boolean;
  activeWords: string[];
  allWords: string[];
  sessionActive: boolean;
  timerEnabled: boolean;
  timerDuration: number; // seconds, 0 = no limit
}

export interface LeaderboardEntry {
  batchNo: string;
  name: string;
  wordsSolved: number;
  totalWords: number;
  totalAttempts: number;
  totalTime: number;
  allSolved: boolean;
}

import { LetterGuess, LetterStatus } from './types';

export function evaluateGuess(guess: string, target: string): LetterGuess[] {
  const result: LetterGuess[] = Array(5).fill(null).map((_, i) => ({
    letter: guess[i],
    status: 'absent' as LetterStatus,
  }));

  const targetArr = target.split('');
  const used = Array(5).fill(false);

  // First pass: correct positions
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      result[i].status = 'correct';
      used[i] = true;
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < 5; i++) {
    if (result[i].status === 'correct') continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guess[i] === targetArr[j]) {
        result[i].status = 'present';
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

export function isValidWord(word: string): boolean {
  return /^[A-Z]{5}$/.test(word);
}

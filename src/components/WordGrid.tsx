import React from 'react';
import { WordAttempt, LetterGuess } from '@/lib/types';

interface WordGridProps {
  attempts: WordAttempt[];
  currentGuess: string;
  maxAttempts: number;
  shakeCurrentRow: boolean;
}

const WordGrid: React.FC<WordGridProps> = ({ attempts, currentGuess, maxAttempts, shakeCurrentRow }) => {
  const rows: React.ReactNode[] = [];

  for (let i = 0; i < maxAttempts; i++) {
    if (i < attempts.length) {
      // Completed row
      rows.push(
        <div key={i} className="flex gap-1.5 justify-center">
          {attempts[i].guesses.map((g, j) => (
            <Tile key={j} letter={g.letter} status={g.status} delay={j * 0.15} />
          ))}
        </div>
      );
    } else if (i === attempts.length) {
      // Current input row
      rows.push(
        <div key={i} className={`flex gap-1.5 justify-center ${shakeCurrentRow ? 'animate-shake' : ''}`}>
          {Array(5).fill(null).map((_, j) => (
            <Tile
              key={j}
              letter={currentGuess[j] || ''}
              status="empty"
              pop={j === currentGuess.length - 1 && currentGuess.length > 0}
            />
          ))}
        </div>
      );
    } else {
      // Empty row
      rows.push(
        <div key={i} className="flex gap-1.5 justify-center">
          {Array(5).fill(null).map((_, j) => (
            <Tile key={j} letter="" status="empty" />
          ))}
        </div>
      );
    }
  }

  return <div className="flex flex-col gap-1.5">{rows}</div>;
};

interface TileProps {
  letter: string;
  status: LetterGuess['status'];
  delay?: number;
  pop?: boolean;
}

const statusClasses: Record<string, string> = {
  correct: 'bg-wordle-correct border-wordle-correct text-primary-foreground',
  present: 'bg-wordle-present border-wordle-present text-primary-foreground',
  absent: 'bg-wordle-absent border-wordle-absent text-foreground',
  empty: 'bg-wordle-empty border-wordle-border',
};

const Tile: React.FC<TileProps> = ({ letter, status, delay = 0, pop }) => {
  return (
    <div
      className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-2 rounded-md font-mono text-2xl font-bold uppercase transition-all ${statusClasses[status]} ${
        status !== 'empty' && delay > 0 ? 'animate-flip' : ''
      } ${pop ? 'animate-pop' : ''}`}
      style={delay > 0 ? { animationDelay: `${delay}s` } : undefined}
    >
      {letter}
    </div>
  );
};

export default WordGrid;

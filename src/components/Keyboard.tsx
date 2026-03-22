import React from 'react';
import { LetterStatus } from '@/lib/types';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

interface KeyboardProps {
  onKey: (key: string) => void;
  usedLetters: Record<string, LetterStatus>;
}

const statusClasses: Record<string, string> = {
  correct: 'bg-wordle-correct text-primary-foreground',
  present: 'bg-wordle-present text-primary-foreground',
  absent: 'bg-wordle-absent text-muted-foreground',
};

const Keyboard: React.FC<KeyboardProps> = ({ onKey, usedLetters }) => {
  return (
    <div className="flex flex-col gap-1.5 items-center">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map(key => {
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            const status = usedLetters[key];
            const bg = status ? statusClasses[status] : 'bg-secondary text-secondary-foreground';

            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                className={`${bg} ${
                  isWide ? 'px-3 text-xs' : 'w-8 sm:w-10'
                } h-12 sm:h-14 rounded-md font-mono font-bold text-sm flex items-center justify-center transition-colors active:scale-95`}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;

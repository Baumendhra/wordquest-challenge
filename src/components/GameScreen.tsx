import React, { useState, useEffect, useCallback } from 'react';
import { evaluateGuess, isValidWord } from '@/lib/wordleLogic';
import { LetterGuess, WordAttempt, WordResult } from '@/lib/types';
import WordGrid from './WordGrid';
import Keyboard from './Keyboard';
import { playCorrectSound, playWrongSound, playGameCompleteSound, playInvalidSound, playKeySound } from '@/lib/sounds';

interface GameScreenProps {
  words: string[];
  continueAfterFailure: boolean;
  timerEnabled: boolean;
  timerDuration: number;
  onGameComplete: (results: WordResult[], totalTime: number) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  words,
  continueAfterFailure,
  timerEnabled,
  timerDuration,
  onGameComplete,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
  const [attempts, setAttempts] = useState<WordAttempt[]>([]);
  const [results, setResults] = useState<WordResult[]>([]);
  const [shakeRow, setShakeRow] = useState(false);
  const [gameStartTime] = useState(Date.now());
  const [wordStartTime, setWordStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [usedLetters, setUsedLetters] = useState<Record<string, LetterGuess['status']>>({});
  const [message, setMessage] = useState('');

  const currentWord = words[currentWordIndex];
  const maxAttempts = 6;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - gameStartTime);
    }, 100);
    return () => clearInterval(interval);
  }, [gameStartTime]);

  // Check timer expiry
  useEffect(() => {
    if (timerEnabled && timerDuration > 0) {
      const remaining = timerDuration * 1000 - elapsed;
      if (remaining <= 0) {
        // Time's up - complete game
        const finalResults = [...results];
        // Add current unfinished word
        if (currentWordIndex < words.length) {
          finalResults.push({
            targetWord: currentWord,
            attempts,
            solved: false,
            timeTaken: Date.now() - wordStartTime,
          });
        }
        onGameComplete(finalResults, Date.now() - gameStartTime);
      }
    }
  }, [elapsed, timerEnabled, timerDuration]);

  const moveToNextWord = useCallback((newResults: WordResult[]) => {
    const nextIdx = currentWordIndex + 1;
    if (nextIdx >= words.length) {
      onGameComplete(newResults, Date.now() - gameStartTime);
    } else {
      setCurrentWordIndex(nextIdx);
      setAttempts([]);
      setCurrentGuess('');
      setUsedLetters({});
      setWordStartTime(Date.now());
    }
  }, [currentWordIndex, words.length, gameStartTime, onGameComplete]);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5) return;
    
    if (!isValidWord(currentGuess)) {
      setShakeRow(true);
      setMessage('Invalid word');
      playInvalidSound();
      setTimeout(() => { setShakeRow(false); setMessage(''); }, 600);
      return;
    }

    const evaluation = evaluateGuess(currentGuess, currentWord);
    const newAttempt: WordAttempt = { word: currentGuess, guesses: evaluation };
    const newAttempts = [...attempts, newAttempt];
    setAttempts(newAttempts);
    setCurrentGuess('');

    // Update used letters
    const newUsed = { ...usedLetters };
    evaluation.forEach(g => {
      const existing = newUsed[g.letter];
      if (g.status === 'correct') newUsed[g.letter] = 'correct';
      else if (g.status === 'present' && existing !== 'correct') newUsed[g.letter] = 'present';
      else if (!existing) newUsed[g.letter] = g.status;
    });
    setUsedLetters(newUsed);

    const solved = currentGuess === currentWord;
    
    if (solved) {
      setMessage('🎉 Correct!');
      const result: WordResult = {
        targetWord: currentWord,
        attempts: newAttempts,
        solved: true,
        timeTaken: Date.now() - wordStartTime,
      };
      const newResults = [...results, result];
      setResults(newResults);
      setTimeout(() => {
        setMessage('');
        moveToNextWord(newResults);
      }, 1200);
    } else if (newAttempts.length >= maxAttempts) {
      setMessage(`The word was: ${currentWord}`);
      const result: WordResult = {
        targetWord: currentWord,
        attempts: newAttempts,
        solved: false,
        timeTaken: Date.now() - wordStartTime,
      };
      const newResults = [...results, result];
      setResults(newResults);

      if (continueAfterFailure) {
        setTimeout(() => {
          setMessage('');
          moveToNextWord(newResults);
        }, 2000);
      } else {
        setTimeout(() => {
          onGameComplete(newResults, Date.now() - gameStartTime);
        }, 2000);
      }
    }
  }, [currentGuess, currentWord, attempts, usedLetters, results, wordStartTime, continueAfterFailure, moveToNextWord, gameStartTime, onGameComplete]);

  const handleKey = useCallback((key: string) => {
    if (message) return;
    
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  }, [submitGuess, currentGuess, message]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER') handleKey('ENTER');
      else if (key === 'BACKSPACE') handleKey('BACKSPACE');
      else if (/^[A-Z]$/.test(key)) handleKey(key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const remaining = timerEnabled && timerDuration > 0
    ? Math.max(0, timerDuration * 1000 - elapsed)
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center pt-4 pb-2 px-2">
      {/* Header */}
      <div className="w-full max-w-lg mb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-mono font-bold text-primary">
            HACK<span className="text-accent">WORDLE</span>
          </h1>
          <div className="text-sm font-mono text-muted-foreground">
            {remaining !== null ? (
              <span className={remaining < 30000 ? 'text-destructive font-bold' : ''}>
                ⏱ {formatTime(remaining)}
              </span>
            ) : (
              <span>⏱ {formatTime(elapsed)}</span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground font-medium">
            Word {currentWordIndex + 1} of {words.length}
          </span>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((currentWordIndex) / words.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-2 px-4 py-1.5 bg-card border border-border rounded-lg text-sm font-mono font-semibold text-foreground animate-bounce-in">
          {message}
        </div>
      )}

      {/* Grid */}
      <WordGrid
        attempts={attempts}
        currentGuess={currentGuess}
        maxAttempts={maxAttempts}
        shakeCurrentRow={shakeRow}
      />

      {/* Keyboard */}
      <div className="mt-auto pt-2 w-full max-w-lg">
        <Keyboard onKey={handleKey} usedLetters={usedLetters} />
      </div>
    </div>
  );
};

export default GameScreen;

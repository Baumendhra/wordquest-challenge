import React from 'react';
import { Button } from '@/components/ui/button';
import { WordResult } from '@/lib/types';

interface ResultScreenProps {
  playerName: string;
  results: WordResult[];
  totalTime: number;
  onViewLeaderboard: () => void;
  onNextPlayer: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  playerName,
  results,
  totalTime,
  onViewLeaderboard,
  onNextPlayer,
}) => {
  const solved = results.filter(r => r.solved).length;
  const totalAttempts = results.reduce((s, r) => s + r.attempts.length, 0);
  const allSolved = solved === results.length;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-bounce-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{allSolved ? '🏆' : '⭐'}</div>
          <h1 className="text-2xl font-mono font-bold text-foreground mb-1">
            {allSolved ? 'Perfect Score!' : 'Game Over'}
          </h1>
          <p className="text-muted-foreground text-sm">Great effort, {playerName}!</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-5 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center mb-5">
            <div>
              <div className="text-2xl font-mono font-bold text-primary">{solved}/{results.length}</div>
              <div className="text-xs text-muted-foreground">Words Solved</div>
            </div>
            <div>
              <div className="text-2xl font-mono font-bold text-accent">{totalAttempts}</div>
              <div className="text-xs text-muted-foreground">Total Attempts</div>
            </div>
            <div>
              <div className="text-2xl font-mono font-bold text-foreground">{formatTime(totalTime)}</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </div>

          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary rounded-md px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${r.solved ? 'text-primary' : 'text-destructive'}`}>
                    {r.solved ? '✓' : '✗'}
                  </span>
                  <span className="font-mono text-sm text-foreground">{r.targetWord}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {r.attempts.length} attempt{r.attempts.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onViewLeaderboard} variant="outline" className="flex-1 font-mono">
            Leaderboard
          </Button>
          <Button onClick={onNextPlayer} className="flex-1 font-mono font-bold">
            Next Player →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;

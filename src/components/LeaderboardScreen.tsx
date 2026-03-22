import React from 'react';
import { getLeaderboard } from '@/lib/gameStore';
import { Button } from '@/components/ui/button';

interface LeaderboardScreenProps {
  onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const entries = getLeaderboard();

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-mono font-bold text-primary">
          🏆 Leaderboard
        </h1>
        <Button onClick={onBack} variant="outline" size="sm" className="font-mono">
          ← Back
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No completed games yet.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e, i) => (
            <div
              key={e.batchNo}
              className={`flex items-center gap-3 p-3 rounded-lg border animate-slide-up ${
                e.allSolved
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-card border-border'
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                i === 0 ? 'bg-accent text-accent-foreground' :
                i === 1 ? 'bg-muted-foreground/30 text-foreground' :
                i === 2 ? 'bg-accent/40 text-accent-foreground' :
                'bg-secondary text-secondary-foreground'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{e.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{e.batchNo}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-primary">
                  {e.wordsSolved}/{e.totalWords}
                </div>
                <div className="text-xs text-muted-foreground">
                  {e.totalAttempts} tries · {formatTime(e.totalTime)}
                </div>
              </div>
              {e.allSolved && <span className="text-lg">🏆</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardScreen;

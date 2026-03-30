import React, { useState, useEffect, useCallback } from 'react';
import { getLeaderboard } from '@/lib/gameStore';
import { LeaderboardEntry } from '@/lib/types';

const LiveLeaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refresh = useCallback(async () => {
    const data = await getLeaderboard();
    setEntries(data);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const getRankStyle = (i: number) => {
    if (i === 0) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
    if (i === 1) return 'bg-gray-400/20 border-gray-400/50 text-gray-200';
    if (i === 2) return 'bg-amber-700/20 border-amber-700/50 text-amber-200';
    return 'bg-card/50 border-border';
  };

  const getRankIcon = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `${i + 1}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-mono font-black text-primary tracking-tight">
          🏆 LIVE LEADERBOARD
        </h1>
        <div className="mt-2 text-sm text-muted-foreground font-mono animate-pulse">
          Auto-refreshing · Last updated {lastUpdated.toLocaleTimeString()}
        </div>
        <div className="mt-1 text-xs text-muted-foreground font-mono">
          {entries.length} player{entries.length !== 1 ? 's' : ''} completed
        </div>
      </div>

      {/* Leaderboard */}
      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <div className="text-2xl text-muted-foreground font-mono">
              Waiting for players...
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            {entries.map((e, i) => (
              <div
                key={e.batchNo}
                className={`flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 transition-all duration-500 ${getRankStyle(i)}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Rank */}
                <div className="text-3xl md:text-4xl w-14 text-center font-mono font-black shrink-0">
                  {getRankIcon(i)}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg md:text-2xl truncate">
                    {e.name}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {e.batchNo}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <div className="font-mono text-xl md:text-3xl font-black text-primary">
                    {e.wordsSolved}/{e.totalWords}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground font-mono">
                    {e.totalAttempts} tries · {formatTime(e.totalTime)}
                  </div>
                </div>

                {e.allSolved && (
                  <div className="text-2xl md:text-3xl shrink-0 animate-bounce">🏆</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-muted-foreground font-mono">
        Press ESC or navigate away to exit · Powered by Lovable Cloud
      </div>
    </div>
  );
};

export default LiveLeaderboard;

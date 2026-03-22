import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getConfig, saveConfig, getPlayers, resetSession, getLeaderboard, exportCSV } from '@/lib/gameStore';
import { GameConfig, Player, LeaderboardEntry } from '@/lib/types';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [newWord, setNewWord] = useState('');
  const [tab, setTab] = useState<'config' | 'words' | 'players' | 'leaderboard'>('config');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [cfg, pl, lb] = await Promise.all([getConfig(), getPlayers(), getLeaderboard()]);
    setConfig(cfg);
    setPlayers(pl);
    setLeaderboard(lb);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const updateConfig = async (partial: Partial<GameConfig>) => {
    if (!config) return;
    const updated = { ...config, ...partial };
    setConfig(updated);
    await saveConfig(updated);
    showMsg('Config saved!');
  };

  const addWord = () => {
    if (!config) return;
    const w = newWord.toUpperCase().trim();
    if (w.length !== 5 || !/^[A-Z]+$/.test(w)) {
      showMsg('Word must be exactly 5 letters');
      return;
    }
    if (config.allWords.includes(w)) {
      showMsg('Word already exists');
      return;
    }
    updateConfig({ allWords: [...config.allWords, w] });
    setNewWord('');
  };

  const removeWord = (word: string) => {
    if (!config) return;
    updateConfig({
      allWords: config.allWords.filter(w => w !== word),
      activeWords: config.activeWords.filter(w => w !== word),
    });
  };

  const toggleActiveWord = (word: string) => {
    if (!config) return;
    const active = config.activeWords.includes(word)
      ? config.activeWords.filter(w => w !== word)
      : [...config.activeWords, word];
    updateConfig({ activeWords: active, wordsPerGame: active.length });
  };

  const handleExport = async () => {
    const csv = await exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hackwordle_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    if (confirm('Reset all session data? This cannot be undone.')) {
      await resetSession();
      await loadData();
      showMsg('Session reset!');
    }
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'config' as const, label: '⚙️ Config' },
    { id: 'words' as const, label: '📝 Words' },
    { id: 'players' as const, label: '👥 Players' },
    { id: 'leaderboard' as const, label: '🏆 Rankings' },
  ];

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-mono font-bold text-primary">Admin Dashboard</h1>
        <Button onClick={onBack} variant="outline" size="sm" className="font-mono">← Exit</Button>
      </div>

      {message && (
        <div className="mb-3 px-3 py-2 bg-primary/20 border border-primary/30 rounded-md text-sm font-mono text-primary animate-bounce-in">
          {message}
        </div>
      )}

      <div className="flex gap-1 mb-4 bg-secondary rounded-lg p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id === 'players' || t.id === 'leaderboard') loadData(); }}
            className={`flex-1 py-2 px-3 text-xs font-mono font-medium rounded-md transition-colors ${
              tab === t.id ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'config' && (
        <div className="bg-card rounded-lg border border-border p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Words per Game</label>
            <div className="text-xs text-muted-foreground mb-1">Set by selecting active words</div>
            <div className="font-mono text-lg text-primary font-bold">{config.activeWords.length}</div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Continue After Failure</div>
              <div className="text-xs text-muted-foreground">Let players continue even if they fail a word</div>
            </div>
            <button
              onClick={() => updateConfig({ continueAfterFailure: !config.continueAfterFailure })}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.continueAfterFailure ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <div className={`w-5 h-5 bg-foreground rounded-full transition-transform mx-0.5 ${
                config.continueAfterFailure ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Timer Enabled</div>
              <div className="text-xs text-muted-foreground">Countdown timer for the entire game</div>
            </div>
            <button
              onClick={() => updateConfig({ timerEnabled: !config.timerEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.timerEnabled ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <div className={`w-5 h-5 bg-foreground rounded-full transition-transform mx-0.5 ${
                config.timerEnabled ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          {config.timerEnabled && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Timer Duration (seconds)</label>
              <Input
                type="number"
                value={config.timerDuration}
                onChange={e => updateConfig({ timerDuration: parseInt(e.target.value) || 300 })}
                className="bg-secondary border-border font-mono w-32"
              />
            </div>
          )}

          <div className="pt-3 border-t border-border flex gap-3">
            <Button onClick={handleExport} variant="outline" className="font-mono text-xs">
              📥 Export CSV
            </Button>
            <Button onClick={handleReset} variant="destructive" className="font-mono text-xs">
              🗑 Reset Session
            </Button>
          </div>
        </div>
      )}

      {tab === 'words' && (
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex gap-2 mb-4">
            <Input
              value={newWord}
              onChange={e => setNewWord(e.target.value.toUpperCase())}
              placeholder="ENTER 5-LETTER WORD"
              maxLength={5}
              className="bg-secondary border-border font-mono uppercase flex-1"
            />
            <Button onClick={addWord} className="font-mono">Add</Button>
          </div>

          <div className="text-xs text-muted-foreground mb-2">
            Click to toggle active (green = active in current game)
          </div>

          <div className="flex flex-wrap gap-2">
            {config.allWords.map(word => {
              const isActive = config.activeWords.includes(word);
              return (
                <div key={word} className="flex items-center gap-0.5">
                  <button
                    onClick={() => toggleActiveWord(word)}
                    className={`px-3 py-1.5 rounded-md font-mono text-sm font-bold transition-colors ${
                      isActive
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-secondary text-secondary-foreground border border-border'
                    }`}
                  >
                    {word}
                  </button>
                  <button
                    onClick={() => removeWord(word)}
                    className="text-xs text-muted-foreground hover:text-destructive px-1"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'players' && (
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="text-sm text-muted-foreground mb-3">{players.length} player(s)</div>
          {players.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No players yet</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {players.map(p => (
                <div key={p.batchNo} className="flex items-center justify-between bg-secondary rounded-md px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.batchNo}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{p.wordResults.filter(r => r.solved).length} solved</div>
                    <div>{p.gameCompleted ? '✓ done' : '⏳ playing'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="bg-card rounded-lg border border-border p-5">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No completed games</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((e, i) => (
                <div key={e.batchNo} className={`flex items-center gap-3 p-3 rounded-md ${
                  e.allSolved ? 'bg-primary/10 border border-primary/30' : 'bg-secondary'
                }`}>
                  <span className="font-mono font-bold text-sm text-muted-foreground w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{e.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{e.batchNo}</div>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <div className="text-primary font-bold">{e.wordsSolved}/{e.totalWords} words</div>
                    <div className="text-muted-foreground">{e.totalAttempts} tries · {formatTime(e.totalTime)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

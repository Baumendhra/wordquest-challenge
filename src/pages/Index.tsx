import React, { useState, useEffect } from 'react';
import LoginScreen from '@/components/LoginScreen';
import GameScreen from '@/components/GameScreen';
import ResultScreen from '@/components/ResultScreen';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import { getConfig, savePlayer } from '@/lib/gameStore';
import { Player, WordResult, GameConfig } from '@/lib/types';

type Screen = 'login' | 'game' | 'result' | 'leaderboard' | 'adminLogin' | 'admin';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('login');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [config, setConfig] = useState<GameConfig | null>(null);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  const handleLogin = async (batchNo: string, name: string) => {
    const cfg = await getConfig();
    if (!cfg.sessionActive || cfg.activeWords.length === 0) {
      alert('No active game session. Contact the admin.');
      return;
    }
    const player: Player = {
      batchNo,
      name,
      wordResults: [],
      totalTime: 0,
      startedAt: Date.now(),
      gameCompleted: false,
    };
    await savePlayer(player);
    setCurrentPlayer(player);
    setConfig(cfg);
    setScreen('game');
  };

  const handleGameComplete = async (results: WordResult[], totalTime: number) => {
    if (!currentPlayer) return;
    const updated: Player = {
      ...currentPlayer,
      wordResults: results,
      totalTime,
      completedAt: Date.now(),
      gameCompleted: true,
    };
    await savePlayer(updated);
    setCurrentPlayer(updated);
    setScreen('result');
  };

  const handleNextPlayer = () => {
    setCurrentPlayer(null);
    setScreen('login');
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {screen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onAdminLogin={() => setScreen('adminLogin')}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          words={config.activeWords}
          continueAfterFailure={config.continueAfterFailure}
          timerEnabled={config.timerEnabled}
          timerDuration={config.timerDuration}
          onGameComplete={handleGameComplete}
        />
      )}
      {screen === 'result' && currentPlayer && (
        <ResultScreen
          playerName={currentPlayer.name}
          results={currentPlayer.wordResults}
          totalTime={currentPlayer.totalTime}
          onViewLeaderboard={() => setScreen('leaderboard')}
          onNextPlayer={handleNextPlayer}
        />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen onBack={() => currentPlayer ? setScreen('result') : setScreen('login')} />
      )}
      {screen === 'adminLogin' && (
        <AdminLogin
          onSuccess={() => setScreen('admin')}
          onBack={() => setScreen('login')}
        />
      )}
      {screen === 'admin' && (
        <AdminDashboard onBack={() => { getConfig().then(setConfig); setScreen('login'); }} />
      )}
    </>
  );
};

export default Index;

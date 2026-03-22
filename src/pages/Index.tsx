import React, { useState } from 'react';
import LoginScreen from '@/components/LoginScreen';
import GameScreen from '@/components/GameScreen';
import ResultScreen from '@/components/ResultScreen';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import { getConfig, savePlayer } from '@/lib/gameStore';
import { Player, WordResult } from '@/lib/types';

type Screen = 'login' | 'game' | 'result' | 'leaderboard' | 'adminLogin' | 'admin';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('login');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const handleLogin = (batchNo: string, name: string) => {
    const config = getConfig();
    if (!config.sessionActive || config.activeWords.length === 0) {
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
    savePlayer(player);
    setCurrentPlayer(player);
    setScreen('game');
  };

  const handleGameComplete = (results: WordResult[], totalTime: number) => {
    if (!currentPlayer) return;
    const updated: Player = {
      ...currentPlayer,
      wordResults: results,
      totalTime,
      completedAt: Date.now(),
      gameCompleted: true,
    };
    savePlayer(updated);
    setCurrentPlayer(updated);
    setScreen('result');
  };

  const handleNextPlayer = () => {
    setCurrentPlayer(null);
    setScreen('login');
  };

  const config = getConfig();

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
        <AdminDashboard onBack={() => setScreen('login')} />
      )}
    </>
  );
};

export default Index;

import { supabase } from '@/integrations/supabase/client';
import { GameConfig, Player, LeaderboardEntry, WordResult } from './types';

const DEFAULT_CONFIG: GameConfig = {
  wordsPerGame: 3,
  continueAfterFailure: false,
  activeWords: ['REACT', 'STACK', 'CLOUD'],
  allWords: [
    'BYTES', 'CLOUD', 'DEBUG', 'FLASH', 'GLEAM',
    'HACKS', 'INDEX', 'JUMBO', 'KIOSK', 'LOGIC',
    'MACRO', 'NEXUS', 'OXIDE', 'PIXEL', 'QUERY',
    'REACT', 'STACK', 'TOKEN', 'UNITY', 'VAULT',
    'WHILE', 'XENON', 'YIELD', 'ZEROS', 'ALPHA',
    'BLITZ', 'CRYPT', 'DELTA', 'EPOCH', 'FRAME',
  ],
  sessionActive: true,
  timerEnabled: false,
  timerDuration: 300,
};

export async function getConfig(): Promise<GameConfig> {
  const { data, error } = await supabase
    .from('game_config')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) return DEFAULT_CONFIG;

  return {
    wordsPerGame: data.words_per_game,
    continueAfterFailure: data.continue_after_failure,
    activeWords: data.active_words,
    allWords: data.all_words,
    sessionActive: data.session_active,
    timerEnabled: data.timer_enabled,
    timerDuration: data.timer_duration,
  };
}

export async function saveConfig(config: GameConfig): Promise<void> {
  const { data: existing } = await supabase
    .from('game_config')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    await supabase
      .from('game_config')
      .update({
        words_per_game: config.wordsPerGame,
        continue_after_failure: config.continueAfterFailure,
        active_words: config.activeWords,
        all_words: config.allWords,
        session_active: config.sessionActive,
        timer_enabled: config.timerEnabled,
        timer_duration: config.timerDuration,
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('game_config')
      .insert({
        words_per_game: config.wordsPerGame,
        continue_after_failure: config.continueAfterFailure,
        active_words: config.activeWords,
        all_words: config.allWords,
        session_active: config.sessionActive,
        timer_enabled: config.timerEnabled,
        timer_duration: config.timerDuration,
      });
  }
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*');

  if (error || !data) return [];

  return data.map(p => ({
    batchNo: p.batch_no,
    name: p.name,
    wordResults: (p.word_results as unknown as WordResult[]) || [],
    totalTime: p.total_time,
    startedAt: p.started_at,
    completedAt: p.completed_at ?? undefined,
    gameCompleted: p.game_completed,
  }));
}

export async function savePlayer(player: Player): Promise<void> {
  const { data: existing } = await supabase
    .from('players')
    .select('id')
    .eq('batch_no', player.batchNo)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('players')
      .update({
        name: player.name,
        word_results: JSON.parse(JSON.stringify(player.wordResults)),
        total_time: player.totalTime,
        started_at: player.startedAt,
        completed_at: player.completedAt ?? null,
        game_completed: player.gameCompleted,
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('players')
      .insert({
        batch_no: player.batchNo,
        name: player.name,
        word_results: JSON.parse(JSON.stringify(player.wordResults)),
        total_time: player.totalTime,
        started_at: player.startedAt,
        completed_at: player.completedAt ?? null,
        game_completed: player.gameCompleted,
      });
  }
}

export async function playerExists(batchNo: string): Promise<boolean> {
  const { data } = await supabase
    .from('players')
    .select('id')
    .eq('batch_no', batchNo)
    .maybeSingle();
  return !!data;
}

export async function resetSession(): Promise<void> {
  await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const [playersRes, configRes] = await Promise.all([
    supabase.from('players').select('*').eq('game_completed', true),
    getConfig(),
  ]);

  if (!playersRes.data) return [];

  return playersRes.data
    .map(p => {
      const wordResults = (p.word_results as unknown as WordResult[]) || [];
      const wordsSolved = wordResults.filter(r => r.solved).length;
      const totalAttempts = wordResults.reduce((sum, r) => sum + r.attempts.length, 0);
      return {
        batchNo: p.batch_no,
        name: p.name,
        wordsSolved,
        totalWords: configRes.activeWords.length,
        totalAttempts,
        totalTime: p.total_time,
        allSolved: wordsSolved === configRes.activeWords.length,
      };
    })
    .sort((a, b) => {
      if (b.wordsSolved !== a.wordsSolved) return b.wordsSolved - a.wordsSolved;
      if (a.totalAttempts !== b.totalAttempts) return a.totalAttempts - b.totalAttempts;
      return a.totalTime - b.totalTime;
    });
}

export function validateAdmin(password: string): boolean {
  return password === 'hackathon2026';
}

export async function exportCSV(): Promise<string> {
  const entries = await getLeaderboard();
  const header = 'Rank,BatchNo,Name,WordsSolved,TotalAttempts,TotalTime(s),AllSolved\n';
  const rows = entries.map((e, i) =>
    `${i + 1},${e.batchNo},${e.name},${e.wordsSolved},${e.totalAttempts},${(e.totalTime / 1000).toFixed(1)},${e.allSolved}`
  ).join('\n');
  return header + rows;
}


-- Create game_config table (single row for current config)
CREATE TABLE public.game_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  words_per_game INTEGER NOT NULL DEFAULT 3,
  continue_after_failure BOOLEAN NOT NULL DEFAULT false,
  active_words TEXT[] NOT NULL DEFAULT ARRAY['REACT', 'STACK', 'CLOUD'],
  all_words TEXT[] NOT NULL DEFAULT ARRAY['BYTES','CLOUD','DEBUG','FLASH','GLEAM','HACKS','INDEX','JUMBO','KIOSK','LOGIC','MACRO','NEXUS','OXIDE','PIXEL','QUERY','REACT','STACK','TOKEN','UNITY','VAULT','WHILE','XENON','YIELD','ZEROS','ALPHA','BLITZ','CRYPT','DELTA','EPOCH','FRAME'],
  session_active BOOLEAN NOT NULL DEFAULT true,
  timer_enabled BOOLEAN NOT NULL DEFAULT false,
  timer_duration INTEGER NOT NULL DEFAULT 300,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_no TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  word_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_time BIGINT NOT NULL DEFAULT 0,
  started_at BIGINT NOT NULL DEFAULT 0,
  completed_at BIGINT,
  game_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Game config: anyone can read/write (admin password checked client-side, kiosk app)
CREATE POLICY "Anyone can read game config" ON public.game_config FOR SELECT USING (true);
CREATE POLICY "Anyone can update game config" ON public.game_config FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert game config" ON public.game_config FOR INSERT WITH CHECK (true);

-- Players: anyone can read and write (no auth system, kiosk-style app)
CREATE POLICY "Anyone can read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can insert players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete players" ON public.players FOR DELETE USING (true);

-- Insert default config row
INSERT INTO public.game_config (words_per_game, continue_after_failure, active_words, all_words, session_active, timer_enabled, timer_duration)
VALUES (3, false, ARRAY['REACT','STACK','CLOUD'], ARRAY['BYTES','CLOUD','DEBUG','FLASH','GLEAM','HACKS','INDEX','JUMBO','KIOSK','LOGIC','MACRO','NEXUS','OXIDE','PIXEL','QUERY','REACT','STACK','TOKEN','UNITY','VAULT','WHILE','XENON','YIELD','ZEROS','ALPHA','BLITZ','CRYPT','DELTA','EPOCH','FRAME'], true, false, 300);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_game_config_updated_at BEFORE UPDATE ON public.game_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- March Madness Fantasy — Supabase Schema
-- Run this in the Supabase SQL Editor to bootstrap the DB
-- ============================================================

-- Profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament rounds (seeded by admin)
CREATE TABLE IF NOT EXISTS rounds (
  id SERIAL PRIMARY KEY,
  round_number INT NOT NULL,          -- 1=First Round … 5=Final Four
  label TEXT NOT NULL,                -- "Sweet 16"
  draft_opens_at TIMESTAMPTZ,
  games_start_at TIMESTAMPTZ,        -- roster lock time
  games_end_at TIMESTAMPTZ,
  status TEXT DEFAULT 'upcoming'      -- upcoming | drafting | live | complete
);

-- Seed rounds
INSERT INTO rounds (round_number, label, status, draft_opens_at, games_start_at, games_end_at)
VALUES
  (1, 'First Round',  'live',     NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',  NOW() + INTERVAL '1 day'),
  (2, 'Second Round', 'upcoming', NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', NOW() + INTERVAL '4 days'),
  (3, 'Sweet 16',     'upcoming', NOW() + INTERVAL '5 days', NOW() + INTERVAL '6 days', NOW() + INTERVAL '7 days'),
  (4, 'Elite Eight',  'upcoming', NOW() + INTERVAL '8 days', NOW() + INTERVAL '9 days', NOW() + INTERVAL '10 days'),
  (5, 'Final Four',   'upcoming', NOW() + INTERVAL '11 days', NOW() + INTERVAL '12 days', NOW() + INTERVAL '13 days')
ON CONFLICT DO NOTHING;

-- One roster per user per round
CREATE TABLE IF NOT EXISTS rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  round_id INT REFERENCES rounds(id) NOT NULL,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, round_id)
);

-- Players on each roster
CREATE TABLE IF NOT EXISTS roster_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roster_id UUID REFERENCES rosters(id) ON DELETE CASCADE NOT NULL,
  player_id TEXT NOT NULL,            -- matches mock/ESPN player ID
  position_slot TEXT NOT NULL,        -- G1 | G2 | F1 | F2 | C | G | F | FC | FLEX
  drafted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(roster_id, position_slot)
);

-- Fantasy points earned per player per game
CREATE TABLE IF NOT EXISTS player_game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  round_id INT REFERENCES rounds(id),
  base_points NUMERIC NOT NULL DEFAULT 0,
  round_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  total_points NUMERIC NOT NULL DEFAULT 0,
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, game_id)
);

-- Aggregated score per user per round
CREATE TABLE IF NOT EXISTS user_round_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  round_id INT REFERENCES rounds(id),
  round_score NUMERIC DEFAULT 0,
  cumulative_score NUMERIC DEFAULT 0,
  rank INT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, round_id)
);

-- Global leaderboard view
CREATE OR REPLACE VIEW global_leaderboard AS
  SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    urs.cumulative_score,
    urs.round_score,
    urs.rank,
    urs.updated_at
  FROM user_round_scores urs
  JOIN profiles p ON p.id = urs.user_id
  ORDER BY urs.cumulative_score DESC;

-- ============================================================
-- Row-Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_round_scores ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, write only their own
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Rosters: users can CRUD their own
CREATE POLICY "rosters_own" ON rosters USING (auth.uid() = user_id);

-- Roster players: users can CRUD their own (via roster join)
CREATE POLICY "roster_players_own" ON roster_players
  USING (
    roster_id IN (SELECT id FROM rosters WHERE user_id = auth.uid())
  );

-- User round scores: users can read all (for leaderboard), write only own
CREATE POLICY "urs_select_all" ON user_round_scores FOR SELECT USING (true);
CREATE POLICY "urs_write_own" ON user_round_scores FOR ALL USING (auth.uid() = user_id);

-- Player game scores: public read (computed by Edge Function with service key)
ALTER TABLE player_game_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pgs_select_all" ON player_game_scores FOR SELECT USING (true);

-- ============================================================
-- Trigger: upsert user_round_scores when player_game_scores changes
-- ============================================================

CREATE OR REPLACE FUNCTION update_user_round_scores()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Update round_score for all users who have this player in this round
  UPDATE user_round_scores urs
  SET
    round_score = (
      SELECT COALESCE(SUM(pgs.total_points), 0)
      FROM player_game_scores pgs
      JOIN roster_players rp ON rp.player_id = pgs.player_id
      JOIN rosters r ON r.id = rp.roster_id AND r.round_id = pgs.round_id
      WHERE r.user_id = urs.user_id AND pgs.round_id = NEW.round_id
    ),
    updated_at = NOW()
  WHERE urs.round_id = NEW.round_id;

  -- Recalculate cumulative scores
  UPDATE user_round_scores urs
  SET cumulative_score = (
    SELECT COALESCE(SUM(inner_urs.round_score), 0)
    FROM user_round_scores inner_urs
    WHERE inner_urs.user_id = urs.user_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_player_game_score_change
  AFTER INSERT OR UPDATE ON player_game_scores
  FOR EACH ROW EXECUTE FUNCTION update_user_round_scores();

-- ============================================================
-- Realtime: enable for live score updates
-- ============================================================
-- Run in Supabase Dashboard > Database > Replication:
-- Add player_game_scores and user_round_scores to realtime publication

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE target_type AS ENUM ('ACCOUNT', 'KEYWORD', 'LIST');
CREATE TYPE decay_phase AS ENUM ('GROWTH', 'PEAK', 'DECAY', 'FLATLINE');
CREATE TYPE alert_type AS ENUM ('REPLY_NOW', 'REVIVE_SIGNAL', 'WINDOW_CLOSING', 'AUTHOR_ACTIVE', 'VELOCITY_SPIKE');
CREATE TYPE alert_urgency AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM');
CREATE TYPE outcome_label AS ENUM ('RIGHT', 'SATURATED', 'BAD_FIT');

-- Users table (Supabase Auth integration)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  name TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_alerts_per_day INTEGER DEFAULT 10,
  min_predicted_impressions INTEGER DEFAULT 1000,
  time_window_start INTEGER DEFAULT 9,
  time_window_end INTEGER DEFAULT 21,
  preferred_reply_styles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Targets (accounts, keywords, lists to monitor)
CREATE TABLE targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type target_type NOT NULL,
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_targets_user_id ON targets(user_id);
CREATE INDEX idx_targets_type_value ON targets(type, value);

-- Candidate tweets
CREATE TABLE candidate_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tweet_id TEXT UNIQUE NOT NULL,
  author_id TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_followers INTEGER NOT NULL,
  author_image TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  is_thread BOOLEAN DEFAULT FALSE,
  thread_position INTEGER
);

CREATE INDEX idx_candidate_tweets_tweet_id ON candidate_tweets(tweet_id);
CREATE INDEX idx_candidate_tweets_author_id ON candidate_tweets(author_id);
CREATE INDEX idx_candidate_tweets_created_at ON candidate_tweets(created_at);

-- Scores
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_tweet_id UUID NOT NULL REFERENCES candidate_tweets(id) ON DELETE CASCADE,
  velocity_score DOUBLE PRECISION NOT NULL,
  velocity_raw JSONB NOT NULL,
  saturation_score DOUBLE PRECISION NOT NULL,
  saturation_raw JSONB NOT NULL,
  author_fatigue_score DOUBLE PRECISION NOT NULL,
  author_fatigue_raw JSONB NOT NULL,
  audience_overlap_score DOUBLE PRECISION NOT NULL,
  audience_overlap_raw JSONB NOT NULL,
  reply_fit_score DOUBLE PRECISION NOT NULL,
  reply_fit_raw JSONB NOT NULL,
  final_score DOUBLE PRECISION NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_candidate_tweet_id ON scores(candidate_tweet_id);
CREATE INDEX idx_scores_final_score ON scores(final_score);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_tweet_id UUID NOT NULL REFERENCES candidate_tweets(id) ON DELETE CASCADE,
  score DOUBLE PRECISION NOT NULL,
  reason TEXT NOT NULL,
  dismissed BOOLEAN DEFAULT FALSE,
  viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id_created_at ON alerts(user_id, created_at);
CREATE INDEX idx_alerts_candidate_tweet_id ON alerts(candidate_tweet_id);

-- Replies
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  tweet_id TEXT NOT NULL,
  reply_tweet_id TEXT,
  content TEXT NOT NULL,
  strategy TEXT NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_replies_user_id ON replies(user_id);
CREATE INDEX idx_replies_alert_id ON replies(alert_id);
CREATE INDEX idx_replies_tweet_id ON replies(tweet_id);

-- Predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID UNIQUE NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
  expected_impressions_min INTEGER NOT NULL,
  expected_impressions_max INTEGER NOT NULL,
  prob_author_engagement DOUBLE PRECISION NOT NULL,
  prob_profile_clicks DOUBLE PRECISION NOT NULL,
  prob_follows DOUBLE PRECISION NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outcomes
CREATE TABLE outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID UNIQUE NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
  actual_impressions INTEGER NOT NULL,
  author_engaged BOOLEAN NOT NULL,
  profile_clicks INTEGER NOT NULL,
  follows INTEGER NOT NULL,
  label outcome_label NOT NULL,
  feedback TEXT,
  measured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning signals
CREATE TABLE learning_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_data JSONB NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_signals_user_id_type ON learning_signals(user_id, signal_type);

-- Attention decay
CREATE TABLE attention_decay (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_tweet_id UUID UNIQUE NOT NULL REFERENCES candidate_tweets(id) ON DELETE CASCADE,
  half_life INTEGER NOT NULL,
  active_lifespan INTEGER NOT NULL,
  revive_probability DOUBLE PRECISION NOT NULL,
  decay_velocity DOUBLE PRECISION NOT NULL,
  current_phase decay_phase DEFAULT 'GROWTH',
  revive_window_start TIMESTAMPTZ,
  revive_window_end TIMESTAMPTZ,
  engagement_history JSONB NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attention_decay_current_phase ON attention_decay(current_phase);
CREATE INDEX idx_attention_decay_revive_probability ON attention_decay(revive_probability);

-- Smart alerts
CREATE TABLE smart_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_tweet_id UUID REFERENCES candidate_tweets(id) ON DELETE SET NULL,
  type alert_type NOT NULL,
  urgency alert_urgency NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  optimal_window INTEGER,
  closing_window INTEGER,
  dismissed BOOLEAN DEFAULT FALSE,
  acted_on BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_smart_alerts_user_id_dismissed ON smart_alerts(user_id, dismissed);
CREATE INDEX idx_smart_alerts_type ON smart_alerts(type);
CREATE INDEX idx_smart_alerts_urgency ON smart_alerts(urgency);
CREATE INDEX idx_smart_alerts_created_at ON smart_alerts(created_at);

-- Engagement snapshots
CREATE TABLE engagement_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_tweet_id UUID NOT NULL REFERENCES candidate_tweets(id) ON DELETE CASCADE,
  likes INTEGER NOT NULL,
  retweets INTEGER NOT NULL,
  replies INTEGER NOT NULL,
  quotes INTEGER DEFAULT 0,
  impressions INTEGER,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engagement_snapshots_candidate_tweet_id_captured_at ON engagement_snapshots(candidate_tweet_id, captured_at);
CREATE INDEX idx_engagement_snapshots_captured_at ON engagement_snapshots(captured_at);

-- User learning
CREATE TABLE user_learning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  best_authors JSONB DEFAULT '[]',
  best_topics JSONB DEFAULT '[]',
  best_reply_styles JSONB DEFAULT '[]',
  best_posting_hours JSONB DEFAULT '[]',
  avg_half_life DOUBLE PRECISION,
  avg_revival_success DOUBLE PRECISION,
  total_replies INTEGER DEFAULT 0,
  successful_replies INTEGER DEFAULT 0,
  avg_impressions_gained INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attention_decay_updated_at BEFORE UPDATE ON attention_decay FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_learning_updated_at BEFORE UPDATE ON user_learning FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for targets
CREATE POLICY "Users can view own targets" ON targets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own targets" ON targets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own targets" ON targets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own targets" ON targets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for alerts
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for replies
CREATE POLICY "Users can view own replies" ON replies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own replies" ON replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for predictions
CREATE POLICY "Users can view own predictions" ON predictions FOR SELECT USING (
  EXISTS (SELECT 1 FROM replies WHERE replies.id = predictions.reply_id AND replies.user_id = auth.uid())
);

-- RLS Policies for outcomes
CREATE POLICY "Users can view own outcomes" ON outcomes FOR SELECT USING (
  EXISTS (SELECT 1 FROM replies WHERE replies.id = outcomes.reply_id AND replies.user_id = auth.uid())
);

-- RLS Policies for learning_signals
CREATE POLICY "Users can view own learning signals" ON learning_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning signals" ON learning_signals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for smart_alerts
CREATE POLICY "Users can view own smart alerts" ON smart_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own smart alerts" ON smart_alerts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_learning
CREATE POLICY "Users can view own learning data" ON user_learning FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own learning data" ON user_learning FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning data" ON user_learning FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for candidate_tweets, scores, engagement_snapshots, attention_decay (authenticated users only)
ALTER TABLE candidate_tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE attention_decay ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view candidate tweets" ON candidate_tweets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view scores" ON scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view engagement snapshots" ON engagement_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view attention decay" ON attention_decay FOR SELECT TO authenticated USING (true);

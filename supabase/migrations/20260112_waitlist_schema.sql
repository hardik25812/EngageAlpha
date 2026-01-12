-- Waitlist table to store email signups
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  twitter_handle TEXT,
  referral_source TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'active', 'churned')),
  priority_score INTEGER DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  invited_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX idx_waitlist_priority_score ON waitlist(priority_score DESC);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public inserts (for signup form)
CREATE POLICY "Allow public waitlist signup" ON waitlist 
  FOR INSERT 
  WITH CHECK (true);

-- Policy: Only service role can read/update (admin access)
CREATE POLICY "Service role can manage waitlist" ON waitlist 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Update timestamp trigger
CREATE TRIGGER update_waitlist_updated_at 
  BEFORE UPDATE ON waitlist 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate priority score based on various factors
CREATE OR REPLACE FUNCTION calculate_waitlist_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- Base score
  NEW.priority_score := 0;
  
  -- Bonus for having Twitter handle (likely more engaged)
  IF NEW.twitter_handle IS NOT NULL AND NEW.twitter_handle != '' THEN
    NEW.priority_score := NEW.priority_score + 10;
  END IF;
  
  -- Bonus for referral
  IF NEW.referral_source IS NOT NULL AND NEW.referral_source != '' THEN
    NEW.priority_score := NEW.priority_score + 5;
  END IF;
  
  -- Bonus for UTM campaign (came from marketing)
  IF NEW.utm_campaign IS NOT NULL THEN
    NEW.priority_score := NEW.priority_score + 3;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply priority calculation on insert
CREATE TRIGGER calculate_waitlist_priority_trigger
  BEFORE INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION calculate_waitlist_priority();

-- View for waitlist analytics
CREATE OR REPLACE VIEW waitlist_analytics AS
SELECT 
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'invited') as invited_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as signups_last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as signups_last_7d,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as signups_last_30d,
  AVG(priority_score) as avg_priority_score
FROM waitlist;

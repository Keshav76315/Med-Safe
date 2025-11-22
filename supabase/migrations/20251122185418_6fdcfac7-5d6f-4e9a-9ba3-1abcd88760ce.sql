-- Create counterfeit_reports table
CREATE TABLE IF NOT EXISTS public.counterfeit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  
  -- Drug information
  drug_name TEXT NOT NULL,
  batch_number TEXT,
  manufacturer TEXT,
  
  -- Location details
  location_address TEXT NOT NULL,
  location_city TEXT,
  location_state TEXT,
  location_coordinates POINT,
  purchase_location TEXT,
  
  -- Report details
  description TEXT NOT NULL,
  symptoms TEXT,
  photo_urls TEXT[],
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'investigated', 'resolved')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Verification and rewards
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  reward_points INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_rewards table for gamification
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  verified_reports_count INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.counterfeit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for counterfeit_reports
CREATE POLICY "Anyone can view public reports"
  ON public.counterfeit_reports
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON public.counterfeit_reports
  FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR 
    (is_anonymous = true AND user_id IS NULL)
  );

CREATE POLICY "Users can update own reports"
  ON public.counterfeit_reports
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Pharmacists and admins can update any report"
  ON public.counterfeit_reports
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'pharmacist'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete reports"
  ON public.counterfeit_reports
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_rewards
CREATE POLICY "Users can view own rewards"
  ON public.user_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard"
  ON public.user_rewards
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert rewards"
  ON public.user_rewards
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update rewards"
  ON public.user_rewards
  FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX idx_counterfeit_reports_status ON public.counterfeit_reports(status);
CREATE INDEX idx_counterfeit_reports_created_at ON public.counterfeit_reports(created_at DESC);
CREATE INDEX idx_counterfeit_reports_location_city ON public.counterfeit_reports(location_city);
CREATE INDEX idx_counterfeit_reports_severity ON public.counterfeit_reports(severity);
CREATE INDEX idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX idx_user_rewards_total_points ON public.user_rewards(total_points DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_counterfeit_reports_updated_at
  BEFORE UPDATE ON public.counterfeit_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_rewards_updated_at
  BEFORE UPDATE ON public.user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to award points when report is verified
CREATE OR REPLACE FUNCTION public.award_report_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only award points when report is verified for the first time
  IF NEW.is_verified = true AND OLD.is_verified = false AND NEW.user_id IS NOT NULL THEN
    -- Calculate points based on severity
    NEW.reward_points := CASE NEW.severity
      WHEN 'critical' THEN 100
      WHEN 'high' THEN 75
      WHEN 'medium' THEN 50
      WHEN 'low' THEN 25
      ELSE 0
    END;
    
    -- Update user rewards
    INSERT INTO public.user_rewards (user_id, total_points, verified_reports_count)
    VALUES (NEW.user_id, NEW.reward_points, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET
      total_points = user_rewards.total_points + EXCLUDED.total_points,
      verified_reports_count = user_rewards.verified_reports_count + 1,
      level = FLOOR((user_rewards.total_points + EXCLUDED.total_points) / 100) + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER award_points_on_verification
  BEFORE UPDATE ON public.counterfeit_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.award_report_points();
-- Create family_members table for dependent management
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Member information
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  
  -- Medical information
  allergies TEXT[],
  chronic_conditions TEXT[],
  emergency_contact TEXT,
  emergency_contact_phone TEXT,
  
  -- Access control
  has_separate_account BOOLEAN DEFAULT false,
  linked_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create caregivers table for caregiver access management
CREATE TABLE IF NOT EXISTS public.caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caregiver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Access permissions
  can_view_history BOOLEAN DEFAULT true,
  can_add_medications BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT true,
  can_manage_reminders BOOLEAN DEFAULT true,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(patient_user_id, caregiver_user_id)
);

-- Create dashboard_stats table for analytics
CREATE TABLE IF NOT EXISTS public.dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Verification stats
  total_verifications INTEGER DEFAULT 0,
  successful_verifications INTEGER DEFAULT 0,
  counterfeit_detected INTEGER DEFAULT 0,
  
  -- Safety stats
  safety_score_checks INTEGER DEFAULT 0,
  drug_interaction_checks INTEGER DEFAULT 0,
  prescription_scans INTEGER DEFAULT 0,
  
  -- Engagement
  last_verification_date TIMESTAMP WITH TIME ZONE,
  last_login_date TIMESTAMP WITH TIME ZONE,
  streak_days INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_members
CREATE POLICY "Users can view own family members"
  ON public.family_members
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = linked_user_id);

CREATE POLICY "Users can insert own family members"
  ON public.family_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family members"
  ON public.family_members
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own family members"
  ON public.family_members
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Caregivers can view family members"
  ON public.family_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.caregivers
      WHERE caregivers.patient_user_id = family_members.user_id
      AND caregivers.caregiver_user_id = auth.uid()
      AND caregivers.status = 'active'
    )
  );

-- RLS Policies for caregivers
CREATE POLICY "Patients can view own caregivers"
  ON public.caregivers
  FOR SELECT
  USING (auth.uid() = patient_user_id);

CREATE POLICY "Caregivers can view their assignments"
  ON public.caregivers
  FOR SELECT
  USING (auth.uid() = caregiver_user_id);

CREATE POLICY "Patients can manage caregivers"
  ON public.caregivers
  FOR ALL
  USING (auth.uid() = patient_user_id);

-- RLS Policies for dashboard_stats
CREATE POLICY "Users can view own stats"
  ON public.dashboard_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert stats"
  ON public.dashboard_stats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update stats"
  ON public.dashboard_stats
  FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX idx_family_members_linked_user_id ON public.family_members(linked_user_id);
CREATE INDEX idx_caregivers_patient_user_id ON public.caregivers(patient_user_id);
CREATE INDEX idx_caregivers_caregiver_user_id ON public.caregivers(caregiver_user_id);
CREATE INDEX idx_caregivers_status ON public.caregivers(status);
CREATE INDEX idx_dashboard_stats_user_id ON public.dashboard_stats(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_caregivers_updated_at
  BEFORE UPDATE ON public.caregivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_stats_updated_at
  BEFORE UPDATE ON public.dashboard_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize dashboard stats for new users
CREATE OR REPLACE FUNCTION public.initialize_dashboard_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.dashboard_stats (user_id, last_login_date)
  VALUES (NEW.id, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create stats when user signs up
CREATE TRIGGER create_dashboard_stats_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_dashboard_stats();
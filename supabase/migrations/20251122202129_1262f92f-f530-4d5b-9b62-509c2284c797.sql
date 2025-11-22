-- Fix overly permissive RLS policies on dashboard_stats table
-- These policies currently allow anyone to insert/update statistics

-- Drop the insecure policies
DROP POLICY IF EXISTS "System can insert stats" ON public.dashboard_stats;
DROP POLICY IF EXISTS "System can update stats" ON public.dashboard_stats;

-- Create user-scoped policies that only allow users to manage their own stats
CREATE POLICY "Users can insert own stats" 
ON public.dashboard_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" 
ON public.dashboard_stats 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: If system-level updates are needed in the future,
-- create a security definer function instead of open policies
-- =====================================================
-- SECURITY FIX: Fix overly permissive RLS policies
-- =====================================================

-- 1. Fix patient_history table RLS policies
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view own patient history" ON patient_history;
DROP POLICY IF EXISTS "Users can insert own patient history" ON patient_history;
DROP POLICY IF EXISTS "Users can update own patient history" ON patient_history;
DROP POLICY IF EXISTS "Users can delete own patient history" ON patient_history;

-- Create proper owner-scoped policies for patient_history
CREATE POLICY "Users can view own patient history"
  ON patient_history FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own patient history"
  ON patient_history FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own patient history"
  ON patient_history FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own patient history"
  ON patient_history FOR DELETE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Add caregiver access policy for patient history
CREATE POLICY "Caregivers can view patient history"
  ON patient_history FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients p
      WHERE EXISTS (
        SELECT 1 FROM caregivers c
        WHERE c.patient_user_id = p.user_id
          AND c.caregiver_user_id = auth.uid()
          AND c.status = 'active'
          AND c.can_view_history = true
      )
    )
  );

-- 2. Fix drugs table - restrict INSERT/UPDATE to pharmacists and admins only
DROP POLICY IF EXISTS "Allow authenticated insert to drugs" ON drugs;
DROP POLICY IF EXISTS "Allow authenticated update to drugs" ON drugs;

CREATE POLICY "Admins and pharmacists can insert drugs"
  ON drugs FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'pharmacist'::app_role)
  );

CREATE POLICY "Admins and pharmacists can update drugs"
  ON drugs FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'pharmacist'::app_role)
  );

CREATE POLICY "Admins can delete drugs"
  ON drugs FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix counterfeit_reports - restrict public access to protect anonymous reporters
DROP POLICY IF EXISTS "Anyone can view public reports" ON counterfeit_reports;

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON counterfeit_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Pharmacists and admins can see all details for investigation
CREATE POLICY "Pharmacists and admins can view all reports"
  ON counterfeit_reports FOR SELECT
  USING (
    has_role(auth.uid(), 'pharmacist'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 4. Fix profiles table - remove overly broad pharmacist/admin access
DROP POLICY IF EXISTS "Pharmacists and admins can view all profiles" ON profiles;

-- 5. Create a public view for counterfeit reports that masks sensitive data
CREATE OR REPLACE VIEW public.public_counterfeit_reports 
WITH (security_invoker = on) AS
SELECT 
  id,
  drug_name,
  batch_number,
  manufacturer,
  location_city,
  location_state,
  CASE WHEN is_anonymous THEN NULL ELSE user_id END as user_id,
  CASE WHEN is_anonymous THEN 'Anonymous' ELSE reporter_name END as reporter_name,
  description,
  severity,
  status,
  is_verified,
  created_at,
  updated_at
FROM counterfeit_reports;

-- 6. Create storage bucket for counterfeit evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('counterfeit-evidence', 'counterfeit-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for counterfeit evidence bucket
CREATE POLICY "Authenticated users can upload evidence"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'counterfeit-evidence' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view own evidence"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'counterfeit-evidence' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    has_role(auth.uid(), 'pharmacist'::app_role)
    OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Admins can delete evidence"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'counterfeit-evidence'
  AND has_role(auth.uid(), 'admin'::app_role)
);
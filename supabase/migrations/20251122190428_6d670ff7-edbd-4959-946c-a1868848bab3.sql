-- Create prescriptions table for storing scanned prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  doctor_name TEXT,
  doctor_license TEXT,
  prescription_date DATE,
  medications JSONB NOT NULL,
  notes TEXT,
  image_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Users can view own prescriptions
CREATE POLICY "Users can view own prescriptions"
  ON public.prescriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own prescriptions
CREATE POLICY "Users can insert own prescriptions"
  ON public.prescriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own prescriptions
CREATE POLICY "Users can update own prescriptions"
  ON public.prescriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own prescriptions
CREATE POLICY "Users can delete own prescriptions"
  ON public.prescriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Caregivers can view patient prescriptions
CREATE POLICY "Caregivers can view patient prescriptions"
  ON public.prescriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregivers
      WHERE patient_user_id = prescriptions.user_id
        AND caregiver_user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create pharmacies table for pharmacy locator
CREATE TABLE IF NOT EXISTS public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_24_7 BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  services JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for pharmacies (public read)
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;

-- Anyone can view pharmacies
CREATE POLICY "Anyone can view pharmacies"
  ON public.pharmacies
  FOR SELECT
  USING (true);

-- Admins can manage pharmacies
CREATE POLICY "Admins can manage pharmacies"
  ON public.pharmacies
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for pharmacies updated_at
CREATE TRIGGER update_pharmacies_updated_at
  BEFORE UPDATE ON public.pharmacies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
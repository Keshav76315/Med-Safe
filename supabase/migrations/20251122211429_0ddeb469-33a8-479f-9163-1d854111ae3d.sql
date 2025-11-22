-- Create patients table for storing patient profiles
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  patient_name text NOT NULL,
  date_of_birth date,
  blood_group text,
  gender text,
  phone_number text,
  email text,
  medical_conditions text[],
  allergies text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own patients"
  ON public.patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patients"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patients"
  ON public.patients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patients"
  ON public.patients FOR DELETE
  USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Modify patient_history to reference patients table
ALTER TABLE public.patient_history 
  DROP COLUMN IF EXISTS patient_id;

ALTER TABLE public.patient_history 
  ADD COLUMN patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patient_history_patient_id ON public.patient_history(patient_id);
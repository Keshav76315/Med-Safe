-- Create enum types for drug and risk classifications
CREATE TYPE drug_type AS ENUM ('authentic', 'counterfeit', 'expired');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE scan_status AS ENUM ('verified', 'counterfeit', 'expired', 'not_found');

-- Create drugs (DrugMaster) table
CREATE TABLE public.drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  batch_no TEXT UNIQUE NOT NULL,
  mfg_date DATE NOT NULL,
  exp_date DATE NOT NULL,
  manufacturer TEXT NOT NULL,
  type drug_type NOT NULL DEFAULT 'authentic',
  risk_level risk_level NOT NULL DEFAULT 'low',
  active_ingredient TEXT NOT NULL,
  dosage_form TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for drugs table
CREATE INDEX idx_drugs_batch_no ON public.drugs(batch_no);
CREATE INDEX idx_drugs_drug_id ON public.drugs(drug_id);
CREATE INDEX idx_drugs_type ON public.drugs(type);
CREATE INDEX idx_drugs_exp_date ON public.drugs(exp_date);

-- Create patient_history table
CREATE TABLE public.patient_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  start_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for patient_history table
CREATE INDEX idx_patient_history_patient_id ON public.patient_history(patient_id);
CREATE INDEX idx_patient_history_medicine_name ON public.patient_history(medicine_name);

-- Create scan_logs table
CREATE TABLE public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT UNIQUE NOT NULL,
  batch_no TEXT NOT NULL,
  drug_id UUID REFERENCES public.drugs(id) ON DELETE SET NULL,
  status scan_status NOT NULL,
  scanned_by TEXT,
  duplicate_flag BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for scan_logs table
CREATE INDEX idx_scan_logs_batch_no ON public.scan_logs(batch_no);
CREATE INDEX idx_scan_logs_drug_id ON public.scan_logs(drug_id);
CREATE INDEX idx_scan_logs_timestamp ON public.scan_logs(timestamp);
CREATE INDEX idx_scan_logs_status ON public.scan_logs(status);

-- Enable Row Level Security
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drugs (public read, admin write)
CREATE POLICY "Allow public read access to drugs"
  ON public.drugs FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to drugs"
  ON public.drugs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to drugs"
  ON public.drugs FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for patient_history (users can manage their own records)
CREATE POLICY "Users can view all patient history"
  ON public.patient_history FOR SELECT
  USING (true);

CREATE POLICY "Users can insert patient history"
  ON public.patient_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update patient history"
  ON public.patient_history FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete patient history"
  ON public.patient_history FOR DELETE
  USING (true);

-- RLS Policies for scan_logs (public read, authenticated write)
CREATE POLICY "Allow public read access to scan_logs"
  ON public.scan_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to scan_logs"
  ON public.scan_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_drugs_updated_at
  BEFORE UPDATE ON public.drugs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_history_updated_at
  BEFORE UPDATE ON public.patient_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample drug data (15 entries with various types and risk levels)
INSERT INTO public.drugs (drug_id, name, batch_no, mfg_date, exp_date, manufacturer, type, risk_level, active_ingredient, dosage_form) VALUES
  ('DRG001', 'Paracetamol', 'BATCH001', '2024-01-15', '2026-01-15', 'PharmaCorp Ltd', 'authentic', 'low', 'Paracetamol 500mg', 'Tablet'),
  ('DRG002', 'Amoxicillin', 'BATCH002', '2024-02-20', '2026-02-20', 'MediLife Inc', 'authentic', 'low', 'Amoxicillin 250mg', 'Capsule'),
  ('DRG003', 'Ibuprofen', 'BATCH003', '2023-11-10', '2025-11-10', 'HealthPlus', 'authentic', 'low', 'Ibuprofen 400mg', 'Tablet'),
  ('DRG004', 'Aspirin', 'BATCH004', '2024-03-05', '2026-03-05', 'CarePharma', 'authentic', 'medium', 'Aspirin 75mg', 'Tablet'),
  ('DRG005', 'Metformin', 'BATCH005', '2024-01-25', '2026-01-25', 'DiabetesCare Ltd', 'authentic', 'medium', 'Metformin 500mg', 'Tablet'),
  ('DRG006', 'Lisinopril', 'BATCH006', '2023-12-01', '2025-12-01', 'CardioHealth', 'authentic', 'medium', 'Lisinopril 10mg', 'Tablet'),
  ('DRG007', 'Warfarin', 'BATCH007', '2024-02-14', '2026-02-14', 'BloodCare Inc', 'authentic', 'high', 'Warfarin 5mg', 'Tablet'),
  ('DRG008', 'Insulin Glargine', 'BATCH008', '2024-04-01', '2025-04-01', 'DiabetesRx', 'authentic', 'critical', 'Insulin Glargine 100 units/mL', 'Injection'),
  ('DRG009', 'Levothyroxine', 'BATCH009', '2024-01-18', '2026-01-18', 'ThyroidMed', 'authentic', 'medium', 'Levothyroxine 50mcg', 'Tablet'),
  ('DRG010', 'Fake Paracetamol', 'BATCH010', '2023-06-15', '2025-06-15', 'Unknown Supplier', 'counterfeit', 'critical', 'Unknown', 'Tablet'),
  ('DRG011', 'Counterfeit Aspirin', 'BATCH011', '2023-08-20', '2025-08-20', 'Illegal Lab', 'counterfeit', 'critical', 'Chalk Powder', 'Tablet'),
  ('DRG012', 'Expired Amoxicillin', 'BATCH012', '2022-01-10', '2024-01-10', 'OldStock Pharma', 'expired', 'high', 'Amoxicillin 500mg', 'Capsule'),
  ('DRG013', 'Expired Insulin', 'BATCH013', '2021-11-05', '2023-11-05', 'ExpiredMeds', 'expired', 'critical', 'Insulin Regular', 'Injection'),
  ('DRG014', 'Atorvastatin', 'BATCH014', '2024-03-15', '2026-03-15', 'CholesterolCare', 'authentic', 'low', 'Atorvastatin 20mg', 'Tablet'),
  ('DRG015', 'Omeprazole', 'BATCH015', '2024-02-28', '2026-02-28', 'GastroPharma', 'authentic', 'low', 'Omeprazole 20mg', 'Capsule');
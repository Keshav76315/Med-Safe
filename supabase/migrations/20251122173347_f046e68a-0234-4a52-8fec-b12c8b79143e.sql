-- Add reminder fields to patient_history table
ALTER TABLE public.patient_history
ADD COLUMN reminder_enabled boolean DEFAULT false,
ADD COLUMN reminder_time time DEFAULT '09:00:00',
ADD COLUMN reminder_frequency text DEFAULT 'daily' CHECK (reminder_frequency IN ('daily', 'twice_daily', 'weekly'));

COMMENT ON COLUMN public.patient_history.reminder_enabled IS 'Whether medication reminders are enabled';
COMMENT ON COLUMN public.patient_history.reminder_time IS 'Time of day to send reminder (24-hour format)';
COMMENT ON COLUMN public.patient_history.reminder_frequency IS 'How often to send reminders: daily, twice_daily, or weekly';
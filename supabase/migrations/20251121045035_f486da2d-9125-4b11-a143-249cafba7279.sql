-- Create function to notify pharmacists when new scans need verification
CREATE OR REPLACE FUNCTION notify_pharmacists_of_new_scan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pharmacist_record RECORD;
  drug_name TEXT;
BEGIN
  -- Get drug name if available
  SELECT name INTO drug_name
  FROM drugs
  WHERE id = NEW.drug_id;
  
  -- Notify all pharmacists and admins
  FOR pharmacist_record IN 
    SELECT user_id 
    FROM user_roles 
    WHERE role IN ('pharmacist', 'admin')
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      metadata
    ) VALUES (
      pharmacist_record.user_id,
      'verification_needed',
      '🔔 New Verification Required',
      'New drug scan needs your review: ' || COALESCE(drug_name, 'Unknown Drug') || ' (Batch: ' || NEW.batch_no || ')',
      jsonb_build_object(
        'scan_id', NEW.id,
        'batch_no', NEW.batch_no,
        'drug_id', NEW.drug_id
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger to notify pharmacists on all new scan inserts
DROP TRIGGER IF EXISTS on_new_scan_notify_pharmacists ON scan_logs;
CREATE TRIGGER on_new_scan_notify_pharmacists
  AFTER INSERT ON scan_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_pharmacists_of_new_scan();
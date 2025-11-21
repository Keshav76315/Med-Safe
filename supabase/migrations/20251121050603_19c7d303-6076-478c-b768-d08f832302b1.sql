-- Update the handle_new_user function to call n8n webhook
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_url TEXT := 'https://bhjkkyxyfqrtcnbkyilr.supabase.co';
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');
  
  -- Call n8n webhook asynchronously (won't block user signup if it fails)
  PERFORM net.http_post(
    url := 'https://workflow.ccbp.in/webhook-test/e7cb0832-0e76-43d5-9242-e4b7e1bbbb57',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'full_name', COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      'created_at', NEW.created_at,
      'app_url', app_url
    )
  );
  
  RETURN NEW;
END;
$$;
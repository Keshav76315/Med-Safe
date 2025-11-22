# Medicine Reminders System

MedSafe includes a fully functional medicine reminder system that sends notifications to users at scheduled times.

## Features

- **Multiple Reminder Options**: Users can set reminders to take medicines daily, twice daily, or weekly
- **Custom Times**: Choose any time of day for reminders
- **Real-time Notifications**: Notifications appear instantly in the notification bell
- **Easy Management**: Enable/disable reminders for each medicine in Medical History

## How It Works

1. **User Setup**: In Medical History, users add medicines and enable reminders with their preferred time and frequency
2. **Background Checking**: An edge function checks every minute for due reminders
3. **Notification Delivery**: When a reminder is due, a notification is automatically created and appears in the notification bell
4. **Real-time Updates**: Notifications appear instantly via Supabase Realtime subscriptions

## Setting Up Automated Checking

The `check-medicine-reminders` edge function needs to run periodically (every minute recommended). Here are setup options:

### Option 1: pg_cron (Recommended for Production)

Enable pg_cron extension in your Supabase database and create a cron job:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job that runs every minute
SELECT cron.schedule(
  'check-medicine-reminders',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://bhjkkyxyfqrtcnbkyilr.supabase.co/functions/v1/check-medicine-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### Option 2: External Cron Service (EasyCron, cron-job.org, etc.)

Set up a cron job to call the edge function URL every minute:

- **URL**: `https://bhjkkyxyfqrtcnbkyilr.supabase.co/functions/v1/check-medicine-reminders`
- **Method**: POST
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_ANON_KEY`
- **Schedule**: Every minute (`* * * * *`)

### Option 3: GitHub Actions (For Testing)

Add a workflow file `.github/workflows/check-reminders.yml`:

```yaml
name: Check Medicine Reminders

on:
  schedule:
    - cron: '* * * * *' # Every minute
  workflow_dispatch: # Manual trigger

jobs:
  check-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            https://bhjkkyxyfqrtcnbkyilr.supabase.co/functions/v1/check-medicine-reminders \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

## Testing Reminders

To test the reminder system:

1. Go to **Medical History** page
2. Add a new medicine record
3. Enable reminders and set the time to 1-2 minutes from now
4. Wait for the scheduled time
5. Check the notification bell for the reminder

## Reminder Frequencies

- **Daily**: Notification sent once per day at the specified time
- **Twice Daily**: Notifications sent at the specified time and 12 hours later
- **Weekly**: Notification sent once per week (on Mondays) at the specified time

## Database Schema

The reminder system uses these fields in the `patient_history` table:

- `reminder_enabled` (boolean): Whether reminders are active
- `reminder_time` (time): Time of day to send reminder (24-hour format)
- `reminder_frequency` (text): Frequency type ('daily', 'twice_daily', 'weekly')

Notifications are stored in the `notifications` table and delivered via Realtime subscriptions.

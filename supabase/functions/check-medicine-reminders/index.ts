import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current time in HH:MM format
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    
    console.log(`Checking reminders for time: ${currentTime}`);

    // Get all patient history records with reminders enabled
    const { data: records, error: recordsError } = await supabaseClient
      .from("patient_history")
      .select(`
        *,
        profiles!inner(user_id)
      `)
      .eq("reminder_enabled", true);

    if (recordsError) {
      console.error("Error fetching records:", recordsError);
      throw recordsError;
    }

    console.log(`Found ${records?.length || 0} records with reminders enabled`);

    // Filter records that match current time
    const dueReminders = records?.filter(record => {
      const reminderTime = record.reminder_time;
      
      // For twice_daily, check if current time matches either the set time or 12 hours later
      if (record.reminder_frequency === 'twice_daily') {
        const [hours, minutes] = reminderTime.split(':').map(Number);
        const secondReminderHour = (hours + 12) % 24;
        const secondReminderTime = `${String(secondReminderHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        return reminderTime === currentTime || secondReminderTime === currentTime;
      }
      
      // For weekly, only send on current day of week (e.g., only Mondays)
      if (record.reminder_frequency === 'weekly') {
        const dayOfWeek = now.getDay();
        // Only send on Mondays (1) as an example
        if (dayOfWeek !== 1) return false;
      }
      
      return reminderTime === currentTime;
    }) || [];

    console.log(`${dueReminders.length} reminders due now`);

    // Create notifications for due reminders
    const notificationsToCreate = dueReminders.map(record => ({
      user_id: record.profiles.user_id,
      type: 'medicine_reminder',
      title: '💊 Medicine Reminder',
      message: `Time to take ${record.medicine_name} - ${record.dosage}`,
      metadata: {
        medicine_name: record.medicine_name,
        dosage: record.dosage,
        patient_history_id: record.id,
      },
    }));

    if (notificationsToCreate.length > 0) {
      const { error: notifyError } = await supabaseClient
        .from("notifications")
        .insert(notificationsToCreate);

      if (notifyError) {
        console.error("Error creating notifications:", notifyError);
        throw notifyError;
      }

      console.log(`Created ${notificationsToCreate.length} reminder notifications`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_checked: records?.length || 0,
        notifications_sent: notificationsToCreate.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-medicine-reminders:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
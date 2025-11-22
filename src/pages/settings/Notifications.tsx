import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Mail, Bell, Shield, AlertTriangle, Settings as SettingsIcon } from "lucide-react";

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  verification_alerts: boolean;
  counterfeit_alerts: boolean;
  system_updates: boolean;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    verification_alerts: true,
    counterfeit_alerts: true,
    system_updates: true,
  });

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      if (data?.notification_preferences) {
        const prefs = data.notification_preferences as any;
        setPreferences({
          email_notifications: prefs.email_notifications ?? true,
          push_notifications: prefs.push_notifications ?? true,
          verification_alerts: prefs.verification_alerts ?? true,
          counterfeit_alerts: prefs.counterfeit_alerts ?? true,
          system_updates: prefs.system_updates ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          notification_preferences: preferences as any,
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Manage how you receive notifications from MedSafe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="email_notifications" className="font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="email_notifications"
                checked={preferences.email_notifications}
                onCheckedChange={() => togglePreference("email_notifications")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="push_notifications" className="font-medium cursor-pointer">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
              </div>
              <Switch
                id="push_notifications"
                checked={preferences.push_notifications}
                onCheckedChange={() => togglePreference("push_notifications")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="verification_alerts" className="font-medium cursor-pointer">
                    Verification Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Alerts about drug verification status
                  </p>
                </div>
              </div>
              <Switch
                id="verification_alerts"
                checked={preferences.verification_alerts}
                onCheckedChange={() => togglePreference("verification_alerts")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <Label htmlFor="counterfeit_alerts" className="font-medium cursor-pointer">
                    Counterfeit Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Critical alerts about counterfeit drugs
                  </p>
                </div>
              </div>
              <Switch
                id="counterfeit_alerts"
                checked={preferences.counterfeit_alerts}
                onCheckedChange={() => togglePreference("counterfeit_alerts")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="system_updates" className="font-medium cursor-pointer">
                    System Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Updates about new features and improvements
                  </p>
                </div>
              </div>
              <Switch
                id="system_updates"
                checked={preferences.system_updates}
                onCheckedChange={() => togglePreference("system_updates")}
              />
            </div>

            <Button onClick={handleSave} className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

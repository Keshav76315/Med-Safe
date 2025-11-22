import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Bell, Mail, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NotificationPreferences {
  email_counterfeit_alerts: boolean;
  email_duplicate_scans: boolean;
  email_verification_updates: boolean;
  email_safety_alerts: boolean;
  push_counterfeit_alerts: boolean;
  push_duplicate_scans: boolean;
  push_verification_updates: boolean;
  push_safety_alerts: boolean;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_counterfeit_alerts: true,
    email_duplicate_scans: true,
    email_verification_updates: true,
    email_safety_alerts: true,
    push_counterfeit_alerts: true,
    push_duplicate_scans: true,
    push_verification_updates: true,
    push_safety_alerts: true,
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from a notification_preferences table
      // For now, we'll use localStorage as a simple solution
      const stored = localStorage.getItem(`notification_prefs_${user?.id}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error: any) {
      toast({
        title: "Error loading preferences",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      // In a real app, this would save to database
      localStorage.setItem(`notification_prefs_${user?.id}`, JSON.stringify(preferences));
      
      toast({
        title: "Preferences saved",
        description: "Your notification settings have been updated."
      });
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Notification Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage how you receive alerts and updates
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Choose which notifications you want to receive via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_counterfeit">Counterfeit Drug Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Immediate alerts when counterfeit drugs are detected
                  </p>
                </div>
                <Switch
                  id="email_counterfeit"
                  checked={preferences.email_counterfeit_alerts}
                  onCheckedChange={() => togglePreference('email_counterfeit_alerts')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_duplicate">Duplicate Scan Warnings</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about duplicate medication scans
                  </p>
                </div>
                <Switch
                  id="email_duplicate"
                  checked={preferences.email_duplicate_scans}
                  onCheckedChange={() => togglePreference('email_duplicate_scans')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_verification">Verification Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Status updates on pharmacist verifications
                  </p>
                </div>
                <Switch
                  id="email_verification"
                  checked={preferences.email_verification_updates}
                  onCheckedChange={() => togglePreference('email_verification_updates')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_safety">Safety Score Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Important updates about your medication safety score
                  </p>
                </div>
                <Switch
                  id="email_safety"
                  checked={preferences.email_safety_alerts}
                  onCheckedChange={() => togglePreference('email_safety_alerts')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                In-App Notifications
              </CardTitle>
              <CardDescription>
                Control which in-app notifications you see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push_counterfeit">Counterfeit Drug Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Show in-app alerts for counterfeit detections
                  </p>
                </div>
                <Switch
                  id="push_counterfeit"
                  checked={preferences.push_counterfeit_alerts}
                  onCheckedChange={() => togglePreference('push_counterfeit_alerts')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push_duplicate">Duplicate Scan Warnings</Label>
                  <p className="text-sm text-muted-foreground">
                    Display warnings for duplicate scans
                  </p>
                </div>
                <Switch
                  id="push_duplicate"
                  checked={preferences.push_duplicate_scans}
                  onCheckedChange={() => togglePreference('push_duplicate_scans')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push_verification">Verification Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Show updates on verification status
                  </p>
                </div>
                <Switch
                  id="push_verification"
                  checked={preferences.push_verification_updates}
                  onCheckedChange={() => togglePreference('push_verification_updates')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push_safety">Safety Score Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Display safety score notifications
                  </p>
                </div>
                <Switch
                  id="push_safety"
                  checked={preferences.push_safety_alerts}
                  onCheckedChange={() => togglePreference('push_safety_alerts')}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

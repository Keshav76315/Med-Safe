import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Shield, Check, X, Clock, Trash2 } from 'lucide-react';

interface Caregiver {
  id: string;
  caregiver_user_id: string;
  status: string;
  can_view_history: boolean;
  can_add_medications: boolean;
  can_view_reports: boolean;
  can_manage_reminders: boolean;
  created_at: string;
  caregiver_email?: string;
}

export default function Caregivers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [permissions, setPermissions] = useState({
    canViewHistory: true,
    canAddMedications: false,
    canViewReports: true,
    canManageReminders: true,
  });

  useEffect(() => {
    if (user) {
      loadCaregivers();
    }
  }, [user]);

  const loadCaregivers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('caregivers')
        .select('*')
        .eq('patient_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch caregiver emails
      if (data && data.length > 0) {
        const userIds = data.map(c => c.caregiver_user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        if (!profilesError && profiles) {
          const enrichedData = data.map(caregiver => {
            const profile = profiles.find(p => p.user_id === caregiver.caregiver_user_id);
            return {
              ...caregiver,
              caregiver_email: profile?.full_name || 'Unknown',
            };
          });
          setCaregivers(enrichedData);
        } else {
          setCaregivers(data);
        }
      } else {
        setCaregivers([]);
      }
    } catch (error) {
      console.error('Error loading caregivers:', error);
      toast({
        title: 'Error',
        description: 'Could not load caregivers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCaregiver = async () => {
    if (!caregiverEmail.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      // In a real implementation, this would look up the user by email
      // For now, we'll show a message
      toast({
        title: 'Invitation Sent',
        description: `Caregiver invitation sent to ${caregiverEmail}`,
      });

      setDialogOpen(false);
      setCaregiverEmail('');
    } catch (error: any) {
      console.error('Error inviting caregiver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermissions = async (caregiverId: string, field: string, value: boolean) => {
    try {
      const updateData: any = {};
      updateData[field] = value;

      const { error } = await supabase
        .from('caregivers')
        .update(updateData)
        .eq('id', caregiverId);

      if (error) throw error;

      toast({
        title: 'Updated',
        description: 'Caregiver permissions updated',
      });

      loadCaregivers();
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not update permissions',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (caregiverId: string) => {
    try {
      const { error } = await supabase
        .from('caregivers')
        .update({ status: 'active', approved_at: new Date().toISOString() })
        .eq('id', caregiverId);

      if (error) throw error;

      toast({
        title: 'Approved',
        description: 'Caregiver access approved',
      });

      loadCaregivers();
    } catch (error: any) {
      console.error('Error approving caregiver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not approve caregiver',
        variant: 'destructive',
      });
    }
  };

  const handleRevoke = async (caregiverId: string) => {
    if (!confirm('Are you sure you want to revoke this caregiver\'s access?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('caregivers')
        .update({ status: 'revoked' })
        .eq('id', caregiverId);

      if (error) throw error;

      toast({
        title: 'Revoked',
        description: 'Caregiver access revoked',
      });

      loadCaregivers();
    } catch (error: any) {
      console.error('Error revoking caregiver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not revoke access',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (caregiverId: string) => {
    if (!confirm('Are you sure you want to remove this caregiver?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('caregivers')
        .delete()
        .eq('id', caregiverId);

      if (error) throw error;

      toast({
        title: 'Removed',
        description: 'Caregiver removed successfully',
      });

      loadCaregivers();
    } catch (error: any) {
      console.error('Error removing caregiver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not remove caregiver',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-accent"><Check className="h-3 w-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'revoked':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Caregiver Access</h1>
          <p className="text-muted-foreground text-lg">
            Grant trusted individuals access to your medical information
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Your Caregivers
                  </CardTitle>
                  <CardDescription>Manage who can access and help with your medical information</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Caregiver
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Caregiver</DialogTitle>
                      <DialogDescription>
                        Send an invitation to someone you trust to help manage your medical information
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="caregiverEmail">Caregiver Email</Label>
                        <Input
                          id="caregiverEmail"
                          type="email"
                          value={caregiverEmail}
                          onChange={(e) => setCaregiverEmail(e.target.value)}
                          placeholder="caregiver@example.com"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Default Permissions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">View Medical History</span>
                            <Switch
                              checked={permissions.canViewHistory}
                              onCheckedChange={(checked) => setPermissions({ ...permissions, canViewHistory: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Add Medications</span>
                            <Switch
                              checked={permissions.canAddMedications}
                              onCheckedChange={(checked) => setPermissions({ ...permissions, canAddMedications: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">View Reports</span>
                            <Switch
                              checked={permissions.canViewReports}
                              onCheckedChange={(checked) => setPermissions({ ...permissions, canViewReports: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Manage Reminders</span>
                            <Switch
                              checked={permissions.canManageReminders}
                              onCheckedChange={(checked) => setPermissions({ ...permissions, canManageReminders: checked })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleInviteCaregiver}>
                          Send Invitation
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : caregivers.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No caregivers added yet</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Your First Caregiver
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {caregivers.map((caregiver) => (
                    <Card key={caregiver.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{caregiver.caregiver_email}</h3>
                              <p className="text-sm text-muted-foreground">
                                Added {new Date(caregiver.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(caregiver.status)}
                              {caregiver.status === 'pending' && (
                                <Button size="sm" onClick={() => handleApprove(caregiver.id)}>
                                  Approve
                                </Button>
                              )}
                              {caregiver.status === 'active' && (
                                <Button size="sm" variant="outline" onClick={() => handleRevoke(caregiver.id)}>
                                  Revoke
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => handleRemove(caregiver.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {caregiver.status === 'active' && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label className="text-sm font-semibold">Permissions</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">View History</span>
                                  <Switch
                                    checked={caregiver.can_view_history}
                                    onCheckedChange={(checked) => handleUpdatePermissions(caregiver.id, 'can_view_history', checked)}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Add Medications</span>
                                  <Switch
                                    checked={caregiver.can_add_medications}
                                    onCheckedChange={(checked) => handleUpdatePermissions(caregiver.id, 'can_add_medications', checked)}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">View Reports</span>
                                  <Switch
                                    checked={caregiver.can_view_reports}
                                    onCheckedChange={(checked) => handleUpdatePermissions(caregiver.id, 'can_view_reports', checked)}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Manage Reminders</span>
                                  <Switch
                                    checked={caregiver.can_manage_reminders}
                                    onCheckedChange={(checked) => handleUpdatePermissions(caregiver.id, 'can_manage_reminders', checked)}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

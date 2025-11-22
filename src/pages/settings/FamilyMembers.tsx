import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, Trash2, Edit, Heart, Calendar, Phone, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const familyMemberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  relationship: z.string().trim().min(1, 'Relationship is required'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().trim().max(100).optional(),
  emergencyContactPhone: z.string().trim().max(20).optional(),
});

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  emergency_contact?: string;
  emergency_contact_phone?: string;
  has_separate_account: boolean;
}

export default function FamilyMembers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    emergencyContact: '',
    emergencyContactPhone: '',
  });

  useEffect(() => {
    if (user) {
      loadFamilyMembers();
    }
  }, [user]);

  const loadFamilyMembers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading family members:', error);
      toast({
        title: 'Error',
        description: 'Could not load family members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      allergies: '',
      chronicConditions: '',
      emergencyContact: '',
      emergencyContactPhone: '',
    });
    setEditingMember(null);
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      relationship: member.relationship,
      dateOfBirth: member.date_of_birth || '',
      gender: member.gender || '',
      bloodGroup: member.blood_group || '',
      allergies: member.allergies?.join(', ') || '',
      chronicConditions: member.chronic_conditions?.join(', ') || '',
      emergencyContact: member.emergency_contact || '',
      emergencyContactPhone: member.emergency_contact_phone || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const validation = familyMemberSchema.safeParse({
      name: formData.name,
      relationship: formData.relationship,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      emergencyContact: formData.emergencyContact,
      emergencyContactPhone: formData.emergencyContactPhone,
    });

    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.issues[0].message,
        variant: 'destructive',
      });
      return;
    }

    try {
      const memberData = {
        user_id: user!.id,
        name: formData.name,
        relationship: formData.relationship,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        blood_group: formData.bloodGroup || null,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : null,
        chronic_conditions: formData.chronicConditions ? formData.chronicConditions.split(',').map(s => s.trim()) : null,
        emergency_contact: formData.emergencyContact || null,
        emergency_contact_phone: formData.emergencyContactPhone || null,
      };

      if (editingMember) {
        const { error } = await supabase
          .from('family_members')
          .update(memberData)
          .eq('id', editingMember.id);

        if (error) throw error;

        toast({
          title: 'Updated',
          description: 'Family member updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('family_members')
          .insert(memberData);

        if (error) throw error;

        toast({
          title: 'Added',
          description: 'Family member added successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      loadFamilyMembers();
    } catch (error: any) {
      console.error('Error saving family member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not save family member',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Removed',
        description: 'Family member removed successfully',
      });

      loadFamilyMembers();
    } catch (error: any) {
      console.error('Error deleting family member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not remove family member',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Family Members</h1>
          <p className="text-muted-foreground text-lg">
            Manage medical information for your family
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Your Family
                  </CardTitle>
                  <CardDescription>Add and manage family members' medical profiles</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingMember ? 'Edit' : 'Add'} Family Member</DialogTitle>
                      <DialogDescription>
                        Enter medical and contact information for your family member
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <Label htmlFor="relationship">Relationship *</Label>
                          <Select value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="grandparent">Grandparent</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="bloodGroup">Blood Group</Label>
                          <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="allergies">Allergies</Label>
                        <Textarea
                          id="allergies"
                          value={formData.allergies}
                          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                          placeholder="List allergies, separated by commas"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                        <Textarea
                          id="chronicConditions"
                          value={formData.chronicConditions}
                          onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                          placeholder="List chronic conditions, separated by commas"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                          <Input
                            id="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                          <Input
                            id="emergencyContactPhone"
                            type="tel"
                            value={formData.emergencyContactPhone}
                            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                          {editingMember ? 'Update' : 'Add'} Member
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
              ) : members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No family members added yet</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <Card key={member.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold">{member.name}</h3>
                              <Badge variant="secondary">{member.relationship}</Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              {member.date_of_birth && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{new Date(member.date_of_birth).toLocaleDateString()}</span>
                                </div>
                              )}
                              {member.blood_group && (
                                <div className="flex items-center gap-2">
                                  <Heart className="h-4 w-4 text-muted-foreground" />
                                  <span>{member.blood_group}</span>
                                </div>
                              )}
                              {member.emergency_contact_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span>{member.emergency_contact_phone}</span>
                                </div>
                              )}
                            </div>

                            {(member.allergies && member.allergies.length > 0) && (
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">Allergies:</p>
                                  <p className="text-sm text-muted-foreground">{member.allergies.join(', ')}</p>
                                </div>
                              </div>
                            )}

                            {(member.chronic_conditions && member.chronic_conditions.length > 0) && (
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">Conditions:</p>
                                  <p className="text-sm text-muted-foreground">{member.chronic_conditions.join(', ')}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">Why Add Family Members?</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Track medications for your entire family in one place</li>
                    <li>Get safety alerts for drug interactions specific to each member</li>
                    <li>Share medical history with caregivers when needed</li>
                    <li>Quick access to emergency contact information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

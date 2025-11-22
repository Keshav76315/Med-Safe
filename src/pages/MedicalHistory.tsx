import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
  Patient,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const patientSchema = z.object({
  patient_name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name too long" }),
  date_of_birth: z.string().optional().or(z.literal('')),
  blood_group: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  phone_number: z.string().optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email" }).optional().or(z.literal('')),
  medical_conditions: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  emergency_contact_name: z.string().optional().or(z.literal('')),
  emergency_contact_phone: z.string().optional().or(z.literal('')),
});

export default function MedicalHistory() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    patient_name: "",
    date_of_birth: "",
    blood_group: "",
    gender: "",
    phone_number: "",
    email: "",
    medical_conditions: "",
    allergies: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = patients.filter(p => 
        p.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone_number?.includes(searchQuery)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  async function loadPatients() {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = patientSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      const patientData = {
        ...formData,
        medical_conditions: formData.medical_conditions 
          ? formData.medical_conditions.split(',').map(c => c.trim()).filter(Boolean)
          : [],
        allergies: formData.allergies
          ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean)
          : [],
      };

      if (editingPatient) {
        await updatePatient(editingPatient.id, patientData);
        toast({ title: "Patient updated successfully" });
      } else {
        await addPatient(patientData);
        toast({ title: "Patient added successfully" });
      }

      setDialogOpen(false);
      resetForm();
      loadPatients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save patient",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this patient? All medical records will be deleted.")) return;

    try {
      await deletePatient(id);
      toast({ title: "Patient deleted successfully" });
      loadPatients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    }
  }

  function openEditDialog(patient: Patient) {
    setEditingPatient(patient);
    setFormData({
      patient_name: patient.patient_name,
      date_of_birth: patient.date_of_birth || "",
      blood_group: patient.blood_group || "",
      gender: patient.gender || "",
      phone_number: patient.phone_number || "",
      email: patient.email || "",
      medical_conditions: patient.medical_conditions?.join(', ') || "",
      allergies: patient.allergies?.join(', ') || "",
      emergency_contact_name: patient.emergency_contact_name || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setEditingPatient(null);
    setFormData({
      patient_name: "",
      date_of_birth: "",
      blood_group: "",
      gender: "",
      phone_number: "",
      email: "",
      medical_conditions: "",
      allergies: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Medical History</h1>
          <p className="text-muted-foreground text-lg">
            Manage patient profiles and medication records
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPatient ? "Edit" : "Add"} Patient Profile
                </DialogTitle>
                <DialogDescription>
                  {editingPatient ? "Update" : "Enter"} patient information
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="patient_name">Patient Name *</Label>
                  <Input
                    id="patient_name"
                    required
                    value={formData.patient_name}
                    onChange={(e) =>
                      setFormData({ ...formData, patient_name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({ ...formData, date_of_birth: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      placeholder="Male/Female/Other"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Input
                    id="blood_group"
                    placeholder="e.g., A+, O-, AB+"
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({ ...formData, phone_number: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="medical_conditions">Medical Conditions</Label>
                  <Input
                    id="medical_conditions"
                    placeholder="Comma separated (e.g., Diabetes, Hypertension)"
                    value={formData.medical_conditions}
                    onChange={(e) =>
                      setFormData({ ...formData, medical_conditions: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    placeholder="Comma separated (e.g., Penicillin, Peanuts)"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Emergency Contact</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emergency_contact_name">Contact Name</Label>
                      <Input
                        id="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                      <Input
                        id="emergency_contact_phone"
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPatient ? "Update" : "Add"} Patient
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No patients found matching your search" : "No patients added yet"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Patient
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card 
                key={patient.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/history/${patient.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{patient.patient_name}</CardTitle>
                      <CardDescription className="mt-1">
                        {patient.gender && `${patient.gender} • `}
                        {patient.date_of_birth && 
                          `Age ${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}`
                        }
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(patient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(patient.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {patient.blood_group && (
                      <div>
                        <span className="font-medium">Blood Group:</span> {patient.blood_group}
                      </div>
                    )}
                    {patient.phone_number && (
                      <div>
                        <span className="font-medium">Phone:</span> {patient.phone_number}
                      </div>
                    )}
                    {patient.medical_conditions && patient.medical_conditions.length > 0 && (
                      <div>
                        <span className="font-medium">Conditions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.medical_conditions.slice(0, 3).map((condition, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                          {patient.medical_conditions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{patient.medical_conditions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

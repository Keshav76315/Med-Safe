import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPatient,
  getPatientHistory,
  addPatientHistory,
  updatePatientHistory,
  deletePatientHistory,
  PatientHistory,
  Patient,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Bell, BellOff, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const medicalHistorySchema = z.object({
  medicine_name: z.string()
    .trim()
    .min(2, { message: "Medicine name must be at least 2 characters" })
    .max(200, { message: "Medicine name too long" })
    .regex(/^[a-zA-Z0-9\s.,-]+$/, { message: "Invalid characters in medicine name" }),
  dosage: z.string()
    .trim()
    .min(1, { message: "Dosage is required" })
    .max(100, { message: "Dosage description too long" }),
  start_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
  notes: z.string()
    .max(1000, { message: "Notes too long (max 1000 characters)" })
    .optional()
    .or(z.literal(''))
});

export default function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PatientHistory | null>(null);
  const [formData, setFormData] = useState({
    medicine_name: "",
    dosage: "",
    start_date: "",
    notes: "",
    reminder_enabled: false,
    reminder_time: "09:00",
    reminder_frequency: "daily",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  async function loadPatientData() {
    if (!patientId) return;

    setLoading(true);
    try {
      const [patientData, historyData] = await Promise.all([
        getPatient(patientId),
        getPatientHistory(patientId)
      ]);
      setPatient(patientData);
      setHistory(historyData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = medicalHistorySchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingRecord) {
        await updatePatientHistory(editingRecord.id, formData);
        toast({ title: "Record updated successfully" });
      } else {
        await addPatientHistory({ ...formData, patient_id: patientId! });
        toast({ title: "Record added successfully" });
      }

      setDialogOpen(false);
      resetForm();
      loadPatientData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save record",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      await deletePatientHistory(id);
      toast({ title: "Record deleted successfully" });
      loadPatientData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
    }
  }

  function openEditDialog(record: PatientHistory) {
    setEditingRecord(record);
    setFormData({
      medicine_name: record.medicine_name,
      dosage: record.dosage,
      start_date: record.start_date,
      notes: record.notes || "",
      reminder_enabled: record.reminder_enabled || false,
      reminder_time: record.reminder_time || "09:00",
      reminder_frequency: record.reminder_frequency || "daily",
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setEditingRecord(null);
    setFormData({
      medicine_name: "",
      dosage: "",
      start_date: "",
      notes: "",
      reminder_enabled: false,
      reminder_time: "09:00",
      reminder_frequency: "daily",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/history")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Button>

        {loading && !patient ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : patient ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{patient.patient_name}</CardTitle>
                <CardDescription>Patient Information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {patient.date_of_birth && (
                    <div>
                      <span className="font-medium">Date of Birth:</span>{" "}
                      {new Date(patient.date_of_birth).toLocaleDateString()}
                    </div>
                  )}
                  {patient.gender && (
                    <div>
                      <span className="font-medium">Gender:</span> {patient.gender}
                    </div>
                  )}
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
                  {patient.email && (
                    <div>
                      <span className="font-medium">Email:</span> {patient.email}
                    </div>
                  )}
                  {patient.medical_conditions && patient.medical_conditions.length > 0 && (
                    <div className="col-span-full">
                      <span className="font-medium">Medical Conditions:</span>{" "}
                      {patient.medical_conditions.join(", ")}
                    </div>
                  )}
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div className="col-span-full">
                      <span className="font-medium">Allergies:</span>{" "}
                      {patient.allergies.join(", ")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Medical Records</CardTitle>
                  <CardDescription>
                    {history.length} {history.length === 1 ? "record" : "records"} found
                  </CardDescription>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRecord ? "Edit" : "Add"} Medical Record
                      </DialogTitle>
                      <DialogDescription>
                        {editingRecord ? "Update" : "Enter"} medication information
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="medicine_name">Medicine Name</Label>
                        <Input
                          id="medicine_name"
                          required
                          value={formData.medicine_name}
                          onChange={(e) =>
                            setFormData({ ...formData, medicine_name: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          required
                          placeholder="e.g., 500mg twice daily"
                          value={formData.dosage}
                          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          required
                          value={formData.start_date}
                          onChange={(e) =>
                            setFormData({ ...formData, start_date: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Additional information..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>

                      <div className="border-t pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="reminder_enabled">Enable Reminder</Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified to take this medicine
                            </p>
                          </div>
                          <Switch
                            id="reminder_enabled"
                            checked={formData.reminder_enabled}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, reminder_enabled: checked })
                            }
                          />
                        </div>

                        {formData.reminder_enabled && (
                          <>
                            <div>
                              <Label htmlFor="reminder_time">Reminder Time</Label>
                              <Input
                                id="reminder_time"
                                type="time"
                                value={formData.reminder_time}
                                onChange={(e) =>
                                  setFormData({ ...formData, reminder_time: e.target.value })
                                }
                              />
                            </div>

                            <div>
                              <Label htmlFor="reminder_frequency">Frequency</Label>
                              <Select
                                value={formData.reminder_frequency}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, reminder_frequency: value })
                                }
                              >
                                <SelectTrigger id="reminder_frequency">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Once Daily</SelectItem>
                                  <SelectItem value="twice_daily">Twice Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingRecord ? "Update" : "Add"} Record
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No medical records found</p>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Record
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine Name</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Reminder</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {record.medicine_name}
                            </TableCell>
                            <TableCell>{record.dosage}</TableCell>
                            <TableCell>
                              {new Date(record.start_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {record.reminder_enabled ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <Bell className="h-4 w-4 text-primary" />
                                  <span>{record.reminder_time}</span>
                                  <span className="text-muted-foreground">
                                    ({record.reminder_frequency?.replace('_', ' ')})
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <BellOff className="h-4 w-4" />
                                  <span>Off</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {record.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(record)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(record.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}

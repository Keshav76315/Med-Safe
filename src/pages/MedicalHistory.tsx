import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  getPatientHistory,
  addPatientHistory,
  updatePatientHistory,
  deletePatientHistory,
  PatientHistory,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export default function MedicalHistory() {
  const [patientId, setPatientId] = useState("PAT001");
  const [history, setHistory] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PatientHistory | null>(null);
  const [formData, setFormData] = useState({
    medicine_name: "",
    dosage: "",
    start_date: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  async function loadHistory() {
    if (!patientId.trim()) return;

    setLoading(true);
    try {
      const data = await getPatientHistory(patientId);
      setHistory(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load medical history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingRecord) {
        await updatePatientHistory(editingRecord.id, formData);
        toast({ title: "Record updated successfully" });
      } else {
        await addPatientHistory({ ...formData, patient_id: patientId });
        toast({ title: "Record added successfully" });
      }

      setDialogOpen(false);
      resetForm();
      loadHistory();
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
      loadHistory();
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
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Medical History</h1>
          <p className="text-muted-foreground text-lg">
            Manage patient medication records and treatment history
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Patient</CardTitle>
            <CardDescription>Enter patient ID to view medical history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  placeholder="e.g., PAT001"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value.toUpperCase())}
                />
              </div>
              <Button onClick={loadHistory} className="mt-6" disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>
                {history.length} {history.length === 1 ? "record" : "records"} found for{" "}
                {patientId}
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
            {history.length === 0 ? (
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
      </main>
    </div>
  );
}

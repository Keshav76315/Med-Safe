import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { getPendingVerifications, approveVerification, rejectVerification } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Clock, Pill } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function PharmacistVerification() {
  const [pendingScans, setPendingScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const { userRole } = useAuth();

  useEffect(() => {
    loadPendingScans();
  }, []);

  async function loadPendingScans() {
    try {
      const data = await getPendingVerifications();
      setPendingScans(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending verifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(scanId: string) {
    setProcessingId(scanId);
    try {
      await approveVerification(scanId, notes[scanId]);
      toast({
        title: "Verification Approved",
        description: "Drug scan has been approved successfully",
      });
      setPendingScans(pendingScans.filter(scan => scan.id !== scanId));
      const newNotes = { ...notes };
      delete newNotes[scanId];
      setNotes(newNotes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve verification",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(scanId: string) {
    if (!notes[scanId]?.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide notes explaining the rejection",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(scanId);
    try {
      await rejectVerification(scanId, notes[scanId]);
      toast({
        title: "Verification Rejected",
        description: "Drug scan has been rejected",
      });
      setPendingScans(pendingScans.filter(scan => scan.id !== scanId));
      const newNotes = { ...notes };
      delete newNotes[scanId];
      setNotes(newNotes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject verification",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  }

  if (userRole !== 'pharmacist' && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Pharmacist Verification</h1>
          <p className="text-muted-foreground text-lg">
            Review and approve pending drug verifications
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : pendingScans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-medium mb-2">All Caught Up!</p>
              <p className="text-muted-foreground">
                There are no pending verifications at this time
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingScans.map((scan) => (
              <Card key={scan.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        {scan.drugs?.name || "Unknown Drug"}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Batch: {scan.batch_no} • Scan ID: {scan.scan_id}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      scan.status === 'verified' ? 'default' :
                      scan.status === 'counterfeit' ? 'destructive' :
                      scan.status === 'expired' ? 'secondary' : 'outline'
                    }>
                      {scan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Scanned By</p>
                      <p className="font-medium">{scan.scanned_by || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Scan Time</p>
                      <p className="font-medium">
                        {new Date(scan.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {scan.drugs && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Manufacturer</p>
                          <p className="font-medium">{scan.drugs.manufacturer}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expiry Date</p>
                          <p className="font-medium">
                            {new Date(scan.drugs.exp_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Active Ingredient</p>
                          <p className="font-medium">{scan.drugs.active_ingredient}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Risk Level</p>
                          <p className="font-medium capitalize">{scan.drugs.risk_level}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Pharmacist Notes {scan.status === 'verified' ? '(Optional)' : '(Required for rejection)'}
                    </label>
                    <Textarea
                      placeholder="Add any observations or concerns..."
                      value={notes[scan.id] || ''}
                      onChange={(e) => setNotes({ ...notes, [scan.id]: e.target.value })}
                      rows={3}
                      disabled={processingId === scan.id}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleApprove(scan.id)}
                      disabled={processingId !== null}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingId === scan.id ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(scan.id)}
                      disabled={processingId !== null}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processingId === scan.id ? 'Rejecting...' : 'Reject'}
                    </Button>
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

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyDrug, Drug } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, CheckCircle, XCircle, ScanLine, Loader2, Camera, Info, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRScanner } from "@/components/QRScanner";
import { z } from 'zod';
import { supabase } from "@/integrations/supabase/client";

const batchNumberSchema = z.string()
  .trim()
  .min(1, { message: "Batch number is required" })
  .max(50, { message: "Batch number too long" })
  .regex(/^[A-Z0-9-]+$/, { message: "Batch number can only contain uppercase letters, numbers, and hyphens" });

interface MedicineInfo {
  name: string;
  genericName?: string;
  category?: string;
  uses?: string[];
  dosage?: string;
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
  warnings?: string[];
  error?: string;
}

export default function DrugVerification() {
  const [batchNo, setBatchNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [result, setResult] = useState<{
    status: "verified" | "counterfeit" | "expired" | "not_found";
    drug: Drug | null;
    isDuplicate?: boolean;
  } | null>(null);
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const { toast } = useToast();

  async function handleVerify(batch?: string) {
    const batchToVerify = batch || batchNo;
    
    const validation = batchNumberSchema.safeParse(batchToVerify);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await verifyDrug(validation.data);
      setResult(data);

      if (data.status === "verified") {
        toast({
          title: "Authentic Drug Verified",
          description: "This medication is safe and authentic",
        });
      } else if (data.status === "counterfeit") {
        toast({
          title: "⚠️ Counterfeit Drug Detected",
          description: "This medication is not authentic. Do not use!",
          variant: "destructive",
        });
      } else if (data.status === "expired") {
        toast({
          title: "⚠️ Expired Medication",
          description: "This medication has expired",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Drug Not Found",
          description: "No record found for this batch number",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "An error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleQRScan = async (scannedText: string) => {
    setShowScanner(false);
    
    // Check if it's a batch number format
    const isBatchNumber = /^[A-Z0-9-]+$/.test(scannedText.trim());
    
    if (isBatchNumber) {
      // It's a batch number - verify it
      setBatchNo(scannedText);
      handleVerify(scannedText);
    } else {
      // It's a medicine name - get AI info
      setBatchNo("");
      setResult(null);
      setLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('medicine-info', {
          body: { medicineName: scannedText }
        });

        if (error) throw error;

        if (data.medicineInfo.error) {
          toast({
            title: "Medicine Not Found",
            description: data.medicineInfo.error,
            variant: "destructive",
          });
          setMedicineInfo(null);
        } else {
          setMedicineInfo(data.medicineInfo);
          toast({
            title: "Medicine Information Retrieved",
            description: `Details about ${data.medicineInfo.name}`,
          });
        }
      } catch (error) {
        console.error("Medicine info error:", error);
        toast({
          title: "Failed to Retrieve Information",
          description: "Could not get medicine details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Drug Verification</h1>
          <p className="text-muted-foreground text-lg">
            Scan or enter batch number to verify authenticity
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ScanLine className="h-5 w-5 text-primary" />
              <span>Enter Batch Number</span>
            </CardTitle>
            <CardDescription>Type or scan the medication batch number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="e.g., BATCH001"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="text-lg flex-1"
              />
              <div className="flex gap-2">
                <Button onClick={() => handleVerify()} disabled={loading} size="lg" className="flex-1 sm:flex-initial">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => setShowScanner(true)} 
                  variant="outline" 
                  size="lg"
                  className="flex-1 sm:flex-initial"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Scan QR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card
            className={cn(
              "border-2 animate-in fade-in-50 slide-in-from-bottom-4",
              result.status === "verified" && "border-accent bg-accent/5",
              result.status === "counterfeit" && "border-destructive bg-destructive/5",
              result.status === "expired" && "border-warning bg-warning/5",
              result.status === "not_found" && "border-muted"
            )}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                {result.status === "verified" && (
                  <CheckCircle className="h-8 w-8 text-accent" />
                )}
                {result.status === "counterfeit" && (
                  <XCircle className="h-8 w-8 text-destructive" />
                )}
                {result.status === "expired" && (
                  <AlertTriangle className="h-8 w-8 text-warning" />
                )}
                {result.status === "not_found" && <XCircle className="h-8 w-8 text-muted-foreground" />}

                <div>
                  <CardTitle className="text-2xl">
                    {result.status === "verified" && "Authentic Drug Verified ✓"}
                    {result.status === "counterfeit" && "COUNTERFEIT DETECTED"}
                    {result.status === "expired" && "EXPIRED MEDICATION"}
                    {result.status === "not_found" && "Drug Not Found"}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {result.status === "verified" && "This medication is safe to use"}
                    {result.status === "counterfeit" && "Do not use this medication"}
                    {result.status === "expired" && "This medication has expired"}
                    {result.status === "not_found" &&
                      "No records found for this batch number"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {result.drug && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Drug Name</p>
                    <p className="font-semibold text-lg">{result.drug.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Batch Number</p>
                    <p className="font-semibold">{result.drug.batch_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Manufacturer</p>
                    <p className="font-medium">{result.drug.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dosage Form</p>
                    <p className="font-medium">{result.drug.dosage_form}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Manufacturing Date</p>
                    <p className="font-medium">
                      {new Date(result.drug.mfg_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">
                      {new Date(result.drug.exp_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Ingredient</p>
                    <p className="font-medium">{result.drug.active_ingredient}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-sm font-semibold",
                        result.drug.risk_level === "low" && "bg-accent/20 text-accent",
                        result.drug.risk_level === "medium" && "bg-warning/20 text-warning",
                        (result.drug.risk_level === "high" ||
                          result.drug.risk_level === "critical") &&
                          "bg-destructive/20 text-destructive"
                      )}
                    >
                      {result.drug.risk_level.toUpperCase()}
                    </span>
                  </div>
                </div>

                {result.isDuplicate && (
                  <div className="bg-warning/10 border border-warning/50 rounded-md p-3 mt-4">
                    <p className="text-sm font-medium flex items-center text-warning">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Duplicate scan detected within last 24 hours
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {medicineInfo && !medicineInfo.error && (
          <Card className="border-2 border-primary bg-primary/5 animate-in fade-in-50 slide-in-from-bottom-4">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Pill className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{medicineInfo.name}</CardTitle>
                  {medicineInfo.genericName && (
                    <CardDescription className="text-base mt-1">
                      Generic: {medicineInfo.genericName}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicineInfo.category && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Category</p>
                  <p className="text-base">{medicineInfo.category}</p>
                </div>
              )}

              {medicineInfo.uses && medicineInfo.uses.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Medical Uses</p>
                  <ul className="list-disc list-inside space-y-1">
                    {medicineInfo.uses.map((use, index) => (
                      <li key={index} className="text-base">{use}</li>
                    ))}
                  </ul>
                </div>
              )}

              {medicineInfo.dosage && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Dosage Information</p>
                  <p className="text-base">{medicineInfo.dosage}</p>
                </div>
              )}

              {medicineInfo.sideEffects && medicineInfo.sideEffects.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Common Side Effects</p>
                  <ul className="list-disc list-inside space-y-1">
                    {medicineInfo.sideEffects.map((effect, index) => (
                      <li key={index} className="text-base text-muted-foreground">{effect}</li>
                    ))}
                  </ul>
                </div>
              )}

              {medicineInfo.warnings && medicineInfo.warnings.length > 0 && (
                <div className="bg-warning/10 border border-warning/50 rounded-md p-3">
                  <p className="text-sm font-semibold flex items-center text-warning mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Important Warnings
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {medicineInfo.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-foreground">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {medicineInfo.contraindications && medicineInfo.contraindications.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Contraindications</p>
                  <ul className="list-disc list-inside space-y-1">
                    {medicineInfo.contraindications.map((contra, index) => (
                      <li key={index} className="text-base text-muted-foreground">{contra}</li>
                    ))}
                  </ul>
                </div>
              )}

              {medicineInfo.interactions && medicineInfo.interactions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Drug Interactions</p>
                  <ul className="list-disc list-inside space-y-1">
                    {medicineInfo.interactions.map((interaction, index) => (
                      <li key={index} className="text-base text-muted-foreground">{interaction}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-muted/50 rounded-md p-3 mt-4">
                <p className="text-xs text-muted-foreground flex items-center">
                  <Info className="h-3 w-3 mr-2" />
                  This information is AI-generated and should not replace professional medical advice. Always consult a healthcare provider.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Testing Examples</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Test batch verification with these codes, or scan a medicine name (like "Aspirin") for AI-powered information
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <button
              onClick={() => setBatchNo("BATCH001")}
              className="text-left p-2 rounded bg-background hover:bg-accent/10 transition-colors"
            >
              BATCH001 - Authentic
            </button>
            <button
              onClick={() => setBatchNo("BATCH010")}
              className="text-left p-2 rounded bg-background hover:bg-destructive/10 transition-colors"
            >
              BATCH010 - Counterfeit
            </button>
            <button
              onClick={() => setBatchNo("BATCH012")}
              className="text-left p-2 rounded bg-background hover:bg-warning/10 transition-colors"
            >
              BATCH012 - Expired
            </button>
          </div>
        </div>
      </main>

      {showScanner && (
        <QRScanner 
          onScan={handleQRScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
}

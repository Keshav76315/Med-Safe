import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyDrug, Drug } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, CheckCircle, XCircle, ScanLine, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DrugVerification() {
  const [batchNo, setBatchNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: "verified" | "counterfeit" | "expired" | "not_found";
    drug: Drug | null;
    isDuplicate?: boolean;
  } | null>(null);
  const { toast } = useToast();

  async function handleVerify() {
    if (!batchNo.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a batch number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await verifyDrug(batchNo.trim());
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
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., BATCH001"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="text-lg"
              />
              <Button onClick={handleVerify} disabled={loading} size="lg">
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

        <div className="mt-8 bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Sample Batch Numbers for Testing</h3>
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
    </div>
  );
}

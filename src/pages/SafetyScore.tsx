import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Activity, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';

interface SafetyScoreRequest {
  age: number;
  conditions: string[];
  currentMedications: string[];
  newMedication: string;
}

interface SafetyScoreResponse {
  score: number;
  level: "safe" | "caution" | "danger";
  risks: string[];
  recommendations: string[];
}

const safetyScoreSchema = z.object({
  age: z.number().min(0, { message: "Age must be positive" }).max(150, { message: "Invalid age" }),
  newMedication: z.string().trim().min(1, { message: "Medication name required" }).max(200, { message: "Medication name too long" }),
  conditions: z.array(z.string().trim().max(100, { message: "Condition name too long" })),
  currentMedications: z.array(z.string().trim().max(200, { message: "Medication name too long" }))
});

// Example test cases for users
const EXAMPLE_TESTS = [
  {
    label: "Aspirin + Blood Thinner (High Risk)",
    data: {
      age: 65,
      newMedication: "Aspirin",
      conditions: ["Atrial Fibrillation"],
      currentMedications: ["Warfarin", "Metoprolol"]
    }
  },
  {
    label: "Antibiotic with No Interactions (Safe)",
    data: {
      age: 35,
      newMedication: "Amoxicillin",
      conditions: ["Bacterial Infection"],
      currentMedications: []
    }
  },
  {
    label: "Diabetes Drug Interaction (Caution)",
    data: {
      age: 50,
      newMedication: "Glyburide",
      conditions: ["Type 2 Diabetes", "Hypertension"],
      currentMedications: ["Metformin", "Lisinopril"]
    }
  }
];

export default function SafetyScore() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SafetyScoreRequest>({
    age: 0,
    conditions: [],
    currentMedications: [],
    newMedication: "",
  });
  const [conditionInput, setConditionInput] = useState("");
  const [medicationInput, setMedicationInput] = useState("");
  const [result, setResult] = useState<SafetyScoreResponse | null>(null);

  function addCondition() {
    const trimmed = conditionInput.trim();
    if (!trimmed) return;
    
    if (trimmed.length > 100) {
      toast({
        title: "Validation Error",
        description: "Condition name too long (max 100 characters)",
        variant: "destructive",
      });
      return;
    }
    
    setFormData({
      ...formData,
      conditions: [...formData.conditions, trimmed],
    });
    setConditionInput("");
  }

  function removeCondition(index: number) {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  }

  function addMedication() {
    const trimmed = medicationInput.trim();
    if (!trimmed) return;
    
    if (trimmed.length > 200) {
      toast({
        title: "Validation Error",
        description: "Medication name too long (max 200 characters)",
        variant: "destructive",
      });
      return;
    }
    
    setFormData({
      ...formData,
      currentMedications: [...formData.currentMedications, trimmed],
    });
    setMedicationInput("");
  }

  function removeMedication(index: number) {
    setFormData({
      ...formData,
      currentMedications: formData.currentMedications.filter((_, i) => i !== index),
    });
  }

  async function handleCalculate() {
    const validation = safetyScoreSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('safety-score-ai', {
        body: formData
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data as SafetyScoreResponse);

      toast({
        title: "Analysis Complete",
        description: `Safety score: ${data.score}/100`,
      });

    } catch (error: any) {
      console.error('Error calculating safety score:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to calculate safety score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function loadExample(example: typeof EXAMPLE_TESTS[0]) {
    setFormData(example.data);
    setResult(null);
    toast({
      title: "Example Loaded",
      description: example.label,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">AI-Powered Safety Score Calculator</h1>
          <p className="text-muted-foreground text-lg">
            Advanced AI analysis of medication safety based on patient profile
          </p>
        </div>

        {/* Example Test Cases */}
        <Card className="mb-6 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Try Example Test Cases</CardTitle>
            <CardDescription>Click to load pre-filled scenarios for testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TESTS.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample(example)}
                  className="text-xs"
                >
                  {example.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Enter patient details and medication history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="newMedication">New Medication</Label>
                <Input
                  id="newMedication"
                  placeholder="Enter medication name"
                  value={formData.newMedication}
                  onChange={(e) => setFormData({ ...formData, newMedication: e.target.value })}
                />
              </div>

              <div>
                <Label>Medical Conditions</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    placeholder="Add condition"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
                  />
                  <Button type="button" onClick={addCondition}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.conditions.map((condition, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer">
                      {condition}
                      <button
                        onClick={() => removeCondition(i)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Current Medications</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    placeholder="Add medication"
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMedication())}
                  />
                  <Button type="button" onClick={addMedication}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.currentMedications.map((med, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer">
                      {med}
                      <button
                        onClick={() => removeMedication(i)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleCalculate} className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-5 w-5" />
                    Calculate Safety Score
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right Column: Results */}
          {loading && !result ? (
            <Card>
              <CardHeader>
                <CardTitle>Safety Assessment</CardTitle>
                <CardDescription>AI-powered medication safety analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : result ? (
            <Card
              className={cn(
                "border-2 animate-in fade-in-50 slide-in-from-right-4",
                result.level === "safe" && "border-accent bg-accent/5",
                result.level === "caution" && "border-warning bg-warning/5",
                result.level === "danger" && "border-destructive bg-destructive/5"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Safety Assessment</CardTitle>
                  {result.level === "safe" && <CheckCircle className="h-8 w-8 text-accent" />}
                  {result.level === "caution" && <AlertTriangle className="h-8 w-8 text-warning" />}
                  {result.level === "danger" && <XCircle className="h-8 w-8 text-destructive" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Safety Score</span>
                    <span
                      className={cn(
                        "text-3xl font-bold",
                        result.level === "safe" && "text-accent",
                        result.level === "caution" && "text-warning",
                        result.level === "danger" && "text-destructive"
                      )}
                    >
                      {result.score}/100
                    </span>
                  </div>
                  <Progress value={result.score} className="h-3" />
                </div>

                <div>
                  <Badge
                    className={cn(
                      "text-lg px-4 py-1",
                      result.level === "safe" && "bg-accent text-accent-foreground",
                      result.level === "caution" && "bg-warning text-warning-foreground",
                      result.level === "danger" && "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {result.level === "safe" && "SAFE TO PROCEED"}
                    {result.level === "caution" && "PROCEED WITH CAUTION"}
                    {result.level === "danger" && "HIGH RISK - CONSULT PHYSICIAN"}
                  </Badge>
                </div>

                {result.risks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Identified Risks</h4>
                    <ul className="space-y-2">
                      {result.risks.map((risk, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-warning flex-shrink-0" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-muted rounded-lg p-4 text-sm">
                  <p className="font-medium mb-1">Important Notice</p>
                  <p className="text-muted-foreground">
                    This is a preliminary assessment tool. Always consult with a healthcare
                    professional before starting any new medication.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Safety Assessment</CardTitle>
                <CardDescription>AI-powered medication safety analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Fill in the patient information and click Calculate to see the safety assessment
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

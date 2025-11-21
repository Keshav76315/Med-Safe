import { supabase } from "@/integrations/supabase/client";

export interface Drug {
  id: string;
  drug_id: string;
  name: string;
  batch_no: string;
  mfg_date: string;
  exp_date: string;
  manufacturer: string;
  type: "authentic" | "counterfeit" | "expired";
  risk_level: "low" | "medium" | "high" | "critical";
  active_ingredient: string;
  dosage_form: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientHistory {
  id: string;
  patient_id: string;
  medicine_name: string;
  dosage: string;
  start_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScanLog {
  id: string;
  scan_id: string;
  batch_no: string;
  drug_id?: string;
  status: "verified" | "counterfeit" | "expired" | "not_found";
  scanned_by?: string;
  duplicate_flag: boolean;
  timestamp: string;
}

export interface SafetyScoreRequest {
  age: number;
  conditions: string[];
  currentMedications: string[];
  newMedication: string;
}

export interface SafetyScoreResponse {
  score: number;
  level: "safe" | "caution" | "danger";
  risks: string[];
  recommendations: string[];
}

// Drug Verification
export async function verifyDrug(batchNo: string) {
  try {
    const { data: drug, error: drugError } = await supabase
      .from("drugs")
      .select("*")
      .eq("batch_no", batchNo)
      .single();

    if (drugError) {
      if (drugError.code === "PGRST116") {
        // No rows found
        return { status: "not_found" as const, drug: null };
      }
      throw drugError;
    }

    // Check for duplicate scans
    const { data: recentScans } = await supabase
      .from("scan_logs")
      .select("*")
      .eq("batch_no", batchNo)
      .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("timestamp", { ascending: false });

    const isDuplicate = (recentScans?.length || 0) > 0;

    // Determine status based on drug type
    let status: "verified" | "counterfeit" | "expired" = "verified";
    if (drug.type === "counterfeit") {
      status = "counterfeit";
    } else if (drug.type === "expired" || new Date(drug.exp_date) < new Date()) {
      status = "expired";
    }

    // Log the scan
    const scanLog = {
      scan_id: `SCAN-${Date.now()}`,
      batch_no: batchNo,
      drug_id: drug.id,
      status,
      duplicate_flag: isDuplicate,
      timestamp: new Date().toISOString(),
    };

    await supabase.from("scan_logs").insert(scanLog);

    return { status, drug, isDuplicate };
  } catch (error) {
    console.error("Error verifying drug:", error);
    throw error;
  }
}

// Patient History CRUD
export async function getPatientHistory(patientId: string) {
  const { data, error } = await supabase
    .from("patient_history")
    .select("*")
    .eq("patient_id", patientId)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addPatientHistory(history: Omit<PatientHistory, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("patient_history")
    .insert(history)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePatientHistory(id: string, history: Partial<PatientHistory>) {
  const { data, error } = await supabase
    .from("patient_history")
    .update(history)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePatientHistory(id: string) {
  const { error } = await supabase
    .from("patient_history")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Safety Score Calculation
export function calculateSafetyScore(request: SafetyScoreRequest): SafetyScoreResponse {
  let score = 100;
  const risks: string[] = [];
  const recommendations: string[] = [];

  // Age-based deductions
  if (request.age < 18) {
    score -= 10;
    risks.push("Pediatric patient - requires careful dosage monitoring");
    recommendations.push("Consult pediatrician for appropriate dosage");
  } else if (request.age > 65) {
    score -= 15;
    risks.push("Elderly patient - increased risk of adverse reactions");
    recommendations.push("Start with lower doses and monitor closely");
  }

  // Condition-based deductions
  const highRiskConditions = ["heart disease", "kidney disease", "liver disease", "diabetes"];
  request.conditions.forEach((condition) => {
    if (highRiskConditions.some((risk) => condition.toLowerCase().includes(risk))) {
      score -= 20;
      risks.push(`${condition} may interact with medication`);
      recommendations.push(`Monitor ${condition} symptoms closely`);
    }
  });

  // Medication interaction checks
  if (request.currentMedications.length > 3) {
    score -= 15;
    risks.push("Polypharmacy detected - increased interaction risk");
    recommendations.push("Review all medications with pharmacist");
  }

  // Common interaction patterns
  const anticoagulants = ["warfarin", "aspirin"];
  const hasAnticoagulant = request.currentMedications.some((med) =>
    anticoagulants.some((ac) => med.toLowerCase().includes(ac))
  );

  if (hasAnticoagulant) {
    score -= 25;
    risks.push("Potential bleeding risk with anticoagulant therapy");
    recommendations.push("Monitor INR levels regularly");
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Determine level
  let level: "safe" | "caution" | "danger";
  if (score >= 75) {
    level = "safe";
  } else if (score >= 50) {
    level = "caution";
  } else {
    level = "danger";
  }

  return { score, level, risks, recommendations };
}

// Statistics
export async function getDashboardStats() {
  try {
    const [drugsResult, historyResult, scansResult] = await Promise.all([
      supabase.from("drugs").select("*", { count: "exact" }),
      supabase.from("patient_history").select("*", { count: "exact" }),
      supabase.from("scan_logs").select("*", { count: "exact" }),
    ]);

    const { data: recentScans } = await supabase
      .from("scan_logs")
      .select("status")
      .order("timestamp", { ascending: false })
      .limit(100);

    const counterfeitCount = recentScans?.filter((s) => s.status === "counterfeit").length || 0;
    const expiredCount = recentScans?.filter((s) => s.status === "expired").length || 0;
    const verifiedCount = recentScans?.filter((s) => s.status === "verified").length || 0;

    return {
      totalDrugs: drugsResult.count || 0,
      totalPatients: historyResult.count || 0,
      totalScans: scansResult.count || 0,
      counterfeitDetected: counterfeitCount,
      expiredDetected: expiredCount,
      verifiedScans: verifiedCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

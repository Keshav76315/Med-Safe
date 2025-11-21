import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Convert Google Drive view URL to direct download URL
function convertGoogleDriveUrl(url: string): string {
  const fileIdMatch = url.match(/\/d\/([^\/]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}&confirm=t`;
  }
  return url;
}

// Fetch JSON file from URL with retry logic
async function fetchJsonFile(url: string, retries = 3): Promise<any> {
  console.log('Fetching JSON file from:', url);
  const directUrl = convertGoogleDriveUrl(url);
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(directUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Deno)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      console.log(`Successfully fetched and parsed JSON file`);
      return jsonData;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw new Error('Failed to fetch JSON file after retries');
}

interface DrugData {
  drug_id?: string;
  name: string;
  batch_no?: string;
  manufacturer: string;
  active_ingredient: string;
  dosage_form: string;
  mfg_date?: string;
  exp_date?: string;
  type?: string;
  risk_level?: string;
}

function generateBatchNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let batch = 'BATCH-';
  for (let i = 0; i < 8; i++) {
    batch += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return batch;
}

function classifyRiskLevel(form: string, strength: string): string {
  const formLower = form.toLowerCase();
  const strengthLower = strength.toLowerCase();
  
  // Critical: Injectable, high-potency drugs
  if (formLower.includes('injection') || formLower.includes('injectable')) {
    return 'critical';
  }
  
  // High: Strong medications, controlled substances
  if (strengthLower.includes('mg/ml') || formLower.includes('infusion')) {
    return 'high';
  }
  
  // Medium: Prescription tablets, capsules
  if (formLower.includes('tablet') || formLower.includes('capsule')) {
    return 'medium';
  }
  
  // Low: Topical, ophthalmic, OTC-like
  if (formLower.includes('topical') || formLower.includes('ophthalmic') || 
      formLower.includes('ointment') || formLower.includes('cream')) {
    return 'low';
  }
  
  return 'medium'; // Default
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestData = await req.json();
    console.log('Received import request');
    
    if (!requestData.jsonUrl) {
      throw new Error('Please provide a JSON file URL: jsonUrl');
    }
    
    console.log('Fetching JSON file from URL...');
    const jsonData = await fetchJsonFile(requestData.jsonUrl);
    
    // Check if it's an array of drugs or needs transformation
    let drugs: DrugData[] = [];
    
    if (Array.isArray(jsonData)) {
      console.log(`Processing ${jsonData.length} drug entries from JSON...`);
      drugs = jsonData.slice(0, 10000).map((item, index) => {
        // Generate default dates if not provided
        const mfgDate = item.mfg_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const expDate = item.exp_date || new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        return {
          drug_id: item.drug_id || `IMPORT-${Date.now()}-${index}`,
          name: item.name || 'Unknown Drug',
          batch_no: item.batch_no || generateBatchNumber(),
          manufacturer: item.manufacturer || 'Unknown Manufacturer',
          active_ingredient: item.active_ingredient || 'Unknown',
          dosage_form: item.dosage_form || 'Unknown',
          mfg_date: mfgDate,
          exp_date: expDate,
          type: item.type || 'authentic',
          risk_level: item.risk_level || classifyRiskLevel(item.dosage_form || '', '')
        };
      });
    } else {
      throw new Error('JSON file must contain an array of drug objects');
    }

    console.log(`Importing ${drugs.length} drugs into database...`);

    // Bulk insert in batches of 1000
    const batchSize = 1000;
    let imported = 0;
    
    for (let i = 0; i < drugs.length; i += batchSize) {
      const batch = drugs.slice(i, i + batchSize);
      
      const { error } = await supabaseClient
        .from('drugs')
        .upsert(batch, { onConflict: 'drug_id' });

      if (error) {
        console.error(`Batch ${i / batchSize + 1} error:`, error);
        throw error;
      }
      
      imported += batch.length;
      console.log(`Imported ${imported}/${drugs.length} drugs`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported: drugs.length,
        message: `Successfully imported ${drugs.length} FDA-approved drugs`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

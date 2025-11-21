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
    
    let jsonData: any;
    
    // Accept either jsonUrl (fetch from URL) or jsonData (raw data)
    if (requestData.jsonData) {
      console.log('Using provided JSON data');
      jsonData = requestData.jsonData;
    } else if (requestData.jsonUrl) {
      console.log('Fetching JSON file from URL...');
      jsonData = await fetchJsonFile(requestData.jsonUrl);
    } else {
      throw new Error('Please provide either jsonUrl or jsonData');
    }
    
    // Handle nested results structure (OpenFDA format)
    if (jsonData.results && Array.isArray(jsonData.results)) {
      jsonData = jsonData.results;
    }
    
    // Check if it's an array of drugs or needs transformation
    let drugs: DrugData[] = [];
    
    if (Array.isArray(jsonData)) {
      console.log(`Processing ${jsonData.length} drug entries from JSON...`);
      drugs = jsonData.slice(0, 10000).map((item, index) => {
        // Handle active ingredients - can be array or string
        let activeIngredient = 'Unknown';
        if (item.active_ingredients && Array.isArray(item.active_ingredients)) {
          activeIngredient = item.active_ingredients
            .map((ing: any) => `${ing.name} ${ing.strength}`)
            .join('; ');
        } else if (item.active_ingredient) {
          activeIngredient = item.active_ingredient;
        } else if (item.generic_name) {
          activeIngredient = item.generic_name;
        }
        
        // Get manufacturer name from various possible fields
        const manufacturer = item.labeler_name || 
                           item.manufacturer || 
                           item.openfda?.manufacturer_name?.[0] || 
                           'Unknown Manufacturer';
        
        // Get drug name from various possible fields
        const name = item.brand_name || 
                    item.name || 
                    item.generic_name || 
                    'Unknown Drug';
        
        // Get drug ID from various possible fields
        const drugId = item.product_ndc || 
                      item.drug_id || 
                      `FDA-${Math.random().toString(36).substr(2, 9)}`;
        
        const dosageForm = item.dosage_form || 'Unknown';
        
        // Generate default dates if not provided
        const mfgDate = item.mfg_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const expDate = item.exp_date || new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        return {
          drug_id: drugId,
          name: name,
          batch_no: item.batch_no || generateBatchNumber(),
          manufacturer: manufacturer,
          active_ingredient: activeIngredient,
          dosage_form: dosageForm,
          mfg_date: mfgDate,
          exp_date: expDate,
          type: item.type || 'authentic',
          risk_level: item.risk_level || classifyRiskLevel(dosageForm, activeIngredient)
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

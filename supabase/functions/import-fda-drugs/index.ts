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

// Fetch file from URL with retry logic
async function fetchFile(url: string, retries = 3): Promise<string> {
  console.log('Fetching file from:', url);
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
      
      const text = await response.text();
      console.log(`Successfully fetched file (${text.length} bytes)`);
      return text;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw new Error('Failed to fetch file after retries');
}

interface Product {
  ApplNo: string;
  ProductNo: string;
  Form: string;
  Strength: string;
  DrugName: string;
  ActiveIngredient: string;
  MarketingStatusID?: string;
}

interface Application {
  ApplNo: string;
  SponsorName: string;
}

function parseTSV(content: string): any[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');
  
  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || '';
    });
    return obj;
  });
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
    console.log('Received import request:', Object.keys(requestData));
    
    let applicationsData: string;
    let productsData: string;
    let marketingStatusData: string;
    
    // Fetch individual files from URLs
    if (!requestData.applicationsUrl || !requestData.productsUrl || !requestData.marketingStatusUrl) {
      throw new Error('Please provide all three file URLs: applicationsUrl, productsUrl, marketingStatusUrl');
    }
    
    console.log('Fetching individual files from URLs...');
    [applicationsData, productsData, marketingStatusData] = await Promise.all([
      fetchFile(requestData.applicationsUrl),
      fetchFile(requestData.productsUrl),
      fetchFile(requestData.marketingStatusUrl)
    ]);

    console.log('Parsing FDA data files...');
    const applications: Application[] = parseTSV(applicationsData);
    const products: Product[] = parseTSV(productsData);
    const marketingStatuses = parseTSV(marketingStatusData);

    // Create a map for quick lookups
    const applicationMap = new Map(
      applications.map(app => [app.ApplNo, app])
    );

    const marketingStatusMap = new Map(
      marketingStatuses.map(ms => [`${ms.ApplNo}-${ms.ProductNo}`, ms.MarketingStatusID])
    );

    console.log(`Processing ${products.length} products...`);

    // Transform products to drugs format
    const drugs = products
      .filter(product => {
        const key = `${product.ApplNo}-${product.ProductNo}`;
        const statusId = marketingStatusMap.get(key);
        // Only include Prescription (1) and OTC (2) drugs, exclude Discontinued (3)
        return statusId === '1' || statusId === '2';
      })
      .slice(0, 10000) // Limit to first 10,000 for initial import
      .map(product => {
        const application = applicationMap.get(product.ApplNo);
        const mfgDate = new Date();
        mfgDate.setFullYear(mfgDate.getFullYear() - 1);
        
        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 2);

        return {
          drug_id: `FDA-${product.ApplNo}-${product.ProductNo}`,
          name: product.DrugName || 'Unknown Drug',
          batch_no: generateBatchNumber(),
          manufacturer: application?.SponsorName || 'Unknown Manufacturer',
          active_ingredient: product.ActiveIngredient || 'Unknown',
          dosage_form: product.Form || 'Unknown',
          mfg_date: mfgDate.toISOString().split('T')[0],
          exp_date: expDate.toISOString().split('T')[0],
          type: 'authentic',
          risk_level: classifyRiskLevel(product.Form || '', product.Strength || '')
        };
      });

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

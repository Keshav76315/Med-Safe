import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a medical prescription OCR expert. Extract prescription information with 100% accuracy.

Extract and structure:
1. Patient information (name, age, gender)
2. Doctor information (name, license, clinic)
3. Medications with:
   - Generic name and brand name
   - Dosage (strength)
   - Form (tablet, syrup, injection, etc.)
   - Frequency (e.g., "twice daily", "every 6 hours")
   - Duration (e.g., "7 days", "2 weeks")
   - Instructions (e.g., "take with food", "before bed")
4. Date prescribed
5. Refills allowed

Be extremely careful with dosages and medication names - these are critical for patient safety.`;

    const userPrompt = `Extract all prescription details from this image. Return structured data in JSON format:
{
  "patient": {
    "name": "string or null",
    "age": "string or null",
    "gender": "string or null"
  },
  "doctor": {
    "name": "string or null",
    "license": "string or null",
    "clinic": "string or null"
  },
  "medications": [
    {
      "name": "string",
      "genericName": "string or null",
      "dosage": "string",
      "form": "string",
      "frequency": "string",
      "duration": "string",
      "instructions": "string or null"
    }
  ],
  "prescriptionDate": "string or null",
  "refills": "string or null",
  "confidence": "high|medium|low"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    console.log('OCR extraction successful:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Prescription OCR error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

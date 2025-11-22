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
    const { age, conditions, currentMedications, newMedication } = await req.json();

    // Input validation
    if (typeof age !== 'number' || age < 0 || age > 150) {
      return new Response(
        JSON.stringify({ error: 'Invalid age (must be 0-150)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(conditions) || conditions.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid conditions (max 50)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(currentMedications) || currentMedications.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid medications list (max 50)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newMedication || typeof newMedication !== 'string' || newMedication.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid medication name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedConditions = conditions
      .filter(c => typeof c === 'string')
      .map(c => c.trim().slice(0, 200));
    
    const sanitizedMedications = currentMedications
      .filter(m => typeof m === 'string')
      .map(m => m.trim().slice(0, 200));
    
    const sanitizedNewMed = newMedication.trim().slice(0, 200);

    console.log("Safety Score Request:", { age, conditions: sanitizedConditions, currentMedications: sanitizedMedications, newMedication: sanitizedNewMed });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert pharmacist and medical safety advisor. Analyze the patient's medication safety profile and provide:
1. A safety score from 0-100 (where 100 is safest)
2. Safety level: "safe" (score 75-100), "caution" (50-74), or "danger" (0-49)
3. Specific risks identified
4. Actionable recommendations

Consider:
- Drug interactions between current and new medications
- Age-related contraindications
- Medical condition contraindications
- Common side effects and adverse reactions
- Dosage concerns

Be specific and professional. Always recommend consulting a healthcare professional for final decisions.`;

    const userPrompt = `Patient Profile:
- Age: ${age} years old
- Medical Conditions: ${sanitizedConditions.length > 0 ? sanitizedConditions.join(', ') : 'None reported'}
- Current Medications: ${sanitizedMedications.length > 0 ? sanitizedMedications.join(', ') : 'None'}

New Medication to Evaluate: ${sanitizedNewMed}

Provide a comprehensive safety assessment in JSON format with this structure:
{
  "score": <number 0-100>,
  "level": "<safe|caution|danger>",
  "risks": ["<risk 1>", "<risk 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", data);

    const aiContent = data.choices[0].message.content;
    const result = JSON.parse(aiContent);

    console.log("Parsed Result:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in safety-score-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        score: 50,
        level: "caution",
        risks: ["Unable to complete safety assessment"],
        recommendations: ["Please consult a healthcare professional"]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
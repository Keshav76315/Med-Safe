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
    const { medications, checkFood = false, checkAlcohol = false } = await req.json();
    
    if (!medications || !Array.isArray(medications) || medications.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least 2 medications are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const medicationList = medications.join(', ');
    
    const systemPrompt = `You are a medical drug interaction expert. Analyze drug interactions with extreme accuracy and provide actionable medical guidance.

CRITICAL RULES:
1. Always classify interactions by severity: SEVERE (do not combine), MODERATE (consult doctor), MINOR (monitor), or NO_INTERACTION
2. Explain the mechanism of interaction clearly
3. Provide specific monitoring recommendations
4. Suggest safer alternatives when severe interactions exist
5. Include food and alcohol interactions when requested
6. Be conservative - err on the side of caution`;

    const userPrompt = `Analyze drug interactions for: ${medicationList}

${checkFood ? 'Include food interactions and dietary restrictions.' : ''}
${checkAlcohol ? 'Include alcohol interaction warnings.' : ''}

Respond in this JSON format:
{
  "interactions": [
    {
      "drugs": ["Drug A", "Drug B"],
      "severity": "SEVERE|MODERATE|MINOR",
      "description": "Clear explanation of interaction mechanism",
      "effects": ["Effect 1", "Effect 2"],
      "recommendations": ["Specific action 1", "Specific action 2"]
    }
  ],
  "foodInteractions": [
    {
      "drug": "Drug name",
      "foods": ["Food 1", "Food 2"],
      "recommendation": "Specific dietary guidance"
    }
  ],
  "alcoholInteraction": {
    "severity": "SEVERE|MODERATE|MINOR|NONE",
    "description": "Alcohol interaction details",
    "recommendation": "Specific guidance"
  },
  "alternatives": [
    {
      "instead_of": "Drug name",
      "consider": ["Alternative 1", "Alternative 2"],
      "reason": "Why this alternative is safer"
    }
  ],
  "overall_safety": "SAFE|CAUTION|DANGER",
  "summary": "Brief overall assessment"
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
        temperature: 0.3,
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
          JSON.stringify({ error: 'Service temporarily unavailable. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Drug interaction check error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

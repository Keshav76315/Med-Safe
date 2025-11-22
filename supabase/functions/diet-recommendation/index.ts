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
    const { dailyMeals, currentWeight, height, targetWeight, duration, goal } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const bmi = currentWeight / ((height / 100) ** 2);
    const targetBMI = targetWeight ? targetWeight / ((height / 100) ** 2) : null;

    const systemPrompt = `You are an expert nutritionist and dietitian. Provide personalized, safe, and evidence-based diet recommendations. Focus on balanced nutrition, sustainable habits, and realistic goals. Always prioritize health and safety.`;

    const userPrompt = `
Create a comprehensive personalized diet recommendation based on the following information:

Current Measurements:
- Weight: ${currentWeight} kg
- Height: ${height} cm
- BMI: ${bmi.toFixed(1)}

Current Diet:
${dailyMeals}

Goals:
${goal}

${targetWeight ? `Target Weight: ${targetWeight} kg (BMI: ${targetBMI?.toFixed(1)})` : ''}
${duration ? `Time Frame: ${duration} weeks` : ''}

Please provide:
1. Analysis of current diet
2. Specific nutritional recommendations
3. Suggested meal plan structure
4. Foods to include and avoid
5. Portion guidance
6. Important health considerations
7. Tips for achieving their goals safely

Keep the recommendation practical, actionable, and encouraging.`;

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendation = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ recommendation }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in diet-recommendation function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

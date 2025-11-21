import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MistralRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  systemPrompt?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      model = "mistral-large-latest",
      temperature = 0.7,
      max_tokens = 1000,
      systemPrompt = "You are a helpful AI assistant."
    }: MistralRequest = await req.json();

    console.log("Mistral AI request:", { prompt, model, temperature });

    const mistralApiKey = Deno.env.get("MISTRAL_API_KEY");
    if (!mistralApiKey) {
      throw new Error("MISTRAL_API_KEY not configured");
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Mistral API error:", errorData);
      throw new Error(`Mistral API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log("Mistral AI response received successfully");

    return new Response(
      JSON.stringify({
        response: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in mistral-ai function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

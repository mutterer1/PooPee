import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisResult {
  bristolScale: string;
  confidence: number;
  estimatedDuration: number | null;
  suggestedUrgency: number;
  suggestedSatisfaction: number;
  detectedSymptoms: string[];
  notes: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { photoBase64 } = await req.json();

    if (!photoBase64) {
      return new Response(
        JSON.stringify({ error: "Photo data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `You are a medical AI assistant analyzing a stool sample photo. Based on the Bristol Stool Scale, analyze this image and provide:

1. Bristol Scale Type (type_1 through type_7):
   - type_1: Separate hard lumps, like nuts (hard to pass)
   - type_2: Sausage-shaped but lumpy
   - type_3: Like a sausage but with cracks on surface
   - type_4: Like a sausage or snake, smooth and soft (IDEAL)
   - type_5: Soft blobs with clear-cut edges
   - type_6: Fluffy pieces with ragged edges, mushy
   - type_7: Watery, no solid pieces, entirely liquid

2. Confidence level (0-100)
3. Estimated duration in seconds (if determinable from characteristics)
4. Suggested urgency level (1-5, where 5 is most urgent)
5. Suggested satisfaction rating (1-5, where 5 is most satisfying)
6. Detected symptoms from: Pain, Bloating, Cramping, Straining, Mucus, Blood
7. Clinical notes

Respond ONLY with valid JSON in this exact format:
{
  "bristolScale": "type_X",
  "confidence": 85,
  "estimatedDuration": 120,
  "suggestedUrgency": 3,
  "suggestedSatisfaction": 4,
  "detectedSymptoms": ["Straining"],
  "notes": "Brief clinical observation"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${photoBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze image" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No analysis returned" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const analysisResult: AnalysisResult = JSON.parse(content);

    return new Response(JSON.stringify({ success: true, analysis: analysisResult }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in analyze-stool-photo:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface AnalysisRequest {
  user_message: string;
  analysis_type: "meal" | "stool" | "general";
  conversation_history?: { role: "user" | "assistant"; content: string }[];
}

interface AnalysisResponse {
  success: boolean;
  message: string;
  analysis?: {
    type: string;
    insights: string[];
    recommendations: string[];
    follow_up_question?: string;
  };
  error?: string;
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = "gpt-3.5-turbo";

const SYSTEM_PROMPTS = {
  meal: `You are a friendly nutritional analysis assistant. When users describe meals, provide:
- Estimated macronutrient breakdown
- Potential digestive impact
- Hydration considerations
- Positive reinforcement for healthy choices
Keep responses concise (2-3 sentences) and encouraging.`,

  stool: `You are a supportive digestive health assistant. When users describe stool characteristics, provide:
- Bristol scale assessment if applicable
- Possible dietary or hydration factors
- Suggestions for digestive wellness
- Encouraging support
Keep responses brief and supportive. Never diagnose medical conditions.`,

  general: `You are a wellness tracking assistant. Help users:
- Understand their health patterns
- Provide encouragement for consistent tracking
- Ask clarifying questions
- Suggest tracking improvements
Be warm, supportive, and practical.`,
};

async function callOpenAIAPI(
  userMessage: string,
  analysisType: "meal" | "stool" | "general",
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[analysisType];

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...conversationHistory,
    { role: "user" as const, content: userMessage },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: messages,
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function parseAnalysis(content: string): {
  insights: string[];
  recommendations: string[];
  follow_up_question?: string;
} {
  const lines = content.split("\n").filter((line) => line.trim());

  const insights: string[] = [];
  const recommendations: string[] = [];
  let followUp: string | undefined;

  lines.forEach((line) => {
    if (
      line.toLowerCase().includes("recommend") ||
      line.toLowerCase().includes("suggest") ||
      line.toLowerCase().includes("try")
    ) {
      recommendations.push(line.trim());
    } else if (
      line.toLowerCase().includes("notice") ||
      line.toLowerCase().includes("interesting") ||
      line.toLowerCase().includes("observe")
    ) {
      insights.push(line.trim());
    } else if (line.includes("?")) {
      followUp = line.trim();
    } else {
      insights.push(line.trim());
    }
  });

  return {
    insights: insights.length > 0 ? insights : [content],
    recommendations,
    follow_up_question: followUp,
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OpenAI API key not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const request: AnalysisRequest = await req.json();
    const { user_message, analysis_type, conversation_history = [] } = request;

    if (!user_message || !analysis_type) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: user_message, analysis_type",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = await callOpenAIAPI(
      user_message,
      analysis_type,
      conversation_history
    );

    const analysis = parseAnalysis(aiResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: aiResponse,
        analysis: {
          type: analysis_type,
          insights: analysis.insights,
          recommendations: analysis.recommendations,
          follow_up_question: analysis.follow_up_question,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

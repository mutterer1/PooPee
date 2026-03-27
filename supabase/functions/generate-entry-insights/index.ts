import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EntryInsight {
  insight_type: 'immediate' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  severity: 'normal' | 'attention' | 'positive';
  actionable_tips: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { entryType, entryId, entryData } = await req.json();

    if (!entryType || !entryId || !entryData) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
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

    const insights = await generateInsights(entryType, entryData, user.id, supabase);

    const insightsToStore = insights.map(insight => ({
      user_id: user.id,
      entry_type: entryType,
      entry_id: entryId,
      insight_type: insight.insight_type,
      title: insight.title,
      description: insight.description,
      severity: insight.severity,
      actionable_tips: insight.actionable_tips,
    }));

    const { data: storedInsights, error: insertError } = await supabase
      .from('entry_insights')
      .insert(insightsToStore)
      .select();

    if (insertError) {
      console.error('Error storing insights:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, insights: storedInsights }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in generate-entry-insights:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function generateInsights(
  entryType: string,
  entryData: any,
  userId: string,
  supabase: any
): Promise<EntryInsight[]> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

  const historicalData = await fetchHistoricalData(entryType, userId, supabase);

  let prompt = '';

  if (entryType === 'bowel_movement') {
    prompt = `You are a gastroenterology health assistant. Analyze this bowel movement entry and provide insights:

Current Entry:
- Bristol Scale: ${entryData.bristol_scale}
- Duration: ${entryData.duration_seconds || 'Not recorded'} seconds
- Urgency: ${entryData.urgency_level}/5
- Satisfaction: ${entryData.satisfaction_rating}/5
- Symptoms: ${entryData.symptoms?.join(', ') || 'None'}
- Notes: ${entryData.notes || 'None'}

Historical Context (last 30 days):
${historicalData.summary}

Provide 2-3 insights in JSON format as an array. Include:
1. An IMMEDIATE insight about this specific entry (what this entry means right now)
2. A PATTERN insight if historical data shows trends (only if you have enough data)
3. A RECOMMENDATION with actionable tips

Format each insight as:
{
  "insight_type": "immediate" | "pattern" | "recommendation",
  "title": "Brief title (5-7 words)",
  "description": "Detailed explanation (2-3 sentences)",
  "severity": "normal" | "attention" | "positive",
  "actionable_tips": ["tip 1", "tip 2", "tip 3"]
}

Be supportive, medical, and practical. Focus on what the user can do today.`;
  } else if (entryType === 'urination') {
    prompt = `You are a urological health assistant. Analyze this urination entry:

Current Entry:
- Volume: ${entryData.volume_estimate}ml (estimate)
- Color: ${entryData.color}
- Flow: ${entryData.flow_characteristic}
- Urgency: ${entryData.urgency_level}/5
- Frequency: ${entryData.frequency_level}/5
- Nighttime: ${entryData.is_nighttime ? 'Yes' : 'No'}
- Symptoms: ${entryData.symptoms?.join(', ') || 'None'}

Historical Context:
${historicalData.summary}

Provide 2-3 insights in the same JSON format. Focus on hydration, frequency patterns, and health indicators.`;
  } else if (entryType === 'meal') {
    prompt = `You are a nutrition health assistant. Analyze this meal entry:

Current Entry:
- Type: ${entryData.meal_type}
- Description: ${entryData.description}
- Calories: ${entryData.calories || 'Not recorded'}
- Macros: ${entryData.protein_grams || 0}g protein, ${entryData.carbs_grams || 0}g carbs, ${entryData.fat_grams || 0}g fat

Historical Context:
${historicalData.summary}

Provide 2-3 insights focusing on nutrition balance, meal timing, and digestive impact.`;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a health insights assistant. Always respond with valid JSON array format. Be encouraging, practical, and medically informed."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate insights from OpenAI');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No insights generated');
  }

  const insights: EntryInsight[] = JSON.parse(content);
  return insights;
}

async function fetchHistoricalData(entryType: string, userId: string, supabase: any) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (entryType === 'bowel_movement') {
    const { data, error } = await supabase
      .from('bowel_movements')
      .select('bristol_scale, urgency_level, satisfaction_rating, symptoms, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data || data.length === 0) {
      return { summary: 'No historical data available. This is your first entry or you have limited history.' };
    }

    const bristolCounts = data.reduce((acc: any, entry: any) => {
      acc[entry.bristol_scale] = (acc[entry.bristol_scale] || 0) + 1;
      return acc;
    }, {});

    const avgUrgency = data.reduce((sum: number, e: any) => sum + (e.urgency_level || 0), 0) / data.length;
    const avgSatisfaction = data.reduce((sum: number, e: any) => sum + (e.satisfaction_rating || 0), 0) / data.length;

    return {
      summary: `Total entries: ${data.length}. Most common: ${Object.entries(bristolCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0]}. Avg urgency: ${avgUrgency.toFixed(1)}/5. Avg satisfaction: ${avgSatisfaction.toFixed(1)}/5.`
    };
  } else if (entryType === 'urination') {
    const { data, error } = await supabase
      .from('urinations')
      .select('volume_estimate, urgency_level, is_nighttime, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      return { summary: 'No historical data available.' };
    }

    const nighttimeCount = data.filter((e: any) => e.is_nighttime).length;
    const avgVolume = data.reduce((sum: number, e: any) => sum + (e.volume_estimate || 0), 0) / data.length;

    return {
      summary: `Total entries: ${data.length}. Nighttime: ${nighttimeCount}. Avg volume: ${avgVolume.toFixed(0)}ml.`
    };
  } else {
    const { data, error } = await supabase
      .from('meals')
      .select('meal_type, calories, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data || data.length === 0) {
      return { summary: 'No historical meal data available.' };
    }

    const avgCalories = data.reduce((sum: number, e: any) => sum + (e.calories || 0), 0) / data.length;

    return {
      summary: `Total meals logged: ${data.length}. Avg calories: ${avgCalories.toFixed(0)}.`
    };
  }
}

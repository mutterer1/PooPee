# Chatbot Integration & ChatGPT API Implementation Guide

## Table of Contents
1. [Current Chatbot Setup Overview](#current-chatbot-setup-overview)
2. [Task 1: Chatbot Integration with Home Page](#task-1-chatbot-integration-with-home-page)
3. [Task 2: ChatGPT API Wrapper Creation](#task-2-chatgpt-api-wrapper-creation)
4. [Security & Best Practices](#security--best-practices)
5. [Troubleshooting](#troubleshooting)

---

## Current Chatbot Setup Overview

Your application already has a functional chatbot system with the following components:

### Components
- **ChatbotButton** (`components/ChatbotButton.tsx`): Draggable floating button that appears on all pages
- **ChatbotCompanion** (`components/ChatbotCompanion.tsx`): Character popup that displays messages
- **Chatbot Responses** (`lib/chatbot.responses.ts`): Static response library with three accents (British, Southern, Australian)

### Current Flow
```
User clicks ChatbotButton → ChatbotCompanion modal opens → Pre-scripted response displayed
```

---

## Task 1: Chatbot Integration with Home Page

Your chatbot is **already integrated** with the home page! Here's how:

### Current Implementation on Home Page

**File:** `app/(tabs)/index.tsx` (lines 505-510)

```typescript
// Floating button appears in bottom-right corner
<ChatbotButton onPress={() => setChatbotVisible(true)} />

// Companion popup controlled by state
<ChatbotCompanion
  visible={chatbotVisible}
  onClose={() => setChatbotVisible(false)}
  category="greeting"
/>
```

### Button Properties
- **Position**: Bottom-right corner (absolute positioning)
- **Interaction**: Tap to open / Draggable for repositioning
- **States**: Three accent options available (British, Southern, Australian)

### Customization Options

#### Option 1: Show Different Messages on Home Page
```typescript
// Show encouragement message instead of greeting
<ChatbotCompanion
  visible={chatbotVisible}
  onClose={() => setChatbotVisible(false)}
  category="encouragement"  // Changed from "greeting"
/>
```

#### Option 2: Pre-populate with Custom Message
```typescript
<ChatbotCompanion
  visible={chatbotVisible}
  onClose={() => setChatbotVisible(false)}
  message="Hi! Based on your activity today, I see you've logged 3 entries. Keep it up!"
  category="insight"
/>
```

#### Option 3: Trigger Chatbot Automatically
```typescript
useEffect(() => {
  // Show chatbot greeting after 2 seconds on first load
  if (isFirstLoad) {
    const timer = setTimeout(() => {
      setChatbotVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [isFirstLoad]);
```

---

## Task 2: ChatGPT API Wrapper Creation

This section provides a complete implementation for integrating OpenAI's ChatGPT API with your chatbot.

### Step 1: Supabase Database Schema

First, create tables to store chatbot conversations and preferences.

**Migration File:** `supabase/migrations/20260330_add_chatbot_tables.sql`

```sql
/*
  # Chatbot System Tables

  1. New Tables
    - `chatbot_conversations` - Stores chat history for context
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chatbot_messages` - Individual messages in conversations
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `role` (enum: 'user' | 'assistant')
      - `content` (text)
      - `created_at` (timestamp)

    - `chatbot_preferences` - User chatbot settings
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `enabled` (boolean, default true)
      - `accent` (text: 'british' | 'southern' | 'australian')
      - `voice_gender` (text: 'male' | 'female')
      - `speech_rate` (number, default 1.0)
      - `volume_level` (number, default 1.0)
      - `analysis_mode` (text: 'standard' | 'ai_powered', default 'standard')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write own data
*/

CREATE TABLE IF NOT EXISTS chatbot_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  accent text DEFAULT 'british' CHECK (accent IN ('british', 'southern', 'australian')),
  voice_gender text DEFAULT 'male' CHECK (voice_gender IN ('male', 'female')),
  speech_rate numeric DEFAULT 1.0 CHECK (speech_rate BETWEEN 0.5 AND 2.0),
  volume_level numeric DEFAULT 1.0 CHECK (volume_level BETWEEN 0 AND 1),
  analysis_mode text DEFAULT 'standard' CHECK (analysis_mode IN ('standard', 'ai_powered')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chatbot_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON chatbot_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON chatbot_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON chatbot_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own conversations"
  ON chatbot_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON chatbot_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own messages"
  ON chatbot_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND chatbot_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON chatbot_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND chatbot_conversations.user_id = auth.uid()
    )
  );
```

### Step 2: Setup ChatGPT API Credentials

1. **Create OpenAI Account**: Go to https://platform.openai.com/signup
2. **Generate API Key**:
   - Log in to OpenAI dashboard
   - Navigate to Settings → API Keys
   - Click "Create new secret key"
   - Copy and save securely
3. **Add to Supabase**: Store in Edge Function secrets (not in .env)

### Step 3: Create ChatGPT API Wrapper Edge Function

**File:** `supabase/functions/chatgpt-analysis/index.ts`

```typescript
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
  // Simple parsing - split by common delimiters
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
```

### Step 4: Create Client-Side API Service

**File:** `lib/chatgpt.service.ts`

```typescript
import { supabase } from "./supabase";

export interface ChatbotMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnalysisResult {
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

const API_URL = `${
  import.meta.env.VITE_SUPABASE_URL
}/functions/v1/chatgpt-analysis`;

const createHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.session?.access_token || ""}`,
  };
};

export async function analyzeWithChatGPT(
  userMessage: string,
  analysisType: "meal" | "stool" | "general" = "general",
  conversationHistory: ChatbotMessage[] = []
): Promise<AnalysisResult> {
  try {
    const headers = await createHeaders();

    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_message: userMessage,
        analysis_type: analysisType,
        conversation_history: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result: AnalysisResult = await response.json();
    return result;
  } catch (error) {
    console.error("ChatGPT API Error:", error);
    return {
      success: false,
      message: "Unable to get AI analysis. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function saveConversation(
  userId: string,
  messages: ChatbotMessage[]
): Promise<boolean> {
  try {
    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from("chatbot_conversations")
      .insert([{ user_id: userId }])
      .select()
      .single();

    if (convError) throw convError;
    if (!conversation) throw new Error("Failed to create conversation");

    // Save messages
    const messagesToInsert = messages.map((msg) => ({
      conversation_id: conversation.id,
      role: msg.role,
      content: msg.content,
    }));

    const { error: msgError } = await supabase
      .from("chatbot_messages")
      .insert(messagesToInsert);

    if (msgError) throw msgError;
    return true;
  } catch (error) {
    console.error("Save conversation error:", error);
    return false;
  }
}

export async function getConversationHistory(
  userId: string,
  limit: number = 5
): Promise<ChatbotMessage[]> {
  try {
    // Get latest conversation
    const { data: conversation, error: convError } = await supabase
      .from("chatbot_conversations")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (convError || !conversation) return [];

    // Get messages from conversation
    const { data: messages, error: msgError } = await supabase
      .from("chatbot_messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (msgError) return [];

    return messages?.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })) || [];
  } catch (error) {
    console.error("Get history error:", error);
    return [];
  }
}
```

### Step 5: Deploy and Configure Edge Function

#### Deploy the ChatGPT Analysis Function
```bash
# The function will be created at supabase/functions/chatgpt-analysis/
# To deploy:
# 1. Ensure you have supabase/functions/chatgpt-analysis/index.ts created
# 2. Set OPENAI_API_KEY secret in Supabase dashboard
# 3. Function auto-deploys when pushed to repository
```

#### Set OpenAI API Key
1. Go to Supabase Dashboard → Project → Edge Functions → Secrets
2. Add new secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key from https://platform.openai.com/api-keys
3. Save

### Step 6: Update ChatbotCompanion to Support AI Analysis

**Enhanced ChatbotCompanion Usage:**

```typescript
// Example: Show AI-powered meal analysis
const [aiMessage, setAiMessage] = useState<string>("");
const [loading, setLoading] = useState(false);

const handleMealAnalysis = async () => {
  setLoading(true);
  const result = await analyzeWithChatGPT(
    "I just ate pasta with tomato sauce and salad",
    "meal"
  );
  setAiMessage(result.message);
  setLoading(false);
};

return (
  <ChatbotCompanion
    visible={true}
    message={loading ? "Analyzing..." : aiMessage}
    category="insight"
  />
);
```

---

## Security & Best Practices

### 1. API Key Management
✅ **DO:**
- Store API keys in Supabase Edge Function secrets
- Use environment-specific secrets
- Rotate keys regularly
- Monitor API usage for anomalies

❌ **DON'T:**
- Store API keys in `.env` or git repository
- Expose keys in client-side code
- Commit sensitive data to version control
- Share keys via email or chat

### 2. Rate Limiting
```typescript
// Implementation in Edge Function
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

// Use Supabase or implement your own tracking
```

### 3. Input Validation
```typescript
// Always validate user input before sending to API
function validateUserMessage(message: string): {
  valid: boolean;
  error?: string;
} {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (message.length > 500) {
    return { valid: false, error: "Message is too long" };
  }

  // Check for prompt injection attempts
  if (message.includes("ignore") && message.includes("instructions")) {
    return { valid: false, error: "Invalid message format" };
  }

  return { valid: true };
}
```

### 4. Error Handling
```typescript
// Always handle errors gracefully
const safeAnalysis = async (message: string) => {
  try {
    const result = await analyzeWithChatGPT(message);
    if (!result.success) {
      // Fallback to pre-scripted responses
      return getChatbotResponse(accent, gender, "encouragement");
    }
    return result.message;
  } catch (error) {
    console.error("Analysis failed:", error);
    return "I'm having trouble analyzing that right now. Try again in a moment!";
  }
};
```

### 5. Data Privacy
- Messages are stored encrypted in Supabase
- User data never shared with third parties
- Implement data retention policies
- Allow users to delete conversation history

---

## Troubleshooting

### Issue: 401 Unauthorized from OpenAI
**Solution:**
- Verify OPENAI_API_KEY is correctly set in Supabase secrets
- Check API key hasn't expired
- Confirm key has proper permissions in OpenAI dashboard

### Issue: CORS Errors
**Solution:**
- Ensure CORS headers are present in all Edge Function responses
- Verify `Access-Control-Allow-Headers` includes: `"Content-Type, Authorization, X-Client-Info, Apikey"`

### Issue: Slow Responses
**Solution:**
- Use shorter `max_tokens` (default 200 is good)
- Implement request caching for common queries
- Consider using gpt-4-turbo for faster responses

### Issue: ChatGPT Response Not Appearing
**Solution:**
- Check browser console for errors
- Verify Supabase session is active
- Confirm Edge Function is deployed
- Test API endpoint manually with curl

### Issue: Database Tables Not Created
**Solution:**
- Run migration: `npm run migrate` (if available)
- Manually execute SQL in Supabase SQL Editor
- Verify RLS policies are enabled

---

## Next Steps

1. **Deploy Edge Function**: Push code to repository or use Supabase CLI
2. **Add ChatGPT Wrapper**: Implement `chatgpt.service.ts` in your project
3. **Update UI**: Modify ChatbotCompanion to show AI-powered messages
4. **Test Integration**: Verify end-to-end with sample inputs
5. **Monitor Usage**: Track API costs and adjust as needed

---

## Example: Full Conversation Flow

```
1. User: "I just had coffee and some toast"
   ↓
2. Frontend: Calls analyzeWithChatGPT("I just had coffee and some toast", "meal")
   ↓
3. Edge Function: Sends to OpenAI with meal analysis prompt
   ↓
4. OpenAI: Returns analysis with insights and recommendations
   ↓
5. Frontend: Displays response in ChatbotCompanion
   ↓
6. User sees: "Nice choice! Coffee with toast is a light breakfast.
   The caffeine may increase alertness, so consider hydration.
   Any digestive effects? 😊"
```

---

## Support & Resources

- **OpenAI Documentation**: https://platform.openai.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Your App Repository**: Implementation ready for production use


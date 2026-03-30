import { supabase } from './supabase';

export interface ChatbotMessage {
  role: 'user' | 'assistant';
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

const getApiUrl = () => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${baseUrl}/functions/v1/chatgpt-analysis`;
};

const createHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token || ''}`,
  };
};

export async function analyzeWithChatGPT(
  userMessage: string,
  analysisType: 'meal' | 'stool' | 'general' = 'general',
  conversationHistory: ChatbotMessage[] = []
): Promise<AnalysisResult> {
  try {
    const headers = await createHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(apiUrl, {
      method: 'POST',
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
    console.error('ChatGPT API Error:', error);
    return {
      success: false,
      message: 'Unable to get AI analysis. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function saveConversation(
  userId: string,
  messages: ChatbotMessage[]
): Promise<boolean> {
  try {
    const { data: conversation, error: convError } = await supabase
      .from('chatbot_conversations')
      .insert([{ user_id: userId }])
      .select()
      .maybeSingle();

    if (convError) throw convError;
    if (!conversation) throw new Error('Failed to create conversation');

    const messagesToInsert = messages.map((msg) => ({
      conversation_id: conversation.id,
      role: msg.role,
      content: msg.content,
    }));

    const { error: msgError } = await supabase
      .from('chatbot_messages')
      .insert(messagesToInsert);

    if (msgError) throw msgError;
    return true;
  } catch (error) {
    console.error('Save conversation error:', error);
    return false;
  }
}

export async function getConversationHistory(
  userId: string,
  limit: number = 5
): Promise<ChatbotMessage[]> {
  try {
    const { data: conversation, error: convError } = await supabase
      .from('chatbot_conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (convError || !conversation) return [];

    const { data: messages, error: msgError } = await supabase
      .from('chatbot_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (msgError) return [];

    return (
      messages?.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })) || []
    );
  } catch (error) {
    console.error('Get history error:', error);
    return [];
  }
}

export async function getUserPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from('chatbot_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get preferences error:', error);
    return null;
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<{
    enabled: boolean;
    accent: 'british' | 'southern' | 'australian';
    voice_gender: 'male' | 'female';
    speech_rate: number;
    volume_level: number;
    analysis_mode: 'standard' | 'ai_powered';
  }>
) {
  try {
    const { data, error } = await supabase
      .from('chatbot_preferences')
      .upsert(
        {
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update preferences error:', error);
    return null;
  }
}

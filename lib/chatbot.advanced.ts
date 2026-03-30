import { analyzeWithChatGPT, ChatbotMessage } from './chatgpt.service';
import { getChatbotResponse } from './chatbot.responses';

export interface ChatbotAnalysisRequest {
  userMessage: string;
  analysisType: 'meal' | 'stool' | 'general';
  conversationHistory?: ChatbotMessage[];
  useAI?: boolean;
  fallbackAccent?: 'british' | 'southern' | 'australian';
  fallbackGender?: 'male' | 'female';
}

export interface ChatbotAnalysisResponse {
  message: string;
  useAI: boolean;
  analysis?: {
    type: string;
    insights: string[];
    recommendations: string[];
    follow_up_question?: string;
  };
  error?: string;
}

/**
 * Get enhanced chatbot response with optional AI analysis
 * Falls back to pre-scripted responses if AI is disabled or fails
 */
export async function getEnhancedChatbotResponse(
  request: ChatbotAnalysisRequest
): Promise<ChatbotAnalysisResponse> {
  const {
    userMessage,
    analysisType,
    conversationHistory = [],
    useAI = false,
    fallbackAccent = 'british',
    fallbackGender = 'male',
  } = request;

  // If AI is disabled, use pre-scripted responses
  if (!useAI) {
    return {
      message: getChatbotResponse(
        fallbackAccent,
        fallbackGender,
        'encouragement'
      ),
      useAI: false,
    };
  }

  try {
    // Try AI analysis
    const result = await analyzeWithChatGPT(
      userMessage,
      analysisType,
      conversationHistory
    );

    if (result.success) {
      return {
        message: result.message,
        useAI: true,
        analysis: result.analysis,
      };
    }

    // Fallback if AI fails
    return {
      message: getChatbotResponse(
        fallbackAccent,
        fallbackGender,
        'encouragement'
      ),
      useAI: false,
      error: result.error,
    };
  } catch (error) {
    console.error('Enhanced chatbot response error:', error);

    // Ultimate fallback
    return {
      message: getChatbotResponse(
        fallbackAccent,
        fallbackGender,
        'encouragement'
      ),
      useAI: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a smart meal analysis prompt
 */
export function createMealAnalysisPrompt(mealDescription: string): string {
  return `I just ate: ${mealDescription}. Can you help me understand how this might affect my digestive health?`;
}

/**
 * Create a smart stool analysis prompt
 */
export function createStoolAnalysisPrompt(
  bristolScale?: string,
  symptoms?: string[]
): string {
  let prompt = 'I want to discuss my stool characteristics';

  if (bristolScale) {
    prompt += ` (Bristol scale ${bristolScale})`;
  }

  if (symptoms && symptoms.length > 0) {
    prompt += ` with symptoms: ${symptoms.join(', ')}`;
  }

  prompt += '. What factors might be contributing?';

  return prompt;
}

/**
 * Create a smart health pattern analysis prompt
 */
export function createPatternAnalysisPrompt(
  dailyLogs: {
    meals: number;
    bowelMovements: number;
    urinations: number;
  }
): string {
  return `Today I logged ${dailyLogs.meals} meals, ${dailyLogs.bowelMovements} bowel movements, and ${dailyLogs.urinations} urinations.
  What patterns or insights might this suggest about my wellness?`;
}

/**
 * Validate user message for analysis
 */
export function validateUserMessage(message: string): {
  valid: boolean;
  error?: string;
} {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (message.length > 500) {
    return { valid: false, error: 'Message is too long (max 500 characters)' };
  }

  // Check for potential prompt injection
  const injectionPatterns = [
    /ignore.*instruction/i,
    /forget.*prompt/i,
    /system.*message/i,
  ];

  if (injectionPatterns.some((pattern) => pattern.test(message))) {
    return { valid: false, error: 'Invalid message format' };
  }

  return { valid: true };
}

/**
 * Format analysis results for display
 */
export function formatAnalysisForDisplay(response: ChatbotAnalysisResponse): {
  mainMessage: string;
  insights?: string[];
  recommendations?: string[];
  followUpQuestion?: string;
} {
  return {
    mainMessage: response.message,
    insights: response.analysis?.insights,
    recommendations: response.analysis?.recommendations,
    followUpQuestion: response.analysis?.follow_up_question,
  };
}

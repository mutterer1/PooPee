# Chatbot Integration Implementation Examples

This document provides practical examples of how to integrate the ChatGPT API wrapper with your chatbot system.

## Example 1: Basic Meal Analysis on Track Page

**File:** `app/(tabs)/track.tsx`

```typescript
import { analyzeWithChatGPT } from '@/lib/chatgpt.service';
import { useState } from 'react';

export default function TrackScreen() {
  const [aiMessage, setAiMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMealAnalysis = async (mealDescription: string) => {
    setLoading(true);
    try {
      const result = await analyzeWithChatGPT(
        `I just ate: ${mealDescription}`,
        'meal'
      );

      if (result.success) {
        setAiMessage(result.message);
        // Display insights and recommendations
        console.log('Insights:', result.analysis?.insights);
        console.log('Recommendations:', result.analysis?.recommendations);
      } else {
        setAiMessage('Unable to analyze. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your UI here
    <TouchableOpacity onPress={() => handleMealAnalysis('pasta with tomato sauce')}>
      <Text>Analyze This Meal</Text>
    </TouchableOpacity>
  );
}
```

## Example 2: Enhanced Chatbot with AI Mode Toggle

**File:** `components/EnhancedChatbotCompanion.tsx` (New Component)

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, baseStyles } from '@/theme/styles';
import { getEnhancedChatbotResponse, validateUserMessage } from '@/lib/chatbot.advanced';
import { useAuth } from '@/lib/auth.context';
import { X } from 'lucide-react-native';

interface EnhancedChatbotCompanionProps {
  visible: boolean;
  onClose?: () => void;
  analysisType?: 'meal' | 'stool' | 'general';
  useAI?: boolean;
}

export default function EnhancedChatbotCompanion({
  visible,
  onClose,
  analysisType = 'general',
  useAI = false,
}: EnhancedChatbotCompanionProps) {
  const { user } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalysis = async () => {
    // Validate input
    const validation = validateUserMessage(userInput);
    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await getEnhancedChatbotResponse({
        userMessage: userInput,
        analysisType,
        useAI,
        fallbackAccent: 'british',
        fallbackGender: 'male',
      });

      setResponse(result.message);

      // Display analysis results if available
      if (result.analysis) {
        console.log('Analysis Results:');
        console.log('- Insights:', result.analysis.insights);
        console.log('- Recommendations:', result.analysis.recommendations);
        console.log('- Follow-up:', result.analysis.follow_up_question);
      }
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[baseStyles.card, styles.container]}>
          <View style={styles.header}>
            <Text style={styles.title}>Wellness Assistant</Text>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color={MEDITATIVE_COLORS.text.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            {response && (
              <View style={styles.responseBox}>
                <Text style={styles.responseText}>{response}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Tell me about your meal, symptoms, or ask for guidance..."
              placeholderTextColor={MEDITATIVE_COLORS.text.secondary}
              value={userInput}
              onChangeText={setUserInput}
              multiline
              maxLength={500}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAnalysis}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Analyzing...' : 'Get Analysis'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modeIndicator}>
              <Text style={styles.modeText}>
                Mode: {useAI ? 'AI Powered' : 'Standard'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    gap: SPACING.md,
  },
  responseBox: {
    backgroundColor: 'rgba(142, 125, 190, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: MEDITATIVE_COLORS.primary.lavender,
  },
  responseText: {
    fontSize: 14,
    color: MEDITATIVE_COLORS.text.primary,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: MEDITATIVE_COLORS.text.secondary + '30',
    borderRadius: 12,
    padding: SPACING.md,
    minHeight: 80,
    fontSize: 14,
    color: MEDITATIVE_COLORS.text.primary,
  },
  button: {
    backgroundColor: MEDITATIVE_COLORS.primary.coral,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 4,
  },
  modeIndicator: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: MEDITATIVE_COLORS.text.secondary + '20',
  },
  modeText: {
    fontSize: 12,
    color: MEDITATIVE_COLORS.text.secondary,
    fontWeight: '500',
  },
});
```

## Example 3: Save Conversation History

**File:** Usage in any component

```typescript
import { saveConversation, getConversationHistory } from '@/lib/chatgpt.service';

// Save a conversation
const messages = [
  { role: 'user' as const, content: 'I had coffee and toast' },
  {
    role: 'assistant' as const,
    content: 'That sounds like a light breakfast. How are you feeling?',
  },
];

await saveConversation(user.id, messages);

// Later, retrieve conversation history
const history = await getConversationHistory(user.id, 5); // Last 5 messages
```

## Example 4: User Preferences Management

**File:** `app/(tabs)/settings.tsx` (Add to existing settings)

```typescript
import { getUserPreferences, updateUserPreferences } from '@/lib/chatgpt.service';
import { useAuth } from '@/lib/auth.context';
import { useState, useEffect } from 'react';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [aiMode, setAiMode] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    const prefs = await getUserPreferences(user!.id);
    if (prefs) {
      setAiMode(prefs.analysis_mode === 'ai_powered');
    }
  };

  const handleToggleAI = async () => {
    const newMode = !aiMode;
    setAiMode(newMode);

    await updateUserPreferences(user!.id, {
      analysis_mode: newMode ? 'ai_powered' : 'standard',
    });
  };

  return (
    <View>
      <TouchableOpacity onPress={handleToggleAI}>
        <Text>{aiMode ? 'AI Mode: ON' : 'AI Mode: OFF'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Example 5: Smart Pattern Analysis

**File:** Usage in Insights page

```typescript
import { createPatternAnalysisPrompt } from '@/lib/chatbot.advanced';
import { analyzeWithChatGPT } from '@/lib/chatgpt.service';

async function analyzeDailyPatterns(dailyStats) {
  const prompt = createPatternAnalysisPrompt({
    meals: dailyStats.mealsLogged,
    bowelMovements: dailyStats.bowelCount,
    urinations: dailyStats.urinationCount,
  });

  const result = await analyzeWithChatGPT(prompt, 'general');

  if (result.success) {
    console.log('Pattern Insights:');
    console.log(result.analysis?.insights);
    console.log('Recommendations:', result.analysis?.recommendations);
  }
}
```

## Example 6: Stool Analysis with Bristol Scale

**File:** `components/BowelMovementModal.tsx` (Enhancement)

```typescript
import { createStoolAnalysisPrompt } from '@/lib/chatbot.advanced';
import { analyzeWithChatGPT } from '@/lib/chatgpt.service';

async function handleStoolAnalysis(bristolScale, symptoms) {
  const prompt = createStoolAnalysisPrompt(bristolScale, symptoms);

  const result = await analyzeWithChatGPT(prompt, 'stool');

  if (result.success) {
    showChatbotAnalysis({
      message: result.message,
      insights: result.analysis?.insights,
      recommendations: result.analysis?.recommendations,
    });
  }
}
```

## Example 7: Fallback Behavior

```typescript
// Graceful degradation if AI fails
const result = await getEnhancedChatbotResponse({
  userMessage: 'I just had lunch',
  analysisType: 'meal',
  useAI: true, // Try AI first
  fallbackAccent: 'british', // Use this if AI fails
  fallbackGender: 'male',
});

// Result will contain either:
// - AI response if available
// - Pre-scripted response if AI fails
// - Error details for debugging
```

## Example 8: Error Handling Best Practices

```typescript
import { validateUserMessage } from '@/lib/chatbot.advanced';

const handleUserInput = async (input: string) => {
  // 1. Validate input
  const validation = validateUserMessage(input);
  if (!validation.valid) {
    showError(validation.error);
    return;
  }

  // 2. Try AI analysis with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const result = await analyzeWithChatGPT(input, 'meal');
    clearTimeout(timeoutId);

    if (!result.success) {
      // Show fallback response
      showMessage(getChatbotResponse('british', 'male', 'encouragement'));
      return;
    }

    showMessage(result.message);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Analysis failed:', error);
    showError('Unable to analyze. Please try again.');
  }
};
```

---

## Integration Checklist

- [ ] Database migration applied (`20260330_add_chatbot_tables`)
- [ ] Edge function deployed (`chatgpt-analysis`)
- [ ] OpenAI API key configured in Supabase secrets
- [ ] `lib/chatgpt.service.ts` created
- [ ] `lib/chatbot.advanced.ts` created
- [ ] Component imports ChatGPT services
- [ ] Error handling implemented
- [ ] Testing complete with sample inputs
- [ ] User preferences UI created (optional)
- [ ] Conversation history stored (optional)

---

## Testing the Integration

### Test 1: Basic API Call
```typescript
import { analyzeWithChatGPT } from '@/lib/chatgpt.service';

// Open browser console and run:
const result = await analyzeWithChatGPT('I ate pasta', 'meal');
console.log(result);
```

### Test 2: With Conversation History
```typescript
const history = [
  { role: 'user', content: 'I had coffee this morning' },
  { role: 'assistant', content: 'Caffeine can affect digestion' },
];

const result = await analyzeWithChatGPT(
  'Now I had lunch',
  'meal',
  history
);
console.log(result);
```

### Test 3: Error Handling
```typescript
// Test with invalid input
const result = await analyzeWithChatGPT('', 'meal');
// Should show error gracefully
```

---

## Performance Tips

1. **Cache responses** for common inputs to reduce API calls
2. **Debounce** user input while typing (200-300ms)
3. **Implement request queuing** if handling multiple requests
4. **Show loading states** during API calls
5. **Set reasonable timeouts** (8-10 seconds max)
6. **Monitor API costs** and set usage limits

---

## Troubleshooting

**Q: API returns 401 error**
A: Verify OpenAI API key is set in Supabase → Project Settings → Edge Functions → Secrets

**Q: Response is slow (10+ seconds)**
A: Consider using gpt-3.5-turbo (faster) instead of gpt-4
Reduce max_tokens in edge function

**Q: CORS error on browser**
A: Check corsHeaders are included in all responses
Verify Access-Control-Allow-Headers include all required headers

**Q: No response appears in UI**
A: Check browser console for fetch errors
Verify Supabase session is active (auth.uid() present)
Test API endpoint directly with curl/Postman


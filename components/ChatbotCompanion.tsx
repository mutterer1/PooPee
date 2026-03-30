import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/theme/styles';
import { getChatbotResponse } from '@/lib/chatbot.responses';
import { useAuth } from '@/lib/auth.context';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react-native';

interface ChatbotCompanionProps {
  visible: boolean;
  onClose?: () => void;
  message?: string;
  category?: 'celebration_log' | 'encouragement' | 'insight' | 'greeting';
}

interface ChatbotPreferences {
  enabled: boolean;
  accent: 'british' | 'southern' | 'australian';
  voice_gender: 'male' | 'female';
  speech_rate: number;
  volume_level: number;
}

export default function ChatbotCompanion({
  visible,
  onClose,
  message,
  category = 'greeting',
}: ChatbotCompanionProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ChatbotPreferences | null>(null);
  const [displayMessage, setDisplayMessage] = useState('');
  const [showCharacter, setShowCharacter] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      try {
        const { data } = await supabase
          .from('chatbot_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && data.enabled) {
          setPreferences(data);
        }
      } catch {
        // Preferences not available
      }
    };

    loadPreferences();
  }, [user]);

  useEffect(() => {
    if (visible && preferences) {
      setShowCharacter(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start();

      if (message) {
        setDisplayMessage(message);
      } else {
        const response = getChatbotResponse(
          preferences.accent,
          preferences.voice_gender,
          category
        );
        setDisplayMessage(response);
      }
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start(() => {
        setShowCharacter(false);
      });
    }
  }, [visible, preferences, message, category]);

  if (!preferences || !showCharacter) {
    return null;
  }

  const getCharacterEmoji = () => {
    if (preferences.voice_gender === 'male') {
      return '🧑‍⚕️';
    }
    return '👩‍⚕️';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}>
      <View style={styles.background}>
        <View style={styles.characterContainer}>
          <Text style={styles.character}>{getCharacterEmoji()}</Text>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.message}>{displayMessage}</Text>

          {onClose && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={16} color={MEDITATIVE_COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
    maxWidth: 280,
    zIndex: 1000,
  },
  background: {
    alignItems: 'flex-end',
  },
  characterContainer: {
    marginBottom: -SPACING.md,
    zIndex: 10,
  },
  character: {
    fontSize: 56,
  },
  messageBox: {
    backgroundColor: MEDITATIVE_COLORS.chatbot.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: MEDITATIVE_COLORS.chatbot.accent,
    ...SHADOWS.md,
  },
  message: {
    fontSize: 14,
    color: MEDITATIVE_COLORS.text.primary,
    lineHeight: 21,
    marginBottom: SPACING.md,
  },
  actions: {
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: SPACING.sm,
  },
});

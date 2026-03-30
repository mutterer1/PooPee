import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SHADOWS } from '@/theme/styles';

const BUTTON_SIZE = 50;

interface ChatbotButtonProps {
  onPress: () => void;
}

export default function ChatbotButton({ onPress }: ChatbotButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.85}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Open chatbot assistant"
      accessibilityHint="Double tap to open chatbot companion for guidance"
    >
      <MessageCircle size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: MEDITATIVE_COLORS.primary.coral,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    ...SHADOWS.lg,
  },
});

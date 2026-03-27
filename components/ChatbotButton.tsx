import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, SHADOWS } from '@/theme/styles';

const BUTTON_SIZE = 56;

interface ChatbotButtonProps {
  onPress: () => void;
}

export default function ChatbotButton({ onPress }: ChatbotButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MessageCircle size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: SPACING.xl + 70,
    right: SPACING.md,
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

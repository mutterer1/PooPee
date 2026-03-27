import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, BORDER_RADIUS } from '@/theme/styles';

interface AchievementBadgeProps {
  title: string;
  description?: string;
  emoji: string;
  unlocked?: boolean;
}

export default function AchievementBadge({
  title,
  description,
  emoji,
  unlocked = true,
}: AchievementBadgeProps) {
  return (
    <View style={[styles.container, !unlocked && styles.containerLocked]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: MEDITATIVE_COLORS.primary.lavender + '20',
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: MEDITATIVE_COLORS.achievements.highlight,
  },
  containerLocked: {
    opacity: 0.5,
    backgroundColor: MEDITATIVE_COLORS.neutral.lightGray + '40',
    borderLeftColor: MEDITATIVE_COLORS.neutral.mediumGray,
  },
  emoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
    textAlign: 'center',
  },
  description: {
    fontSize: 10,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

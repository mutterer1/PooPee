import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, baseStyles } from '@/theme/styles';
import { CircleAlert as AlertCircle, TrendingUp, Lightbulb } from 'lucide-react-native';

interface EntryInsight {
  id: string;
  insight_type: 'immediate' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  severity: 'normal' | 'attention' | 'positive';
  actionable_tips: string[];
}

interface EntryInsightCardProps {
  insight: EntryInsight;
}

export default function EntryInsightCard({ insight }: EntryInsightCardProps) {
  const getIcon = () => {
    switch (insight.insight_type) {
      case 'immediate':
        return <AlertCircle size={24} color={getColor()} />;
      case 'pattern':
        return <TrendingUp size={24} color={getColor()} />;
      case 'recommendation':
        return <Lightbulb size={24} color={getColor()} />;
    }
  };

  const getColor = () => {
    switch (insight.severity) {
      case 'positive':
        return MEDITATIVE_COLORS.primary.sage;
      case 'attention':
        return MEDITATIVE_COLORS.tracking.bowel;
      case 'normal':
      default:
        return MEDITATIVE_COLORS.primary.lavender;
    }
  };

  const getBackgroundColor = () => {
    switch (insight.severity) {
      case 'positive':
        return MEDITATIVE_COLORS.primary.sage + '15';
      case 'attention':
        return MEDITATIVE_COLORS.tracking.bowel + '15';
      case 'normal':
      default:
        return MEDITATIVE_COLORS.primary.lavender + '15';
    }
  };

  const getBadgeText = () => {
    switch (insight.insight_type) {
      case 'immediate':
        return 'Right Now';
      case 'pattern':
        return 'Pattern';
      case 'recommendation':
        return 'Action';
    }
  };

  return (
    <View style={[baseStyles.card, styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{insight.title}</Text>
          <View style={[styles.badge, { backgroundColor: getColor() + '30' }]}>
            <Text style={[styles.badgeText, { color: getColor() }]}>{getBadgeText()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{insight.description}</Text>

      {insight.actionable_tips && insight.actionable_tips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>What you can do:</Text>
          {insight.actionable_tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: MEDITATIVE_COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  tipsContainer: {
    borderTopWidth: 1,
    borderTopColor: MEDITATIVE_COLORS.text.tertiary + '30',
    paddingTop: SPACING.sm,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  tipBullet: {
    fontSize: 15,
    color: MEDITATIVE_COLORS.text.secondary,
    marginRight: SPACING.xs,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: MEDITATIVE_COLORS.text.secondary,
    lineHeight: 20,
  },
});

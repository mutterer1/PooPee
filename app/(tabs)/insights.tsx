import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '@/lib/auth.context';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, baseStyles } from '@/theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackgroundWatermark from '@/components/BackgroundWatermark';
import ChatbotButton from '@/components/ChatbotButton';
import ChatbotCompanion from '@/components/ChatbotCompanion';
import { buildInsightSummary } from '@/lib/insights';
import EntryInsightCard from '@/components/EntryInsightCard';
import { TrendingUp, Sparkles } from 'lucide-react-native';

interface InsightData {
  totalEntries: number;
  totalBowelMovements: number;
  totalUrinations: number;
  totalMeals: number;
  averageDailyEntries: number;
  trackingScore: number;
  patternsMessage: string;
  firstLoggedAt?: string;
}

interface EntryInsight {
  id: string;
  entry_type: string;
  insight_type: 'immediate' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  severity: 'normal' | 'attention' | 'positive';
  actionable_tips: string[];
  created_at: string;
}

export default function InsightsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [recentInsights, setRecentInsights] = useState<EntryInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);

  const loadInsights = async () => {
      if (!user) return;

      try {
        const [{ data: bowels }, { data: urinations }, { data: meals }, { data: entryInsights }] = await Promise.all([
          supabase
            .from('bowel_movements')
            .select('id, created_at, bristol_scale, urgency_level')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('urinations')
            .select('id, created_at, is_nighttime')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('meals')
            .select('id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('entry_insights')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        const totalBowelMovements = bowels?.length || 0;
        const totalUrinations = urinations?.length || 0;
        const totalMeals = meals?.length || 0;
        const totalEntries = totalBowelMovements + totalUrinations + totalMeals;

        const firstLoggedAt = [
          bowels?.[0]?.created_at,
          urinations?.[0]?.created_at,
          meals?.[0]?.created_at,
        ]
          .filter(Boolean)
          .sort()[0];

        const looseStoolCount = (bowels || []).filter((entry) => ['type_6', 'type_7'].includes(entry.bristol_scale)).length;
        const urgentBowelCount = (bowels || []).filter((entry) => (entry.urgency_level || 0) >= 4).length;
        const nighttimeUrinationCount = (urinations || []).filter((entry) => entry.is_nighttime).length;

        const summary = buildInsightSummary({
          totalEntries,
          totalBowelMovements,
          totalUrinations,
          totalMeals,
          firstLoggedAt,
          looseStoolCount,
          urgentBowelCount,
          nighttimeUrinationCount,
        });

        setInsights({
          totalEntries,
          totalBowelMovements,
          totalUrinations,
          totalMeals,
          averageDailyEntries: Math.round((totalEntries / summary.daysSinceStart) * 10) / 10,
          trackingScore: summary.trackingScore,
          patternsMessage: summary.message,
          firstLoggedAt,
        });

        setRecentInsights(entryInsights || []);
      } catch (error) {
        console.error('Error loading insights:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadInsights();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackgroundWatermark />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MEDITATIVE_COLORS.primary.lavender}
            colors={[MEDITATIVE_COLORS.primary.lavender]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Insights</Text>
          <Text style={styles.subtitle}>Gentle guidance based on what you have actually logged</Text>
        </View>

        {recentInsights.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color={MEDITATIVE_COLORS.primary.lavender} />
              <Text style={styles.sectionTitle}>Recent AI Insights</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Smart analysis from your latest entries
            </Text>
            {recentInsights.map((insight) => (
              <EntryInsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        )}

        {insights && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={MEDITATIVE_COLORS.primary.sage} />
                <Text style={styles.sectionTitle}>Long-Term Overview</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Comprehensive analysis based on all your data
              </Text>
              <View style={styles.statsGrid}>
                <View style={[baseStyles.card, styles.statBox]}>
                  <Text style={styles.statNumber}>{insights.totalEntries}</Text>
                  <Text style={styles.statLabel}>Total Logs</Text>
                </View>
                <View style={[baseStyles.card, styles.statBox]}>
                  <Text style={styles.statNumber}>{insights.averageDailyEntries}</Text>
                  <Text style={styles.statLabel}>Avg / Day</Text>
                </View>
              </View>
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Breakdown</Text>
              <View style={[baseStyles.card, styles.breakdownCard]}>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabel}>
                    <Text style={styles.breakdownTitle}>Bowel Movements</Text>
                    <View style={[styles.colorDot, { backgroundColor: MEDITATIVE_COLORS.tracking.bowel }]} />
                  </View>
                  <Text style={styles.breakdownValue}>{insights.totalBowelMovements}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabel}>
                    <Text style={styles.breakdownTitle}>Urinations</Text>
                    <View style={[styles.colorDot, { backgroundColor: MEDITATIVE_COLORS.tracking.urination }]} />
                  </View>
                  <Text style={styles.breakdownValue}>{insights.totalUrinations}</Text>
                </View>
                <View style={styles.breakdownRowNoBorder}>
                  <View style={styles.breakdownLabel}>
                    <Text style={styles.breakdownTitle}>Meals</Text>
                    <View style={[styles.colorDot, { backgroundColor: MEDITATIVE_COLORS.tracking.meal }]} />
                  </View>
                  <Text style={styles.breakdownValue}>{insights.totalMeals}</Text>
                </View>
              </View>
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Pattern Read</Text>
              <View style={[baseStyles.card, styles.patternCard]}>
                <Text style={styles.patternTitle}>What your current data suggests</Text>
                <Text style={styles.patternText}>{insights.patternsMessage}</Text>
              </View>
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Tracking Score</Text>
              <View style={[baseStyles.card, styles.scoreCard]}>
                <Text style={styles.scoreValue}>{insights.trackingScore}</Text>
                <Text style={styles.scoreLabel}>This reflects tracking consistency, not medical status.</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Keep It Trustworthy</Text>
              <View style={[baseStyles.card, styles.disclaimerCard]}>
                <Text style={styles.disclaimerText}>
                  Use this app to notice trends, not to self-diagnose. Red-flag symptoms such as blood, severe pain,
                  or ongoing changes should be discussed with a clinician.
                </Text>
              </View>
            </View>
          </>
        )}

        {!insights && !loading && (
          <View style={[baseStyles.card, styles.emptyCard]}>
            <Text style={styles.disclaimerText}>Start logging to unlock insights.</Text>
          </View>
        )}
      </ScrollView>

      <ChatbotButton onPress={() => setChatbotVisible(true)} />
      <ChatbotCompanion
        visible={chatbotVisible}
        onClose={() => setChatbotVisible(false)}
        category="insight"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.light,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: MEDITATIVE_COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  subsection: {
    marginBottom: SPACING.lg,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  patternCard: {
    borderLeftWidth: 4,
    borderLeftColor: MEDITATIVE_COLORS.primary.teal,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: MEDITATIVE_COLORS.primary.lavender + '10',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.primary.lavender,
  },
  scoreLabel: {
    fontSize: 13,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.primary.teal,
  },
  statLabel: {
    fontSize: 12,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  breakdownCard: {
    paddingVertical: 0,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MEDITATIVE_COLORS.neutral.lightGray,
  },
  breakdownRowNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  breakdownTitle: {
    fontSize: 15,
    color: MEDITATIVE_COLORS.text.primary,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownValue: {
    fontSize: 20,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
  },
  patternText: {
    color: MEDITATIVE_COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 21,
  },
  disclaimerCard: {
    backgroundColor: MEDITATIVE_COLORS.primary.coral + '12',
  },
  disclaimerText: {
    color: MEDITATIVE_COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 21,
  },
  emptyCard: {
    alignItems: 'center',
  },
});

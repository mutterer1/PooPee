import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '@/lib/auth.context';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DS, MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, BORDER_RADIUS, SHADOWS, baseStyles } from '@/theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackgroundWatermark from '@/components/BackgroundWatermark';
import GradientBackground from '@/components/GradientBackground';
import ChatbotButton from '@/components/ChatbotButton';
import ChatbotCompanion from '@/components/ChatbotCompanion';
import { buildInsightSummary } from '@/lib/insights';
import EntryInsightCard from '@/components/EntryInsightCard';
import { TrendingUp, Sparkles, MessageSquare } from 'lucide-react-native';

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
      <GradientBackground />
      <BackgroundWatermark />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DS.primary}
            colors={[DS.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Insights</Text>
          <Text style={styles.subtitle}>Gentle guidance based on what you have actually logged.</Text>
        </View>

        {insights && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={18} color={DS.secondary} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Long-Term Overview</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statTile, { backgroundColor: DS.tracking.bowel + '55' }]}>
                  <Text style={styles.statNumber}>{insights.totalEntries}</Text>
                  <Text style={styles.statLabel}>Total Logs</Text>
                </View>
                <View style={[styles.statTile, { backgroundColor: DS.tracking.meal + '55' }]}>
                  <Text style={styles.statNumber}>{insights.averageDailyEntries}</Text>
                  <Text style={styles.statLabel}>Avg / Day</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Breakdown</Text>
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View style={[styles.colorDot, { backgroundColor: DS.tracking.bowel }]} />
                    <Text style={styles.breakdownTitle}>Bowel Movements</Text>
                  </View>
                  <Text style={styles.breakdownValue}>{insights.totalBowelMovements}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View style={[styles.colorDot, { backgroundColor: DS.tracking.urination }]} />
                    <Text style={styles.breakdownTitle}>Urinations</Text>
                  </View>
                  <Text style={styles.breakdownValue}>{insights.totalUrinations}</Text>
                </View>
                <View style={[styles.breakdownRow, styles.breakdownRowLast]}>
                  <View style={styles.breakdownLeft}>
                    <View style={[styles.colorDot, { backgroundColor: DS.tracking.meal }]} />
                    <Text style={styles.breakdownTitle}>Meals</Text>
                  </View>
                  <Text style={styles.breakdownValue}>{insights.totalMeals}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.patternCard}>
                <View style={styles.patternCardHeader}>
                  <MessageSquare size={20} color={DS.primary} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Pattern Read</Text>
                </View>
                <Text style={styles.patternSubtitle}>What your current data suggests</Text>
                <Text style={styles.patternText}>{insights.patternsMessage}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tracking Score</Text>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreValue}>{insights.trackingScore}</Text>
                <Text style={styles.scoreLabel}>This reflects tracking consistency, not medical status.</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.disclaimerCard}>
                <Text style={styles.disclaimerText}>
                  Use this app to notice trends, not to self-diagnose. Red-flag symptoms such as blood, severe pain,
                  or ongoing changes should be discussed with a clinician.
                </Text>
              </View>
            </View>
          </>
        )}

        {recentInsights.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={18} color={DS.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Recent AI Insights</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Smart analysis from your latest entries</Text>
            {recentInsights.map((insight) => (
              <EntryInsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        )}

        {!insights && !loading && (
          <View style={styles.emptyCard}>
            <Text style={styles.patternText}>Start logging to unlock insights.</Text>
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
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: DS.primary,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: DS.onSurfaceVariant,
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DS.onSurface,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: DS.onSurfaceVariant,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statTile: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: DS.onSurface,
    lineHeight: 40,
  },
  statLabel: {
    fontSize: 13,
    color: DS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  breakdownCard: {
    backgroundColor: DS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: DS.surfaceContainerLowest,
    marginBottom: 2,
  },
  breakdownRowLast: {
    marginBottom: 0,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownTitle: {
    fontSize: 15,
    color: DS.onSurface,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 20,
    fontWeight: '700',
    color: DS.onSurface,
  },
  patternCard: {
    backgroundColor: DS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  patternCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  patternSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DS.onSurface,
    marginBottom: SPACING.sm,
  },
  patternText: {
    color: DS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 22,
  },
  scoreCard: {
    backgroundColor: DS.primaryContainer,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: '800',
    color: DS.primary,
    lineHeight: 60,
  },
  scoreLabel: {
    fontSize: 13,
    color: DS.onSurfaceVariant,
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  disclaimerCard: {
    backgroundColor: DS.tertiaryFixed,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  disclaimerText: {
    color: DS.onTertiaryFixed,
    fontSize: 13,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: DS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
});

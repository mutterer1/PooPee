import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/lib/auth.context';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, BORDER_RADIUS, SHADOWS, baseStyles } from '@/theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AchievementBadge from '@/components/AchievementBadge';
import { checkAndAwardAchievements } from '@/lib/achievements';
import PhotoAnalysisModal from '@/components/PhotoAnalysisModal';
import BowelMovementModal from '@/components/BowelMovementModal';
import UrinationModal from '@/components/UrinationModal';
import MealModal from '@/components/MealModal';
import BackgroundWatermark from '@/components/BackgroundWatermark';
import ChatbotButton from '@/components/ChatbotButton';
import ChatbotCompanion from '@/components/ChatbotCompanion';
import PooPeeLogo from '@/components/PooPeeLogo';
import {
  Camera,
  ChevronRight,
  Sparkles,
  Shield,
  Utensils,
  Droplets,
  Activity,
} from 'lucide-react-native';

interface Profile {
  display_name: string;
}

interface DailyStats {
  bowelCount: number;
  urinationCount: number;
  mealsLogged: number;
}

interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  icon_name: string;
}

type RecentEntry = {
  id: string;
  type: 'bowel' | 'urination' | 'meal';
  title: string;
  subtitle: string;
  created_at: string;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DailyStats>({
    bowelCount: 0,
    urinationCount: 0,
    mealsLogged: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [bowelVisible, setBowelVisible] = useState(false);
  const [urinationVisible, setUrinationVisible] = useState(false);
  const [mealVisible, setMealVisible] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);

  const totalToday = stats.bowelCount + stats.urinationCount + stats.mealsLogged;

  const todaysInsight = useMemo(() => {
    if (totalToday === 0) {
      return "No entries yet today. Start with one quick log and the app can begin spotting patterns over time.";
    }

    if (stats.bowelCount > 0 && stats.mealsLogged === 0) {
      return "You've logged a body signal today. Adding a meal log can help connect symptoms to possible food triggers.";
    }

    if (stats.mealsLogged > 0 && stats.bowelCount === 0 && stats.urinationCount === 0) {
      return "Nice start. You've logged food today—now watch for any bowel or hydration patterns that follow.";
    }

    if (stats.urinationCount >= 3 && stats.mealsLogged === 0) {
      return "You're tracking hydration well today. Meal logs can make the bigger wellness picture more useful.";
    }

    if (totalToday >= 3) {
      return "Strong tracking day. The more consistent your entries, the more meaningful your pattern insights become.";
    }

    return "Good momentum. A few consistent logs each week will make your insights much more useful.";
  }, [stats, totalToday]);

  const trackingStatus = useMemo(() => {
    if (totalToday === 0) return 'Getting started';
    if (totalToday <= 2) return 'Light tracking';
    if (totalToday <= 4) return 'Building momentum';
    return 'Strong tracking day';
  }, [totalToday]);

  const loadData = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      if (profileData) {
        setProfile(profileData);
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayIso = todayStart.toISOString();

      const [{ data: bowels, error: bowelsError }, { data: urinations, error: urinationsError }, { data: meals, error: mealsError }] = await Promise.all([
        supabase
          .from('bowel_movements')
          .select('id, bristol_scale, created_at')
          .eq('user_id', user.id)
          .gte('created_at', todayIso)
          .order('created_at', { ascending: false }),
        supabase
          .from('urinations')
          .select('id, flow_characteristic, created_at')
          .eq('user_id', user.id)
          .gte('created_at', todayIso)
          .order('created_at', { ascending: false }),
        supabase
          .from('meals')
          .select('id, meal_type, description, created_at')
          .eq('user_id', user.id)
          .gte('created_at', todayIso)
          .order('created_at', { ascending: false }),
      ]);

      if (bowelsError) console.error('Bowels query error:', bowelsError);
      if (urinationsError) console.error('Urinations query error:', urinationsError);
      if (mealsError) console.error('Meals query error:', mealsError);

      setStats({
        bowelCount: bowels?.length || 0,
        urinationCount: urinations?.length || 0,
        mealsLogged: meals?.length || 0,
      });

      const combinedEntries: RecentEntry[] = [
        ...(bowels || []).map((entry: any) => ({
          id: `bowel-${entry.id}`,
          type: 'bowel' as const,
          title: 'Bowel movement logged',
          subtitle: entry.bristol_scale
            ? `Bristol ${String(entry.bristol_scale).replace('type_', 'Type ')}`
            : 'Bowel health entry',
          created_at: entry.created_at,
        })),
        ...(urinations || []).map((entry: any) => ({
          id: `urination-${entry.id}`,
          type: 'urination' as const,
          title: 'Urination logged',
          subtitle: entry.flow_characteristic ? `${entry.flow_characteristic} flow` : 'Hydration entry',
          created_at: entry.created_at,
        })),
        ...(meals || []).map((entry: any) => ({
          id: `meal-${entry.id}`,
          type: 'meal' as const,
          title: 'Meal logged',
          subtitle: entry.description || entry.meal_type || 'Food entry',
          created_at: entry.created_at,
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 3);

      setRecentEntries(combinedEntries);

      await checkAndAwardAchievements(user.id);

      const { data: achievementData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false })
        .limit(6);

      setAchievements(achievementData || []);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderTimeAgo = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return new Date(dateString).toLocaleDateString();
  };

  const getRecentEntryAccent = (type: RecentEntry['type']) => {
    if (type === 'bowel') return MEDITATIVE_COLORS.tracking.bowel;
    if (type === 'urination') return MEDITATIVE_COLORS.tracking.urination;
    return MEDITATIVE_COLORS.tracking.meal;
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
        <View style={styles.heroCard}>
          <View style={styles.brandRow}>
            <PooPeeLogo size={170} showText={true} />

            <TouchableOpacity
              style={styles.cameraButton}
              activeOpacity={0.85}
              onPress={() => setPhotoModalVisible(true)}
            >
              <Camera size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeBlock}>
            <Text style={styles.greeting}>
              Welcome back, {profile?.display_name || 'Friend'}!
            </Text>
            <Text style={styles.subtitle}>
              Track body signals, meals, and overlooked wellness clues with calm, useful guidance.
            </Text>
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.statusPill}>
              <Sparkles size={14} color={MEDITATIVE_COLORS.primary.lavender} />
              <Text style={styles.statusPillText}>{trackingStatus}</Text>
            </View>
            <Text style={styles.heroHelperText}>
              {loading ? 'Refreshing your dashboard...' : 'Today at a glance'}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[baseStyles.card, styles.statCard]}>
            <Text style={styles.statNumber}>{stats.bowelCount}</Text>
            <Text style={styles.statTitle}>Bowel</Text>
            <Text style={styles.statCaption}>
              {stats.bowelCount === 0 ? 'No logs yet' : 'Logged today'}
            </Text>
          </View>

          <View style={[baseStyles.card, styles.statCard]}>
            <Text style={styles.statNumber}>{stats.urinationCount}</Text>
            <Text style={styles.statTitle}>Urination</Text>
            <Text style={styles.statCaption}>
              {stats.urinationCount === 0 ? 'No logs yet' : 'Logged today'}
            </Text>
          </View>

          <View style={[baseStyles.card, styles.statCard]}>
            <Text style={styles.statNumber}>{stats.mealsLogged}</Text>
            <Text style={styles.statTitle}>Meals</Text>
            <Text style={styles.statCaption}>
              {stats.mealsLogged === 0 ? 'No logs yet' : 'Logged today'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Insight</Text>
          <View style={[baseStyles.card, styles.insightCard]}>
            <View style={styles.insightHeader}>
              <View style={styles.insightIconWrap}>
                <Sparkles size={16} color={MEDITATIVE_COLORS.primary.lavender} />
              </View>
              <Text style={styles.insightTitle}>Pattern Read</Text>
            </View>

            <Text style={styles.insightText}>{todaysInsight}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionHint}>Tap to log</Text>
          </View>

          <TouchableOpacity
            style={[baseStyles.card, styles.actionCard]}
            activeOpacity={0.85}
            onPress={() => setBowelVisible(true)}
          >
            <View style={[styles.actionAccent, { backgroundColor: MEDITATIVE_COLORS.tracking.bowel }]} />
            <View style={styles.actionIconWrap}>
              <Activity size={18} color={MEDITATIVE_COLORS.text.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Log Bowel Movement</Text>
              <Text style={styles.actionDescription}>
                Record stool type, urgency, symptoms, and notes.
              </Text>
            </View>
            <ChevronRight size={18} color={MEDITATIVE_COLORS.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[baseStyles.card, styles.actionCard]}
            activeOpacity={0.85}
            onPress={() => setUrinationVisible(true)}
          >
            <View style={[styles.actionAccent, { backgroundColor: MEDITATIVE_COLORS.tracking.urination }]} />
            <View style={styles.actionIconWrap}>
              <Droplets size={18} color={MEDITATIVE_COLORS.text.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Log Urination</Text>
              <Text style={styles.actionDescription}>
                Track hydration, color, flow, and urinary symptoms.
              </Text>
            </View>
            <ChevronRight size={18} color={MEDITATIVE_COLORS.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[baseStyles.card, styles.actionCard]}
            activeOpacity={0.85}
            onPress={() => setMealVisible(true)}
          >
            <View style={[styles.actionAccent, { backgroundColor: MEDITATIVE_COLORS.tracking.meal }]} />
            <View style={styles.actionIconWrap}>
              <Utensils size={18} color={MEDITATIVE_COLORS.text.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Log Meal</Text>
              <Text style={styles.actionDescription}>
                Add meals to help connect foods with body patterns later.
              </Text>
            </View>
            <ChevronRight size={18} color={MEDITATIVE_COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionHint}>Today</Text>
          </View>

          {recentEntries.length > 0 ? (
            <View style={styles.recentList}>
              {recentEntries.map((entry) => (
                <View key={entry.id} style={[baseStyles.card, styles.recentCard]}>
                  <View
                    style={[
                      styles.recentDot,
                      { backgroundColor: getRecentEntryAccent(entry.type) },
                    ]}
                  />
                  <View style={styles.recentContent}>
                    <Text style={styles.recentTitle}>{entry.title}</Text>
                    <Text style={styles.recentSubtitle} numberOfLines={1}>
                      {entry.subtitle}
                    </Text>
                  </View>
                  <Text style={styles.recentTime}>{renderTimeAgo(entry.created_at)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[baseStyles.card, styles.emptyCard]}>
              <Text style={styles.emptyTitle}>Nothing logged yet today</Text>
              <Text style={styles.emptyText}>
                Start with one quick action above. Even a few consistent entries each week can reveal useful patterns.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.sectionHint}>Momentum matters</Text>
          </View>

          {achievements.length > 0 ? (
            <View style={styles.achievementsGrid}>
              {achievements.map((ach) => (
                <View key={ach.id} style={styles.achievementItem}>
                  <AchievementBadge
                    title={ach.title}
                    emoji={ach.icon_name}
                    unlocked={true}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={[baseStyles.card, styles.emptyCard]}>
              <Text style={styles.emptyTitle}>Your first badge is waiting</Text>
              <Text style={styles.emptyText}>
                Keep logging consistently and the app will unlock achievements as you build habits.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={[baseStyles.card, styles.trustCard]}>
            <View style={styles.trustHeader}>
              <Shield size={18} color={MEDITATIVE_COLORS.primary.lavender} />
              <Text style={styles.trustTitle}>Helpful, not diagnostic</Text>
            </View>
            <Text style={styles.trustText}>
              This app is designed to help you track patterns and notice changes over time. It does not provide medical diagnoses or emergency care guidance.
            </Text>
          </View>
        </View>
      </ScrollView>

      {photoModalVisible && (
        <PhotoAnalysisModal
          visible={photoModalVisible}
          onClose={() => setPhotoModalVisible(false)}
        />
      )}

      {bowelVisible && (
        <BowelMovementModal
          visible={bowelVisible}
          onClose={() => setBowelVisible(false)}
          onSuccess={loadData}
        />
      )}

      {urinationVisible && (
        <UrinationModal
          visible={urinationVisible}
          onClose={() => setUrinationVisible(false)}
          onSuccess={loadData}
        />
      )}

      {mealVisible && (
        <MealModal
          visible={mealVisible}
          onClose={() => setMealVisible(false)}
          onSuccess={loadData}
        />
      )}

      <ChatbotButton onPress={() => setChatbotVisible(true)} />
      <ChatbotCompanion
        visible={chatbotVisible}
        onClose={() => setChatbotVisible(false)}
        category="greeting"
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
    paddingBottom: SPACING.xxl,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...SHADOWS.md,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  welcomeBlock: {
    marginTop: SPACING.lg,
  },
  cameraButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: MEDITATIVE_COLORS.primary.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  heroFooter: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: MEDITATIVE_COLORS.neutral.offWhite,
    borderWidth: 1,
    borderColor: MEDITATIVE_COLORS.neutral.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  statusPillText: {
    color: MEDITATIVE_COLORS.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  heroHelperText: {
    fontSize: 12,
    color: MEDITATIVE_COLORS.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    minHeight: 122,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.primary.lavender,
    lineHeight: 34,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statCaption: {
    fontSize: 11,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: 6,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  sectionHint: {
    fontSize: 12,
    color: MEDITATIVE_COLORS.text.secondary,
    fontWeight: '500',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(180, 167, 214, 0.3)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  insightIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(180, 167, 214, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  insightText: {
    fontSize: 14,
    color: MEDITATIVE_COLORS.text.primary,
    lineHeight: 22,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: 18,
    overflow: 'hidden',
  },
  actionAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MEDITATIVE_COLORS.neutral.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    marginRight: SPACING.md,
  },
  actionContent: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  actionDescription: {
    fontSize: 13,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: 4,
    lineHeight: 19,
  },
  recentList: {
    gap: SPACING.sm,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.md,
  },
  recentContent: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  recentSubtitle: {
    fontSize: 12,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: 2,
  },
  recentTime: {
    fontSize: 11,
    color: MEDITATIVE_COLORS.text.secondary,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  achievementItem: {
    width: '31%',
  },
  emptyCard: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: MEDITATIVE_COLORS.text.secondary,
    lineHeight: 20,
  },
  trustCard: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(180, 167, 214, 0.25)',
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  trustTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  trustText: {
    fontSize: 13,
    color: MEDITATIVE_COLORS.text.secondary,
    lineHeight: 20,
  },
});

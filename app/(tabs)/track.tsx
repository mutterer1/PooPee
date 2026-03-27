import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, baseStyles } from '@/theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BowelMovementModal from '@/components/BowelMovementModal';
import UrinationModal from '@/components/UrinationModal';
import MealModal from '@/components/MealModal';
import BackgroundWatermark from '@/components/BackgroundWatermark';
import ChatbotButton from '@/components/ChatbotButton';
import ChatbotCompanion from '@/components/ChatbotCompanion';
import PhotoAnalysisModal from '@/components/PhotoAnalysisModal';
import InsightsModal from '@/components/InsightsModal';
import { Camera } from 'lucide-react-native';
import { useAuth } from '@/lib/auth.context';
import { supabase } from '@/lib/supabase';
import { buildUnifiedEntries, formatEntryTime, UnifiedEntry } from '@/lib/insights';

const ENTRY_COLORS: Record<UnifiedEntry['type'], string> = {
  bowel: MEDITATIVE_COLORS.tracking.bowel,
  urination: MEDITATIVE_COLORS.tracking.urination,
  meal: MEDITATIVE_COLORS.tracking.meal,
};

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [bowelVisible, setBowelVisible] = useState(false);
  const [urinationVisible, setUrinationVisible] = useState(false);
  const [mealVisible, setMealVisible] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [recentEntries, setRecentEntries] = useState<UnifiedEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [prefilledBowelData, setPrefilledBowelData] = useState<any>(null);
  const [prefilledMealData, setPrefilledMealData] = useState<any>(null);
  const [insightsVisible, setInsightsVisible] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'stool' | 'meal'>('stool');
  const [mealCameraVisible, setMealCameraVisible] = useState(false);

  const loadRecentEntries = useCallback(async () => {
    if (!user) return;

    try {
      const [{ data: bowels }, { data: urinations }, { data: meals }] = await Promise.all([
        supabase
          .from('bowel_movements')
          .select('id, created_at, bristol_scale, symptoms')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('urinations')
          .select('id, created_at, flow_characteristic, is_nighttime')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('meals')
          .select('id, created_at, meal_type, description')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setRecentEntries(buildUnifiedEntries(bowels || [], urinations || [], meals || []).slice(0, 8));
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  }, [user]);

  useEffect(() => {
    loadRecentEntries();
  }, [loadRecentEntries]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentEntries();
    setRefreshing(false);
  };

  const handleStoolPhotoAnalysisComplete = (data: any) => {
    setPrefilledBowelData(data);
    setBowelVisible(true);
  };

  const handleMealPhotoAnalysisComplete = (data: any) => {
    setPrefilledMealData(data);
    setMealVisible(true);
  };

  const handleBowelModalClose = () => {
    setBowelVisible(false);
    setPrefilledBowelData(null);
  };

  const handleMealModalClose = () => {
    setMealVisible(false);
    setPrefilledMealData(null);
  };

  const handleInsightsGenerated = (entryId: string) => {
    setCurrentEntryId(entryId);
    setInsightsVisible(true);
  };

  const openStoolCamera = () => {
    setCameraMode('stool');
    setCameraVisible(true);
  };

  const openMealCamera = () => {
    setCameraMode('meal');
    setMealCameraVisible(true);
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
          <Text style={styles.title}>Track Your Health</Text>
          <Text style={styles.subtitle}>Choose one thing to log. Small entries create useful patterns.</Text>
        </View>

        <View style={styles.trackingOptions}>
          <TouchableOpacity style={[baseStyles.card, styles.cameraCard]} onPress={openStoolCamera}>
            <View style={[styles.trackIconContainer, { backgroundColor: MEDITATIVE_COLORS.primary.lavender + '20' }]}>
              <Camera size={32} color={MEDITATIVE_COLORS.primary.lavender} />
            </View>
            <Text style={styles.trackTitle}>AI Stool Analysis</Text>
            <Text style={styles.trackDescription}>Snap a photo and let AI analyze your stool</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[baseStyles.card, styles.trackCard]} onPress={() => setBowelVisible(true)}>
            <View style={[styles.trackIconContainer, { backgroundColor: MEDITATIVE_COLORS.tracking.bowel + '20' }]}>
              <Text style={styles.trackEmoji}>💩</Text>
            </View>
            <Text style={styles.trackTitle}>Bowel Movement</Text>
            <Text style={styles.trackDescription}>Bristol scale, urgency, symptoms, and notes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[baseStyles.card, styles.trackCard]} onPress={() => setUrinationVisible(true)}>
            <View style={[styles.trackIconContainer, { backgroundColor: MEDITATIVE_COLORS.tracking.urination + '20' }]}>
              <Text style={styles.trackEmoji}>💧</Text>
            </View>
            <Text style={styles.trackTitle}>Urination</Text>
            <Text style={styles.trackDescription}>Volume, color, timing, and flow clues</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[baseStyles.card, styles.cameraCard]} onPress={openMealCamera}>
            <View style={[styles.trackIconContainer, { backgroundColor: MEDITATIVE_COLORS.primary.lavender + '20' }]}>
              <Camera size={32} color={MEDITATIVE_COLORS.primary.lavender} />
            </View>
            <Text style={styles.trackTitle}>AI Meal Analysis</Text>
            <Text style={styles.trackDescription}>Snap a photo and get nutritional estimates</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[baseStyles.card, styles.trackCard]} onPress={() => setMealVisible(true)}>
            <View style={[styles.trackIconContainer, { backgroundColor: MEDITATIVE_COLORS.tracking.meal + '20' }]}>
              <Text style={styles.trackEmoji}>🍽️</Text>
            </View>
            <Text style={styles.trackTitle}>Meal</Text>
            <Text style={styles.trackDescription}>Capture food context for later pattern detection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          {recentEntries.length === 0 ? (
            <View style={[baseStyles.card, styles.placeholderCard]}>
              <Text style={styles.placeholderText}>No entries yet. Start tracking to build your history.</Text>
            </View>
          ) : (
            recentEntries.map((entry) => (
              <View key={`${entry.type}-${entry.id}`} style={[baseStyles.card, styles.entryCard]}>
                <View style={styles.entryRow}>
                  <View style={styles.entryLeft}>
                    <View style={[styles.entryDot, { backgroundColor: ENTRY_COLORS[entry.type] }]} />
                    <View>
                      <Text style={styles.entryTitle}>{entry.title}</Text>
                      <Text style={styles.entryDetail}>{entry.detail}</Text>
                    </View>
                  </View>
                  <Text style={styles.entryTime}>{formatEntryTime(entry.created_at)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {bowelVisible && (
        <BowelMovementModal
          visible={bowelVisible}
          onClose={handleBowelModalClose}
          onSuccess={loadRecentEntries}
          onInsightsGenerated={handleInsightsGenerated}
          prefilledData={prefilledBowelData}
        />
      )}

      {insightsVisible && (
        <InsightsModal
          visible={insightsVisible}
          onClose={() => setInsightsVisible(false)}
          entryId={currentEntryId}
        />
      )}

      {cameraVisible && (
        <PhotoAnalysisModal
          visible={cameraVisible}
          onClose={() => setCameraVisible(false)}
          mode="stool"
          onStoolAnalysisComplete={handleStoolPhotoAnalysisComplete}
        />
      )}

      {mealCameraVisible && (
        <PhotoAnalysisModal
          visible={mealCameraVisible}
          onClose={() => setMealCameraVisible(false)}
          mode="meal"
          onMealAnalysisComplete={handleMealPhotoAnalysisComplete}
        />
      )}

      {urinationVisible && (
        <UrinationModal
          visible={urinationVisible}
          onClose={() => setUrinationVisible(false)}
          onSuccess={loadRecentEntries}
        />
      )}

      {mealVisible && (
        <MealModal
          visible={mealVisible}
          onClose={handleMealModalClose}
          onSuccess={loadRecentEntries}
          prefilledData={prefilledMealData}
        />
      )}

      <ChatbotButton onPress={() => setChatbotVisible(true)} />
      <ChatbotCompanion
        visible={chatbotVisible}
        onClose={() => setChatbotVisible(false)}
        category="encouragement"
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
  trackingOptions: {
    marginBottom: SPACING.xl,
  },
  trackCard: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  cameraCard: {
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MEDITATIVE_COLORS.primary.lavender + '40',
  },
  trackIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  trackEmoji: {
    fontSize: 32,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  trackDescription: {
    fontSize: 13,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  placeholderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  placeholderText: {
    color: MEDITATIVE_COLORS.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  entryCard: {
    marginBottom: SPACING.sm,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  entryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  entryDetail: {
    fontSize: 13,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: 2,
  },
  entryTime: {
    fontSize: 12,
    color: MEDITATIVE_COLORS.text.secondary,
    width: 88,
    textAlign: 'right',
  },
});

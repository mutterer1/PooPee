import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, baseStyles } from '@/theme/styles';
import { X, Sparkles } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import EntryInsightCard from './EntryInsightCard';

interface InsightsModalProps {
  visible: boolean;
  onClose: () => void;
  entryId: string | null;
}

interface Insight {
  id: string;
  insight_type: 'immediate' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  severity: 'normal' | 'attention' | 'positive';
  actionable_tips: string[];
}

export default function InsightsModal({ visible, onClose, entryId }: InsightsModalProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && entryId) {
      loadInsights();
    }
  }, [visible, entryId]);

  const loadInsights = async () => {
    if (!entryId) return;

    setLoading(true);

    try {
      let attempts = 0;
      const maxAttempts = 10;
      const delay = 500;

      while (attempts < maxAttempts) {
        const { data, error } = await supabase
          .from('entry_insights')
          .select('*')
          .eq('entry_id', entryId)
          .order('insight_type', { ascending: true });

        if (error) {
          break;
        }

        if (data && data.length > 0) {
          setInsights(data);
          setLoading(false);
          return;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInsights([]);
    setLoading(true);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles size={24} color={MEDITATIVE_COLORS.primary.lavender} />
            <Text style={styles.headerTitle}>Your Insights</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={MEDITATIVE_COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={MEDITATIVE_COLORS.primary.lavender} />
              <Text style={styles.loadingText}>Analyzing your entry...</Text>
              <Text style={styles.loadingSubtext}>
                Our AI is reviewing your data and historical patterns
              </Text>
            </View>
          ) : insights.length > 0 ? (
            <>
              <View style={styles.intro}>
                <Text style={styles.introText}>
                  Based on your entry and historical patterns, here's what we found:
                </Text>
              </View>

              {insights.map((insight) => (
                <EntryInsightCard key={insight.id} insight={insight} />
              ))}

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Keep logging entries to help us provide better insights over time.
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No insights available yet. Please try again in a moment.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={[baseStyles.button, styles.doneButton]} onPress={handleClose}>
            <Text style={baseStyles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MEDITATIVE_COLORS.text.secondary + '20',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginTop: SPACING.lg,
  },
  loadingSubtext: {
    fontSize: 14,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  intro: {
    marginBottom: SPACING.lg,
  },
  introText: {
    fontSize: 16,
    color: MEDITATIVE_COLORS.text.secondary,
    lineHeight: 24,
  },
  footer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: MEDITATIVE_COLORS.primary.lavender + '10',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: MEDITATIVE_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: MEDITATIVE_COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  bottomBar: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: MEDITATIVE_COLORS.text.secondary + '20',
  },
  doneButton: {
    backgroundColor: MEDITATIVE_COLORS.primary.lavender,
  },
});

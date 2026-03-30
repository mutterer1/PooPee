import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, BORDER_RADIUS, SHADOWS, baseStyles } from '@/theme/styles';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth.context';
import { X } from 'lucide-react-native';
import SuccessToast from './SuccessToast';

interface BowelMovementModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onInsightsGenerated?: (entryId: string) => void;
  prefilledData?: {
    bristolScale?: string;
    duration?: string;
    urgency?: number;
    satisfaction?: number;
    symptoms?: string[];
    notes?: string;
  };
}

const BRISTOL_TYPES = [
  { type: 'type_1', label: 'Type 1', description: 'Hard lumps' },
  { type: 'type_2', label: 'Type 2', description: 'Lumpy & bulky' },
  { type: 'type_3', label: 'Type 3', description: 'Like sausage' },
  { type: 'type_4', label: 'Type 4', description: 'Snake-like' },
  { type: 'type_5', label: 'Type 5', description: 'Soft blobs' },
  { type: 'type_6', label: 'Type 6', description: 'Fluffy bits' },
  { type: 'type_7', label: 'Type 7', description: 'All liquid' },
];

const COLOR_OPTIONS = ['#8B4513', '#D2B48C', '#A0826D', '#6B4423', '#9B7653'];

const SYMPTOMS = ['Pain', 'Bloating', 'Cramping', 'Straining', 'Mucus', 'Blood'];

export default function BowelMovementModal({ visible, onClose, onSuccess, onInsightsGenerated, prefilledData }: BowelMovementModalProps) {
  const { user } = useAuth();
  const [bristol, setBristol] = useState<string | null>(prefilledData?.bristolScale || null);
  const [color, setColor] = useState(COLOR_OPTIONS[2]);
  const [duration, setDuration] = useState(prefilledData?.duration || '');
  const [urgency, setUrgency] = useState(prefilledData?.urgency || 3);
  const [satisfaction, setSatisfaction] = useState(prefilledData?.satisfaction || 3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(prefilledData?.symptoms || []);
  const [notes, setNotes] = useState(prefilledData?.notes || '');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const generateInsights = async (entryId: string, entryData: any) => {
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-entry-insights`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryType: 'bowel_movement',
          entryId: entryId,
          entryData: entryData,
        }),
      });

      const result = await response.json();

      if (result.success && onInsightsGenerated) {
        onInsightsGenerated(entryId);
      }
    } catch {
      // Failed to generate insights
    }
  };

  const handleSubmit = async () => {
    if (!bristol) {
      Alert.alert('Validation', 'Please select a Bristol scale type');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to save entries');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.from('bowel_movements').insert([
        {
          user_id: user.id,
          bristol_scale: bristol,
          color,
          duration_seconds: duration ? parseInt(duration) : null,
          urgency_level: urgency,
          satisfaction_rating: satisfaction,
          symptoms: selectedSymptoms,
          notes: notes || null,
        },
      ]).select();

      if (error) {
        throw error;
      }

      const entryId = data[0]?.id;

      if (entryId) {
        generateInsights(entryId, {
          bristol_scale: bristol,
          color,
          duration_seconds: duration ? parseInt(duration) : null,
          urgency_level: urgency,
          satisfaction_rating: satisfaction,
          symptoms: selectedSymptoms,
          notes: notes || null,
        });
      }

      resetForm();
      onSuccess?.();
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save bowel movement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setBristol(null);
    setColor(COLOR_OPTIONS[2]);
    setDuration('');
    setUrgency(3);
    setSatisfaction(3);
    setSelectedSymptoms([]);
    setNotes('');
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  return (
   <Modal
  visible={visible}
  animationType="slide"
  transparent
  onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bowel Movement</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={MEDITATIVE_COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Bristol Scale Type</Text>
          <View style={styles.bristolGrid}>
            {BRISTOL_TYPES.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.bristolCard,
                  bristol === item.type && styles.bristolCardActive,
                ]}
                onPress={() => setBristol(item.type)}>
                <Text style={styles.bristolLabel}>{item.label}</Text>
                <Text style={styles.bristolDesc}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.colorOption,
                  { backgroundColor: opt },
                  color === opt && styles.colorOptionActive,
                ]}
                onPress={() => setColor(opt)}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Duration (seconds)</Text>
          <TextInput
            style={baseStyles.input}
            placeholder="e.g., 120"
            keyboardType="number-pad"
            value={duration}
            onChangeText={setDuration}
          />

          <Text style={styles.sectionTitle}>Urgency Level: {urgency}</Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 3, 4, 5].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.sliderButton, urgency === val && styles.sliderButtonActive]}
                onPress={() => setUrgency(val)}>
                <Text style={styles.sliderText}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Satisfaction: {satisfaction}</Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 3, 4, 5].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.sliderButton, satisfaction === val && styles.sliderButtonActive]}
                onPress={() => setSatisfaction(val)}>
                <Text style={styles.sliderText}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Symptoms</Text>
          <View style={styles.symptomsGrid}>
            {SYMPTOMS.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomButton,
                  selectedSymptoms.includes(symptom) && styles.symptomButtonActive,
                ]}
                onPress={() => toggleSymptom(symptom)}>
                <Text
                  style={[
                    styles.symptomText,
                    selectedSymptoms.includes(symptom) && styles.symptomTextActive,
                  ]}>
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[baseStyles.input, styles.notesInput]}
            placeholder="Additional notes..."
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity
            style={[baseStyles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={saving}>
            <Text style={baseStyles.buttonText}>{saving ? 'Saving...' : 'Save Entry'}</Text>
          </TouchableOpacity>
        </ScrollView>
        <SuccessToast
          visible={showSuccess}
          message="Log Successful!"
          onHide={() => setShowSuccess(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.light,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MEDITATIVE_COLORS.neutral.lightGray,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  bristolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  bristolCard: {
    width: '31%',
    backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bristolCardActive: {
    borderColor: MEDITATIVE_COLORS.primary.lavender,
    backgroundColor: MEDITATIVE_COLORS.primary.lavender + '15',
  },
  bristolLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  bristolDesc: {
    fontSize: 11,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: MEDITATIVE_COLORS.primary.lavender,
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  sliderButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MEDITATIVE_COLORS.neutral.lightGray,
  },
  sliderButtonActive: {
    backgroundColor: MEDITATIVE_COLORS.primary.lavender,
    borderColor: MEDITATIVE_COLORS.primary.lavender,
  },
  sliderText: {
    fontSize: 16,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  symptomButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: MEDITATIVE_COLORS.neutral.lightGray,
  },
  symptomButtonActive: {
    backgroundColor: MEDITATIVE_COLORS.primary.lavender,
    borderColor: MEDITATIVE_COLORS.primary.lavender,
  },
  symptomText: {
    fontSize: 12,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  symptomTextActive: {
    color: MEDITATIVE_COLORS.backgrounds.card,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: MEDITATIVE_COLORS.primary.lavender,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});

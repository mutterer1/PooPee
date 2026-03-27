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
import { SPACING, BORDER_RADIUS, baseStyles } from '@/theme/styles';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth.context';
import { X } from 'lucide-react-native';
import SuccessToast from './SuccessToast';

interface UrinationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const URINE_COLORS = [
  { color: '#FFF8DC', label: 'Clear' },
  { color: '#FFFFE0', label: 'Pale' },
  { color: '#FFE4B5', label: 'Light' },
  { color: '#F0E68C', label: 'Yellow' },
  { color: '#FFD700', label: 'Dark' },
  { color: '#DAA520', label: 'Deep' },
];

const FLOW_OPTIONS = ['Normal', 'Weak', 'Interrupted'];
const SYMPTOMS = ['Pain', 'Burning', 'Difficulty', 'Frequency', 'Urgency'];

export default function UrinationModal({ visible, onClose, onSuccess }: UrinationModalProps) {
  const { user } = useAuth();
  const [volume, setVolume] = useState('');
  const [colorValue, setColorValue] = useState(URINE_COLORS[2].color);
  const [flow, setFlow] = useState('Normal');
  const [urgency, setUrgency] = useState(3);
  const [frequency, setFrequency] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isNighttime, setIsNighttime] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save entries');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.from('urinations').insert([
        {
          user_id: user.id,
          volume_estimate: volume ? parseInt(volume) : null,
          color: colorValue,
          flow_characteristic: flow,
          urgency_level: urgency,
          frequency_level: frequency,
          symptoms: selectedSymptoms,
          is_nighttime: isNighttime,
          notes: notes || null,
        },
      ]).select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Urination saved successfully:', data);
      resetForm();
      onSuccess?.();
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', error?.message || 'Failed to save urination. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setVolume('');
    setColorValue(URINE_COLORS[2].color);
    setFlow('Normal');
    setUrgency(3);
    setFrequency(3);
    setSelectedSymptoms([]);
    setIsNighttime(false);
    setNotes('');
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Urination</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={MEDITATIVE_COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Volume (mL)</Text>
          <TextInput
            style={baseStyles.input}
            placeholder="e.g., 200"
            keyboardType="number-pad"
            value={volume}
            onChangeText={setVolume}
          />

          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorRow}>
            {URINE_COLORS.map((item) => (
              <TouchableOpacity
                key={item.color}
                style={[
                  styles.colorOption,
                  { backgroundColor: item.color },
                  colorValue === item.color && styles.colorOptionActive,
                ]}
                onPress={() => setColorValue(item.color)}>
                <Text style={styles.colorLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Flow Characteristic</Text>
          <View style={styles.flowRow}>
            {FLOW_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.flowButton,
                  flow === option && styles.flowButtonActive,
                ]}
                onPress={() => setFlow(option)}>
                <Text
                  style={[
                    styles.flowText,
                    flow === option && styles.flowTextActive,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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

          <Text style={styles.sectionTitle}>Frequency: {frequency}</Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 3, 4, 5].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.sliderButton, frequency === val && styles.sliderButtonActive]}
                onPress={() => setFrequency(val)}>
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

          <View style={styles.nighttimeToggle}>
            <Text style={styles.nighttimeLabel}>Nighttime Urination</Text>
            <TouchableOpacity
              style={[styles.toggleButton, isNighttime && styles.toggleButtonActive]}
              onPress={() => setIsNighttime(!isNighttime)}>
              <Text style={styles.toggleText}>{isNighttime ? 'Yes' : 'No'}</Text>
            </TouchableOpacity>
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
  colorRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  colorOption: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: MEDITATIVE_COLORS.primary.sky,
  },
  colorLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  flowRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  flowButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MEDITATIVE_COLORS.neutral.lightGray,
  },
  flowButtonActive: {
    backgroundColor: MEDITATIVE_COLORS.primary.sky,
    borderColor: MEDITATIVE_COLORS.primary.sky,
  },
  flowText: {
    fontSize: 12,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  flowTextActive: {
    color: MEDITATIVE_COLORS.backgrounds.card,
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
    backgroundColor: MEDITATIVE_COLORS.primary.sky,
    borderColor: MEDITATIVE_COLORS.primary.sky,
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
    backgroundColor: MEDITATIVE_COLORS.primary.sky,
    borderColor: MEDITATIVE_COLORS.primary.sky,
  },
  symptomText: {
    fontSize: 12,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  symptomTextActive: {
    color: MEDITATIVE_COLORS.backgrounds.card,
  },
  nighttimeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  nighttimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  toggleButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: MEDITATIVE_COLORS.neutral.lightGray,
    borderRadius: BORDER_RADIUS.md,
  },
  toggleButtonActive: {
    backgroundColor: MEDITATIVE_COLORS.primary.sky,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: MEDITATIVE_COLORS.primary.sky,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});

import React, { useState, useEffect } from 'react';
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

interface MealModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefilledData?: {
    description: string;
    estimatedCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function MealModal({ visible, onClose, onSuccess, prefilledData }: MealModalProps) {
  const { user } = useAuth();
  const [mealType, setMealType] = useState('breakfast');
  const [description, setDescription] = useState(prefilledData?.description || '');
  const [calories, setCalories] = useState(prefilledData?.estimatedCalories?.toString() || '');
  const [carbs, setCarbs] = useState(prefilledData?.macros?.carbs?.toString() || '');
  const [protein, setProtein] = useState(prefilledData?.macros?.protein?.toString() || '');
  const [fat, setFat] = useState(prefilledData?.macros?.fat?.toString() || '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (prefilledData) {
      setDescription(prefilledData.description);
      setCalories(prefilledData.estimatedCalories.toString());
      setCarbs(Math.round(prefilledData.macros.carbs).toString());
      setProtein(Math.round(prefilledData.macros.protein).toString());
      setFat(Math.round(prefilledData.macros.fat).toString());
    }
  }, [prefilledData]);

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert('Validation', 'Please enter meal description');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to save entries');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.from('meals').insert([
        {
          user_id: user.id,
          meal_type: mealType,
          description,
          calories: calories ? parseInt(calories) : null,
          carbs_grams: carbs ? parseInt(carbs) : null,
          protein_grams: protein ? parseInt(protein) : null,
          fat_grams: fat ? parseInt(fat) : null,
          notes: notes || null,
        },
      ]).select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Meal saved successfully:', data);
      resetForm();
      onSuccess?.();
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', error?.message || 'Failed to save meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setMealType('breakfast');
    setDescription('');
    setCalories('');
    setCarbs('');
    setProtein('');
    setFat('');
    setNotes('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Log Meal</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={MEDITATIVE_COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypeRow}>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  mealType === type && styles.mealTypeButtonActive,
                ]}
                onPress={() => setMealType(type)}>
                <Text
                  style={[
                    styles.mealTypeText,
                    mealType === type && styles.mealTypeTextActive,
                  ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Meal Description</Text>
          <TextInput
            style={[baseStyles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="What did you eat? (e.g., grilled chicken with vegetables, brown rice)"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.sectionTitle}>Nutritional Information (Optional)</Text>

          <View style={styles.nutritionRow}>
            <View style={styles.nutritionField}>
              <Text style={baseStyles.label}>Calories</Text>
              <TextInput
                style={baseStyles.input}
                placeholder="0"
                keyboardType="number-pad"
                value={calories}
                onChangeText={setCalories}
              />
            </View>

            <View style={styles.nutritionField}>
              <Text style={baseStyles.label}>Carbs (g)</Text>
              <TextInput
                style={baseStyles.input}
                placeholder="0"
                keyboardType="number-pad"
                value={carbs}
                onChangeText={setCarbs}
              />
            </View>
          </View>

          <View style={styles.nutritionRow}>
            <View style={styles.nutritionField}>
              <Text style={baseStyles.label}>Protein (g)</Text>
              <TextInput
                style={baseStyles.input}
                placeholder="0"
                keyboardType="number-pad"
                value={protein}
                onChangeText={setProtein}
              />
            </View>

            <View style={styles.nutritionField}>
              <Text style={baseStyles.label}>Fat (g)</Text>
              <TextInput
                style={baseStyles.input}
                placeholder="0"
                keyboardType="number-pad"
                value={fat}
                onChangeText={setFat}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[baseStyles.input, styles.notesInput]}
            placeholder="Additional notes about this meal..."
            multiline
            numberOfLines={2}
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity
            style={[baseStyles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={saving}>
            <Text style={baseStyles.buttonText}>{saving ? 'Saving...' : 'Save Meal'}</Text>
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
  mealTypeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MEDITATIVE_COLORS.neutral.lightGray,
  },
  mealTypeButtonActive: {
    backgroundColor: MEDITATIVE_COLORS.primary.coral,
    borderColor: MEDITATIVE_COLORS.primary.coral,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  mealTypeTextActive: {
    color: MEDITATIVE_COLORS.backgrounds.card,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  nutritionField: {
    flex: 1,
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: MEDITATIVE_COLORS.primary.coral,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});

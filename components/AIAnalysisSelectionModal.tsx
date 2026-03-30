import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, baseStyles } from '@/theme/styles';
import { Camera, Microscope } from 'lucide-react-native';

interface AIAnalysisSelectionModalProps {
  visible: boolean;
  onSelectStool: () => void;
  onSelectMeal: () => void;
  onClose: () => void;
}

export default function AIAnalysisSelectionModal({
  visible,
  onSelectStool,
  onSelectMeal,
  onClose,
}: AIAnalysisSelectionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[baseStyles.card, styles.modalContent]}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Analysis</Text>
            <Text style={styles.subtitle}>Choose what you'd like to analyze</Text>
          </View>

          <TouchableOpacity style={styles.option} onPress={onSelectStool}>
            <View style={styles.optionIcon}>
              <Microscope size={28} color={MEDITATIVE_COLORS.primary.lavender} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Stool Analysis</Text>
              <Text style={styles.optionDescription}>
                Snap a photo and let AI analyze your stool health.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onSelectMeal}>
            <View style={styles.optionIcon}>
              <Camera size={28} color={MEDITATIVE_COLORS.primary.lavender} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Meal Analysis</Text>
              <Text style={styles.optionDescription}>
                Snap a photo and get nutritional estimates.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    marginBottom: 0,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    color: MEDITATIVE_COLORS.text.secondary,
  },
  option: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 16,
    backgroundColor: 'rgba(142, 125, 190, 0.08)',
    alignItems: 'flex-start',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(142, 125, 190, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: MEDITATIVE_COLORS.text.secondary,
  },
  closeButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.secondary,
  },
});

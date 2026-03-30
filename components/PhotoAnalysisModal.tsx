import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, BORDER_RADIUS, baseStyles } from '@/theme/styles';
import { Camera, X, RotateCcw, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth.context';

type AnalysisMode = 'stool' | 'meal';

interface StoolAnalysisData {
  bristolScale: string;
  duration: string;
  urgency: number;
  satisfaction: number;
  symptoms: string[];
  notes: string;
}

interface MealAnalysisData {
  description: string;
  estimatedCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  confidence: string;
}

interface PhotoAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  mode: AnalysisMode;
  onStoolAnalysisComplete?: (data: StoolAnalysisData) => void;
  onMealAnalysisComplete?: (data: MealAnalysisData) => void;
}

export default function PhotoAnalysisModal({ visible, onClose, mode, onStoolAnalysisComplete, onMealAnalysisComplete }: PhotoAnalysisModalProps) {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(true);

  const handleClose = () => {
    setCapturedPhoto(null);
    setShowCamera(true);
    setAnalyzing(false);
    onClose();
  };

  const takePicture = async () => {
    if (!cameraRef) return;

    try {
      const photo = await cameraRef.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (photo?.uri && photo?.base64) {
        setCapturedPhoto(photo.base64);
        setShowCamera(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const analyzePhoto = async () => {
    if (!capturedPhoto || !user) return;

    setAnalyzing(true);

    try {
      if (mode === 'stool') {
        const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/analyze-stool-photo`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            photoBase64: capturedPhoto,
          }),
        });

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        const analysis = result.analysis;

        handleClose();

        if (onStoolAnalysisComplete) {
          onStoolAnalysisComplete({
            bristolScale: analysis.bristolScale,
            duration: analysis.estimatedDuration?.toString() || '',
            urgency: analysis.suggestedUrgency,
            satisfaction: analysis.suggestedSatisfaction,
            symptoms: analysis.detectedSymptoms,
            notes: analysis.notes,
          });
        }
      } else if (mode === 'meal') {
        const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/analyze-meal-photo`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: capturedPhoto,
          }),
        });

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        handleClose();

        if (onMealAnalysisComplete) {
          onMealAnalysisComplete({
            description: result.description,
            estimatedCalories: result.estimatedCalories,
            macros: result.macros,
            confidence: result.confidence,
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze photo. Please try again.');
      setAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowCamera(true);
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color={MEDITATIVE_COLORS.primary.lavender} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need your permission to use the camera for photo analysis
          </Text>
          <TouchableOpacity style={[baseStyles.button, styles.permissionButton]} onPress={requestPermission}>
            <Text style={baseStyles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={MEDITATIVE_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{mode === 'stool' ? 'Analyze Stool Photo' : 'Analyze Meal Photo'}</Text>
          <View style={styles.placeholder} />
        </View>

        {showCamera && (
          <>

            <CameraView
              style={styles.camera}
              facing={facing}
              ref={(ref) => setCameraRef(ref)}
            >
              <View style={styles.cameraOverlay}>
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
                >
                  <RotateCcw size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </CameraView>

            <View style={styles.captureButtonContainer}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {capturedPhoto && !showCamera && (
          <>
            <Image source={{ uri: `data:image/jpeg;base64,${capturedPhoto}` }} style={styles.preview} />
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[baseStyles.button, styles.retakeButton]}
                onPress={retakePhoto}
                disabled={analyzing}
              >
                <RotateCcw size={20} color={MEDITATIVE_COLORS.text.primary} />
                <Text style={[baseStyles.buttonText, styles.retakeButtonText]}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[baseStyles.button, styles.analyzeButton]}
                onPress={analyzePhoto}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Check size={20} color="#FFFFFF" />
                    <Text style={baseStyles.buttonText}>Analyze</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MEDITATIVE_COLORS.backgrounds.card + '40',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  camera: {
    flex: 1,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: SPACING.md,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  captureButtonContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: MEDITATIVE_COLORS.primary.lavender,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: MEDITATIVE_COLORS.primary.lavender,
  },
  preview: {
    flex: 1,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  retakeButtonText: {
    color: MEDITATIVE_COLORS.text.primary,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: MEDITATIVE_COLORS.primary.lavender,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.light,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: MEDITATIVE_COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  permissionText: {
    fontSize: 16,
    color: MEDITATIVE_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  permissionButton: {
    backgroundColor: MEDITATIVE_COLORS.primary.lavender,
    minWidth: 200,
    marginBottom: SPACING.md,
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  cancelButtonText: {
    fontSize: 16,
    color: MEDITATIVE_COLORS.text.secondary,
    fontWeight: '600',
  },
});

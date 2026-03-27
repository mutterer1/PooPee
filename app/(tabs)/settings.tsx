import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useAuth } from '@/lib/auth.context';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, BORDER_RADIUS, baseStyles } from '@/theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import BackgroundWatermark from '@/components/BackgroundWatermark';

interface ChatbotPreferences {
  enabled: boolean;
  accent: 'british' | 'southern' | 'australian';
  voice_gender: 'male' | 'female';
  speech_rate: number;
  volume_level: number;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [preferences, setPreferences] = useState<ChatbotPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('chatbot_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setPreferences(data);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const updatePreferences = async (updates: Partial<ChatbotPreferences>) => {
    if (!user || !preferences) return;

    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    try {
      await supabase
        .from('chatbot_preferences')
        .update(updates)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setPreferences(preferences);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackgroundWatermark />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chatbot Companion</Text>

          <View style={[baseStyles.card, styles.settingRow]}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingTitle}>Enable Chatbot</Text>
              <Text style={styles.settingDescription}>Personalized health companion with voice</Text>
            </View>
            {preferences && (
              <Switch
                value={preferences.enabled}
                onValueChange={(value) => updatePreferences({ enabled: value })}
                trackColor={{ false: MEDITATIVE_COLORS.neutral.lightGray, true: MEDITATIVE_COLORS.primary.lavender }}
              />
            )}
          </View>

          {preferences?.enabled && (
            <>
              <View style={[baseStyles.card, styles.settingRow]}>
                <Text style={styles.settingTitle}>Accent</Text>
                <View style={styles.optionRow}>
                  {['british', 'southern', 'australian'].map((accent) => (
                    <TouchableOpacity
                      key={accent}
                      style={[
                        styles.optionButton,
                        preferences.accent === accent && styles.optionButtonActive,
                      ]}
                      onPress={() => updatePreferences({ accent: accent as any })}>
                      <Text
                        style={[
                          styles.optionText,
                          preferences.accent === accent && styles.optionTextActive,
                        ]}>
                        {accent.charAt(0).toUpperCase() + accent.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[baseStyles.card, styles.settingRow]}>
                <Text style={styles.settingTitle}>Voice Gender</Text>
                <View style={styles.optionRow}>
                  {['male', 'female'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.optionButton,
                        preferences.voice_gender === gender && styles.optionButtonActive,
                      ]}
                      onPress={() => updatePreferences({ voice_gender: gender as any })}>
                      <Text
                        style={[
                          styles.optionText,
                          preferences.voice_gender === gender && styles.optionTextActive,
                        ]}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={[baseStyles.card, styles.dangerButton]} onPress={handleLogout}>
            <View style={styles.dangerContent}>
              <LogOut size={20} color={MEDITATIVE_COLORS.semantic.error} />
              <Text style={styles.dangerText}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PooPee v1.0.0</Text>
          <Text style={styles.footerSubtext}>Your personal wellness companion</Text>
        </View>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  settingLabel: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  settingDescription: {
    fontSize: 13,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  optionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: MEDITATIVE_COLORS.neutral.lightGray,
  },
  optionButtonActive: {
    backgroundColor: MEDITATIVE_COLORS.primary.lavender,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  optionTextActive: {
    color: MEDITATIVE_COLORS.backgrounds.card,
  },
  dangerButton: {
    borderLeftWidth: 4,
    borderLeftColor: MEDITATIVE_COLORS.semantic.error,
  },
  dangerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.semantic.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: MEDITATIVE_COLORS.neutral.lightGray,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: MEDITATIVE_COLORS.text.primary,
  },
  footerSubtext: {
    fontSize: 12,
    color: MEDITATIVE_COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
});

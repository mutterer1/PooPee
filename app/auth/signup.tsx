import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth.context';
import { DS, MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, BORDER_RADIUS, baseStyles, buttonStyles } from '@/theme/styles';
import PooPeeLogo from '@/components/PooPeeLogo';
import GradientBackground from '@/components/GradientBackground';

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(email, password, displayName);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setError('');
    router.push('/auth/login');
  };

  const styles = buttonStyles(DS.primary);

  return (
    <View style={localStyles.root}>
      <GradientBackground />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={localStyles.container}>
      <ScrollView contentContainerStyle={localStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={localStyles.header}>
          <PooPeeLogo height={120} />
          <Text style={localStyles.subtitle}>Smarter Tracking for Life's Most Overlooked Signals</Text>
        </View>

        <View style={localStyles.form}>
          {error ? <Text style={localStyles.errorText}>{error}</Text> : null}

          <View style={localStyles.inputGroup}>
            <Text style={baseStyles.label}>Display Name</Text>
            <TextInput
              style={baseStyles.input}
              placeholder="Your name"
              placeholderTextColor={DS.outline}
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                setError('');
              }}
              editable={!loading}
            />
          </View>

          <View style={localStyles.inputGroup}>
            <Text style={baseStyles.label}>Email</Text>
            <TextInput
              style={baseStyles.input}
              placeholder="your@email.com"
              placeholderTextColor={DS.outline}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={localStyles.inputGroup}>
            <Text style={baseStyles.label}>Password</Text>
            <TextInput
              style={baseStyles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={DS.outline}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              editable={!loading}
              secureTextEntry
            />
          </View>

          <View style={localStyles.inputGroup}>
            <Text style={baseStyles.label}>Confirm Password</Text>
            <TextInput
              style={baseStyles.input}
              placeholder="Confirm your password"
              placeholderTextColor={DS.outline}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
              editable={!loading}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primary, { marginTop: SPACING.lg }]}
            onPress={handleSignUp}
            disabled={loading}>
            <Text style={baseStyles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <View style={localStyles.divider} />

          <TouchableOpacity onPress={goToLogin} disabled={loading}>
            <Text style={localStyles.linkText}>
              Already have an account? <Text style={localStyles.linkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  subtitle: {
    fontSize: 15,
    color: DS.onSurfaceVariant,
    marginTop: SPACING.sm,
    textAlign: 'center',
    maxWidth: 320,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  errorText: {
    backgroundColor: DS.tertiaryFixed,
    color: DS.onTertiaryFixed,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: DS.surfaceContainerHighest,
    marginVertical: SPACING.lg,
  },
  linkText: {
    textAlign: 'center',
    color: DS.onSurface,
    fontSize: 14,
  },
  linkBold: {
    fontWeight: '700',
    color: DS.primary,
  },
});

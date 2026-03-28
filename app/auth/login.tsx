import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth.context';
import { DS, MEDITATIVE_COLORS } from '@/theme/colors';
import { SPACING, BORDER_RADIUS, baseStyles, buttonStyles } from '@/theme/styles';
import PooPeeLogo from '@/components/PooPeeLogo';
import GradientBackground from '@/components/GradientBackground';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const styles = buttonStyles(DS.primary);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  };

  const goToSignup = () => {
    setError('');
    router.push('/auth/signup');
  };

  return (
    <View style={localStyles.root}>
      <GradientBackground />
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={localStyles.container}
    >
      <ScrollView contentContainerStyle={localStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={localStyles.header}>
          <PooPeeLogo height={120} />
          <Text style={localStyles.subtitle}>
            Smarter tracking for life&apos;s most overlooked signals.
          </Text>
        </View>

        <View style={localStyles.form}>
          {error ? <Text style={localStyles.errorText}>{error}</Text> : null}

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
              placeholder="Enter your password"
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

          <TouchableOpacity
            style={[styles.primary, localStyles.signInButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={baseStyles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={localStyles.divider} />

          <TouchableOpacity onPress={goToSignup} disabled={loading}>
            <Text style={localStyles.linkText}>
              Don&apos;t have an account? <Text style={localStyles.linkBold}>Sign Up</Text>
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
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: DS.onSurfaceVariant,
    marginTop: 14,
    textAlign: 'center',
    maxWidth: 320,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: 18,
  },
  errorText: {
    backgroundColor: DS.tertiaryFixed,
    color: DS.onTertiaryFixed,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    fontSize: 14,
  },
  signInButton: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: DS.surfaceContainerHighest,
    marginVertical: SPACING.lg,
  },
  linkText: {
    textAlign: 'center',
    color: DS.onSurface,
    fontSize: 15,
  },
  linkBold: {
    fontWeight: '700',
    color: DS.primary,
  },
});

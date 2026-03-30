import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/lib/auth.context';
import { View, StyleSheet, Text } from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PooPeeLogo from '@/components/PooPeeLogo';

function RootLayoutContent() {
  const { loading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, loading]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <PooPeeLogo size={300} showText={true} stacked={true} />
        <Text style={styles.loadingTagline}>
          Smarter tracking for life's most overlooked signals.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MEDITATIVE_COLORS.backgrounds.light,
    paddingHorizontal: 24,
  },
  loadingTagline: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    color: MEDITATIVE_COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 270,
  },
});

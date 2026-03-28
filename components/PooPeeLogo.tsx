import { View, Text, Image, StyleSheet } from 'react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';

const logoImage = require('@/assets/images/branding/logo.png');

interface PooPeeLogoProps {
  size?: number;
  showText?: boolean;
  stacked?: boolean;
}

export default function PooPeeLogo({ size = 120, showText = true, stacked = false }: PooPeeLogoProps) {
  const logoWidth = stacked ? size * 1.4 : size * 1.1;
  const logoHeight = logoWidth * 0.4;
  const taglineSize = size * 0.065;

  if (stacked) {
    return (
      <View style={styles.stackedContainer}>
        <Image source={logoImage} style={{ width: logoWidth, height: logoHeight }} resizeMode="contain" />
        {showText !== false && (
          <Text style={[styles.tagline, { fontSize: taglineSize }]}>
            Track. Understand. Thrive.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <Image source={logoImage} style={{ width: logoWidth, height: logoHeight }} resizeMode="contain" />
      {showText !== false && (
        <Text style={[styles.tagline, { fontSize: taglineSize }]}>
          Track. Understand. Thrive.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stackedContainer: {
    alignItems: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagline: {
    color: MEDITATIVE_COLORS.text.secondary,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.3,
  },
});

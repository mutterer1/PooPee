import { Image, View, Text, StyleSheet } from 'react-native';

interface PooPeeLogoProps {
  size?: number;
  showText?: boolean;
  stacked?: boolean;
}

export default function PooPeeLogo({ size = 120, showText = true, stacked = false }: PooPeeLogoProps) {
  const logoAspect = 2.67;
  const logoWidth = size * logoAspect;
  const logoHeight = size;

  const taglineSize = size * 0.07;

  if (stacked) {
    return (
      <View style={[styles.stackedContainer, styles.whiteBg]}>
        <Image
          source={require('@/assets/images/branding/logo.png')}
          style={{ width: logoWidth, height: logoHeight, backgroundColor: '#FFFFFF' }}
          resizeMode="contain"
        />
        {showText && (
          <Text style={[styles.tagline, { fontSize: taglineSize }]}>
            Track. Understand. Thrive.
          </Text>
        )}
      </View>
    );
  }

  return (
    <Image
      source={require('@/assets/images/branding/logo.png')}
      style={{ width: logoWidth, height: logoHeight, backgroundColor: '#FFFFFF' }}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  stackedContainer: {
    alignItems: 'center',
  },
  whiteBg: {
    backgroundColor: '#FFFFFF',
  },
  tagline: {
    color: '#7d7679',
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.3,
  },
});

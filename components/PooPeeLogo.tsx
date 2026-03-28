import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PooPeeLogoProps {
  size?: number;
  showText?: boolean;
  stacked?: boolean;
}

function PooPeeIconMark({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Sage green left leaf */}
      <Path
        d="M18 8 C10 8, 4 16, 4 26 C4 38, 10 50, 22 54 C22 54, 28 56, 30 52 C30 52, 32 48, 28 44 C24 40, 14 36, 14 26 C14 18, 18 12, 22 10 C20 9, 19 8, 18 8Z"
        fill="#a8b89a"
      />
      {/* Lavender/purple right petal */}
      <Path
        d="M34 4 C28 4, 22 10, 22 20 C22 30, 28 40, 36 46 C40 49, 44 50, 46 48 C50 44, 50 36, 46 28 C42 20, 40 12, 38 6 C37 5, 35 4, 34 4Z"
        fill="#9b7bb5"
      />
      {/* Peach bottom accent */}
      <Path
        d="M22 44 C18 46, 16 50, 18 54 C20 58, 26 60, 32 58 C36 56, 38 52, 36 48 C34 44, 28 42, 24 43 C23 43, 22 43.5, 22 44Z"
        fill="#f4b8a0"
      />
    </Svg>
  );
}

export default function PooPeeLogo({ size = 120, showText = true, stacked = false }: PooPeeLogoProps) {
  const iconSize = size * 0.52;
  const brandNameSize = size * 0.195;
  const subtitleSize = size * 0.16;
  const taglineSize = size * 0.07;

  if (stacked) {
    return (
      <View style={styles.stackedContainer}>
        <View style={styles.inlineContainer}>
          <PooPeeIconMark size={iconSize} />
          {showText && (
            <View style={styles.textBlock}>
              <Text style={[styles.brandName, { fontSize: brandNameSize }]}>
                PooPee
              </Text>
              <Text style={[styles.brandSubtitle, { fontSize: subtitleSize }]}>
                Health
              </Text>
            </View>
          )}
        </View>
        {showText && (
          <Text style={[styles.tagline, { fontSize: taglineSize }]}>
            Track. Understand. Thrive.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <PooPeeIconMark size={iconSize} />
      {showText && (
        <View style={styles.textBlock}>
          <Text style={[styles.brandName, { fontSize: brandNameSize }]}>
            PooPee
          </Text>
          <Text style={[styles.brandSubtitle, { fontSize: subtitleSize }]}>
            Health
          </Text>
        </View>
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
    gap: 10,
  },
  textBlock: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandName: {
    fontWeight: '700',
    color: '#3a3145',
    letterSpacing: -0.5,
    lineHeight: undefined,
  },
  brandSubtitle: {
    fontWeight: '400',
    color: '#7d7679',
    letterSpacing: 0.2,
    marginTop: -2,
  },
  tagline: {
    color: '#7d7679',
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.3,
  },
});

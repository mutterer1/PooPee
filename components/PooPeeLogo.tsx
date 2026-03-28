import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';
import { MEDITATIVE_COLORS } from '@/theme/colors';

interface PooPeeLogoProps {
  size?: number;
  showText?: boolean;
  stacked?: boolean;
}

function PoopEmoji({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="78" rx="36" ry="14" fill="#8B4513" opacity={0.25} />
      <Path
        d="M50 72 C28 72 20 58 26 46 C20 44 18 34 28 30 C24 18 36 12 44 20 C46 10 54 10 56 20 C64 12 76 18 72 30 C82 34 80 44 74 46 C80 58 72 72 50 72Z"
        fill="#8B5E3C"
      />
      <Path
        d="M50 68 C31 68 24 56 29 46 C23 44 22 36 31 33 C28 22 38 17 45 23 C47 15 53 15 55 23 C62 17 72 22 69 33 C78 36 77 44 71 46 C76 56 69 68 50 68Z"
        fill="#A0714F"
      />
      <Path
        d="M50 64 C34 64 28 54 32 46 C27 44 26 38 34 35 C31 26 40 22 46 27 C48 20 52 20 54 27 C60 22 69 26 66 35 C74 38 73 44 68 46 C72 54 66 64 50 64Z"
        fill="#C49A6C"
      />
      <Circle cx="42" cy="45" r="4" fill="#3D1F00" />
      <Circle cx="58" cy="45" r="4" fill="#3D1F00" />
      <Circle cx="43" cy="44" r="1.5" fill="#FFFFFF" />
      <Circle cx="59" cy="44" r="1.5" fill="#FFFFFF" />
      <Path
        d="M44 54 Q50 59 56 54"
        stroke="#3D1F00"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export default function PooPeeLogo({ size = 120, showText = true, stacked = false }: PooPeeLogoProps) {
  const iconSize = stacked ? size * 0.55 : size * 0.45;
  const fontSize = size * 0.16;
  const taglineSize = size * 0.065;

  if (stacked) {
    return (
      <View style={styles.stackedContainer}>
        <PoopEmoji size={iconSize} />
        {showText !== false && (
          <View style={styles.stackedTextWrap}>
            <Text style={[styles.brandName, { fontSize }]}>
              <Text style={{ color: MEDITATIVE_COLORS.tracking.bowel }}>Poo</Text>
              <Text style={{ color: MEDITATIVE_COLORS.tracking.urination }}>Pee</Text>
              <Text style={{ color: MEDITATIVE_COLORS.text.primary }}> Log</Text>
            </Text>
            <Text style={[styles.tagline, { fontSize: taglineSize }]}>
              Track. Understand. Thrive.
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <PoopEmoji size={iconSize} />
      {showText !== false && (
        <View style={styles.inlineTextWrap}>
          <Text style={[styles.brandName, { fontSize }]}>
            <Text style={{ color: MEDITATIVE_COLORS.tracking.bowel }}>Poo</Text>
            <Text style={{ color: MEDITATIVE_COLORS.tracking.urination }}>Pee</Text>
            <Text style={{ color: MEDITATIVE_COLORS.text.primary }}> Log</Text>
          </Text>
          <Text style={[styles.tagline, { fontSize: taglineSize }]}>
            Track. Understand. Thrive.
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
    gap: 8,
  },
  stackedTextWrap: {
    alignItems: 'center',
    marginTop: 6,
  },
  inlineTextWrap: {
    flexShrink: 1,
  },
  brandName: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: MEDITATIVE_COLORS.text.secondary,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});

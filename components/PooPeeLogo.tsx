import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PooPeeLogoProps {
  size?: number;
}

function LogoMark({ size = 80 }: { size?: number }) {
  const scale = size / 120;
  const w = 72 * scale;
  const h = 120 * scale;

  return (
    <Svg width={w} height={h} viewBox="0 0 72 120" fill="none">
      {/* Sage green left teardrop */}
      <Path
        d="M8 90 C8 110 20 124 36 124 C52 124 64 110 64 90 L64 30 C64 13 52 0 36 0 C20 0 8 13 8 30 Z"
        fill="#8fad8c"
      />
      {/* Soft coral bottom accent */}
      <Path
        d="M18 98 C18 112 26 122 36 122 C46 122 54 112 54 98 L54 82 C50 78 44 76 36 76 C28 76 22 78 18 82 Z"
        fill="#e8a898"
      />
      {/* Lavender right teardrop */}
      <Path
        d="M22 70 C22 90 32 106 44 106 C56 106 66 90 66 70 L66 18 C66 8 58 0 48 0 C38 0 22 8 22 18 Z"
        fill="#9b7ab8"
      />
      {/* White centre gap / highlight */}
      <Path
        d="M30 72 C30 78 33 84 36 84 C39 84 42 78 42 72 L42 28 C42 22 39 18 36 18 C33 18 30 22 30 28 Z"
        fill="#ffffff"
      />
    </Svg>
  );
}

export default function PooPeeLogo({ size = 100 }: PooPeeLogoProps) {
  const scale = size / 100;
  const markSize = 68 * scale;
  const titleSize = 32 * scale;
  const subtitleSize = 28 * scale;

  return (
    <View style={styles.row}>
      <LogoMark size={markSize} />
      <View style={[styles.textBlock, { marginLeft: 14 * scale }]}>
        <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.15 }]}>
          PooPee
        </Text>
        <Text style={[styles.subtitle, { fontSize: subtitleSize, lineHeight: subtitleSize * 1.15 }]}>
          Health
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  textBlock: {
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#3d3748',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontWeight: '400',
    color: '#7d7679',
    letterSpacing: 0.2,
  },
});

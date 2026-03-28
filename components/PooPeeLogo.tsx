import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PooPeeLogoProps {
  size?: number;
}

function LogoMark({ height = 64 }: { height?: number }) {
  // Viewbox derived from pixel analysis of PooPeeHealthLogo.png
  // Mark occupies x=314-766, y=328-682 on the 1536x1024 canvas (452×354px)
  // Normalised to 100×78 viewBox (maintaining 452:354 ≈ 1.277:1 ratio)
  const VW = 100;
  const VH = 78;
  const width = (VW / VH) * height;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VW} ${VH}`}>
      {/* ── Green teardrop (left, tall) ── */}
      {/* px bounds: x=4-144, y=0-280 → norm x=0.9-31.9, y=0-61.6 */}
      <Path
        d={`
          M 6 0
          C 2 0 0 3 0 7
          L 0 57
          C 0 63 2 68 5 71
          C 7 73 10 74 13 73
          C 17 72 20 68 20 62
          L 20 28
          C 22 24 26 21 30 20
          C 33 19 32 16 30 15
          C 24 12 20 7 20 1
          C 20 0 13 0 6 0
          Z
        `}
        fill="#a8b0a0"
      />

      {/* ── Lavender teardrop (upper right, rounded top, tapers down) ── */}
      {/* px bounds: x=124-272, y=0-230 → norm x=27.4-60.2, y=0-50.6 */}
      <Path
        d={`
          M 28 22
          C 20 20 18 14 20 8
          C 22 3 27 0 33 0
          C 44 0 58 8 60 20
          C 62 30 56 40 48 44
          C 44 46 40 47 36 48
          L 36 52
          C 36 54 34 56 32 56
          C 30 56 28 54 28 52
          L 28 22
          Z
        `}
        fill="#a890b8"
      />

      {/* ── Coral/peach blob (lower, between the two teardrops) ── */}
      {/* px bounds: x=52-144, y=212-354 → norm x=11.5-31.9, y=46.6-78 */}
      <Path
        d={`
          M 14 50
          C 10 50 7 53 7 57
          C 7 65 10 72 15 76
          C 18 78 22 78 25 76
          C 30 73 32 67 30 61
          C 29 56 26 51 21 50
          C 19 50 16 50 14 50
          Z
        `}
        fill="#f0b8a8"
      />

      {/* ── White S-curve gap between the shapes ── */}
      {/* Sits at the border of green and lavender, x≈17-32, y≈0-56 */}
      <Path
        d={`
          M 20 1
          C 22 5 24 10 25 16
          C 26 22 26 28 25 34
          C 24 40 22 44 22 48
          C 22 52 24 56 26 58
          C 26 60 28 62 28 52
          C 26 50 25 46 25 42
          C 26 38 28 34 28 28
          C 29 22 29 16 28 10
          C 27 6 26 2 24 0
          C 22 0 20 0 20 1
          Z
        `}
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export default function PooPeeLogo({ size = 100 }: PooPeeLogoProps) {
  const scale = size / 100;
  const markHeight = 56 * scale;
  const titleSize = 28 * scale;
  const subtitleSize = 24 * scale;

  return (
    <View style={styles.row}>
      <LogoMark height={markHeight} />
      <View style={[styles.textBlock, { marginLeft: 12 * scale }]}>
        <Text
          style={[
            styles.title,
            { fontSize: titleSize, lineHeight: titleSize * 1.1 },
          ]}
        >
          PooPee
        </Text>
        <Text
          style={[
            styles.subtitle,
            { fontSize: subtitleSize, lineHeight: subtitleSize * 1.2 },
          ]}
        >
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
  },
  textBlock: {
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#53505e',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontWeight: '400',
    color: '#75767d',
    letterSpacing: 0.1,
  },
});

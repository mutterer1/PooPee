import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PooPeeLogoProps {
  size?: number;
}

function LogoMark({ height = 72 }: { height?: number }) {
  const vbW = 100;
  const vbH = 170;
  const width = (vbW / vbH) * height;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${vbW} ${vbH}`} fill="none">
      {/*
        Coordinates derived from sampling the original Figma PNG (1601x600).
        Mark occupies approx x=158–448, y=42–542 on that canvas.
        Normalized to 100×170 viewBox:
          scaleX = 100 / (448-158) = 100/290 ≈ 0.345
          scaleY = 170 / (542-42)  = 170/500 = 0.34
          offsetX = -158 * 0.345 = -54.5
          offsetY = -42  * 0.34  = -14.3
      */}

      {/* Sage green teardrop — left, tall, rounded at bottom */}
      <Path
        d="
          M 0 14
          C 0 6 6 0 14 0
          C 22 0 28 6 28 14
          L 28 130
          C 28 148 20 160 10 162
          C 4 162 0 158 0 152
          Z
        "
        fill="#aab4a0"
      />

      {/* Soft coral/peach teardrop — bottom centre, small */}
      <Path
        d="
          M 14 118
          C 8 118 4 124 4 132
          C 4 148 12 162 24 166
          C 34 169 44 164 48 154
          C 52 144 48 132 40 126
          C 36 122 30 118 24 118
          Z
        "
        fill="#f5beaa"
      />

      {/* Lavender teardrop — right, slightly shorter, overlapping green */}
      <Path
        d="
          M 28 6
          C 28 2 38 0 48 0
          C 68 0 82 10 82 24
          C 82 32 76 40 68 44
          L 58 48
          L 58 126
          C 58 140 50 150 40 152
          C 36 152 32 150 28 148
          L 28 6
          Z
        "
        fill="#aa91b9"
      />

      {/* White S-curve gap between the two teardrops */}
      <Path
        d="
          M 28 12
          C 30 18 31 28 30 40
          C 29 52 26 60 26 72
          C 26 84 29 92 30 102
          C 31 112 30 122 28 132
          L 28 148
          C 30 150 32 150 34 148
          C 36 140 37 128 36 116
          C 35 104 32 96 32 84
          C 32 72 35 64 36 52
          C 37 40 36 28 34 18
          C 33 12 30 8 28 6
          Z
        "
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export default function PooPeeLogo({ size = 100 }: PooPeeLogoProps) {
  const scale = size / 100;
  const markHeight = 64 * scale;
  const titleSize = 31 * scale;
  const subtitleSize = 27 * scale;

  return (
    <View style={styles.row}>
      <LogoMark height={markHeight} />
      <View style={[styles.textBlock, { marginLeft: 14 * scale }]}>
        <Text
          style={[
            styles.title,
            { fontSize: titleSize, lineHeight: titleSize * 1.15 },
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
    backgroundColor: '#FFFFFF',
  },
  textBlock: {
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#504b5a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontWeight: '400',
    color: '#78787d',
    letterSpacing: 0.2,
  },
});

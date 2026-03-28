import { View, Image, StyleSheet } from 'react-native';

const SOURCE = require('../assets/images/branding/PooPeeHealthLogo.png');

// PNG canvas: 1536 × 1024
// Logo content region (mark + wordmark): x=314–1108, y=328–682 → 794 × 354 px
// Background color baked into the PNG: #fdf7f0
const PNG_W = 1536;
const PNG_H = 1024;
const CROP_X = 290;
const CROP_Y = 310;
const CROP_W = 840;
const CROP_H = 390;
const CROP_ASPECT = CROP_W / CROP_H;

interface PooPeeLogoProps {
  height?: number;
}

export default function PooPeeLogo({ height = 52 }: PooPeeLogoProps) {
  const displayW = Math.round(CROP_ASPECT * height);
  const scale = displayW / CROP_W;
  const imgW = Math.round(PNG_W * scale);
  const imgH = Math.round(PNG_H * scale);
  const offsetX = -Math.round(CROP_X * scale);
  const offsetY = -Math.round(CROP_Y * scale);

  return (
    <View
      style={[styles.clip, { width: displayW, height }]}
      accessibilityLabel="PooPee Health"
      accessible
    >
      <Image
        source={SOURCE}
        style={[styles.img, { width: imgW, height: imgH, left: offsetX, top: offsetY }]}
        resizeMode="stretch"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  img: {
    position: 'absolute',
  },
});

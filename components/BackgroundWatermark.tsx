import { View, StyleSheet } from 'react-native';
import PooPeeLogo from '@/components/PooPeeLogo';

export default function BackgroundWatermark() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[styles.markWrap, styles.center]}>
        <PooPeeLogo size={130} showText={false} />
      </View>

      <View style={[styles.markWrap, styles.topLeft]}>
        <PooPeeLogo size={95} showText={true} />
      </View>

      <View style={[styles.markWrap, styles.bottomRight]}>
        <PooPeeLogo size={105} showText={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  markWrap: {
    position: 'absolute',
    opacity: 0.018,
  },
  center: {
    top: '48%',
    left: '50%',
    transform: [{ translateX: -65 }, { translateY: -65 }],
  },
  topLeft: {
    top: '11%',
    left: '6%',
    transform: [{ rotate: '-10deg' }],
  },
  bottomRight: {
    bottom: '14%',
    right: '8%',
    transform: [{ rotate: '16deg' }],
  },
});

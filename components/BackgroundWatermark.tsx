import { View, StyleSheet, Image } from 'react-native';

export default function BackgroundWatermark() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        source={require('@/assets/images/branding/logo-mark.png')}
        style={[styles.watermark, styles.center]}
        resizeMode="contain"
      />
      <Image
        source={require('@/assets/images/branding/logo-mark.png')}
        style={[styles.watermark, styles.topLeft]}
        resizeMode="contain"
      />
      <Image
        source={require('@/assets/images/branding/logo-mark.png')}
        style={[styles.watermark, styles.bottomRight]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  watermark: {
    position: 'absolute',
    width: 200,
    height: 200,
    opacity: 0.08,
  },
  center: {
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
  topLeft: {
    top: '15%',
    left: '10%',
    width: 150,
    height: 150,
    transform: [{ translateX: -75 }, { translateY: -75 }, { rotate: '-15deg' }],
  },
  bottomRight: {
    top: '75%',
    left: '70%',
    width: 180,
    height: 180,
    transform: [{ translateX: -90 }, { translateY: -90 }, { rotate: '20deg' }],
  },
});

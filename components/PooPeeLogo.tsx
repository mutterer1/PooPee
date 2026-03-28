import { View, Image, StyleSheet } from 'react-native';

interface PooPeeLogoProps {
  size?: number;
}

const LOGO_ASPECT_RATIO = 2.8;

export default function PooPeeLogo({ size = 100 }: PooPeeLogoProps) {
  const height = size * 0.72;
  const width = height * LOGO_ASPECT_RATIO;

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/branding/logo.png')}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});

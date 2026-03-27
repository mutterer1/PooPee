import Svg, { Path, G } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';

interface PooPeeLogoProps {
  size?: number;
  showText?: boolean;
  stacked?: boolean;
}

export default function PooPeeLogo({
  size = 220,
  showText = true,
  stacked = false,
}: PooPeeLogoProps) {
  const logoMarkSize = showText ? size * 0.34 : size;
  const primarySize = size * 0.19;
  const secondarySize = primarySize * 0.95;

  return (
    <View
      style={[
        styles.container,
        stacked && styles.stackedContainer,
        { minHeight: showText ? size * 0.24 : size },
      ]}
    >
      <Svg
        width={logoMarkSize}
        height={logoMarkSize}
        viewBox="0 0 200 200"
        style={[styles.logoMark, stacked && styles.logoMarkStacked]}
      >
        <G>
          <Path
            d="M85 60C70 60 58 72 58 87C58 95 61 102 66 107C66 108 66 109 66 110C66 125 78 137 93 137C95 137 97 136.8 99 136.5C99 137 99 137.5 99 138C99 153 111 165 126 165C133 165 139 162 143.5 157C145.5 158.3 147.8 159 150 159C159.4 159 167 151.4 167 142C167 140 166.6 138 166 136.2C170.5 132 173 126 173 119C173 107.4 163.6 98 152 98C151 98 150 98.1 149 98.3C148 85 137 75 124 75C122 75 120 75.3 118.2 75.7C114 66.5 105 60 94.5 60C92 60 89.5 60.3 87.2 61C86.5 60.3 85.8 60 85 60Z"
            fill="#8FAF9C"
          />
          <Path
            d="M135 45C125 45 117 52 115 61C113 60.5 111 60 109 60C99 60 91 68 91 78C91 79 91.1 80 91.2 81C85 83 81 89 81 96C81 105 88 112 97 112C98 112 99 111.9 100 111.8C101 119 107.5 125 115 125C117 125 119 124.6 120.8 123.9C123 130 129 135 136 135C145 135 152.5 128 153 119.2C159 117 163.5 111 163.5 104C163.5 95 156 88 147 88C146 88 145 88.1 144 88.3C143 77 134 68 123 68C121 68 119 68.3 117.2 68.8C116 56 106 45 94 45C90 45 86 46 82.5 48C79 50 76 52.8 74 56.2C76 55.5 78 55 80 55C90 55 98 59 103 65C108 57 116 51 125 49C128 47 131 45.5 135 45Z"
            fill="#8E7DBE"
          />
          <Path
            d="M80 130C75 130 71 134 71 139C71 144 75 148 80 148C82 148 84 147.3 85.5 146C87 149 90 151 93.5 151C98.5 151 102.5 147 102.5 142C102.5 140 101.8 138 100.5 136.5C103 134 104.5 130.5 104.5 127C104.5 120 99 114 92 114C91 114 90 114.2 89 114.4C87 120 84 125 80 130Z"
            fill="#E7A192"
          />
        </G>
      </Svg>

      {showText && (
        <View style={[styles.textContainer, stacked && styles.textContainerStacked]}>
          <Text style={[styles.brandName, { fontSize: primarySize }]}>PooPee</Text>
          <Text style={[styles.brandSubtitle, { fontSize: secondarySize }]}>Health</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logoMark: {
    marginRight: 12,
  },
  logoMarkStacked: {
    marginRight: 0,
    marginBottom: 10,
  },
  textContainer: {
    justifyContent: 'center',
  },
  textContainerStacked: {
    alignItems: 'center',
  },
  brandName: {
    fontWeight: '800',
    color: '#46455A',
    letterSpacing: -0.9,
    lineHeight: 30,
  },
  brandSubtitle: {
    fontWeight: '400',
    color: '#6B6B6B',
    letterSpacing: 0.2,
    marginTop: -2,
    lineHeight: 24,
  },
});

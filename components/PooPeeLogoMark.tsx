import Svg, { Path } from 'react-native-svg';

interface PooPeeLogoMarkProps {
  size?: number;
  color?: string;
}

export default function PooPeeLogoMark({ size = 24, color = '#000000' }: PooPeeLogoMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 15 C60 15 68 22 70 32 C72 28 76 25 80 25 C87 25 92 30 92 37 C92 42 88 46 83 47 C85 55 83 63 78 68 C72 74 63 77 50 77 C37 77 28 74 22 68 C17 63 15 55 17 47 C12 46 8 42 8 37 C8 30 13 25 20 25 C24 25 28 28 30 32 C32 22 40 15 50 15 Z"
        fill={color}
      />
    </Svg>
  );
}

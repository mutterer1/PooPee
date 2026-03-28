import Svg, { Circle, Path, Ellipse } from 'react-native-svg';

interface PoopIconProps {
  size?: number;
  color?: string;
}

export default function PoopIcon({ size = 24, color = '#A0714F' }: PoopIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="80" rx="32" ry="11" fill={color} opacity={0.2} />
      <Path
        d="M50 73 C30 73 22 59 28 47 C22 45 20 35 30 31 C26 19 38 13 46 21 C48 11 52 11 54 21 C62 13 74 19 70 31 C80 35 78 45 72 47 C78 59 70 73 50 73Z"
        fill={color}
        opacity={0.5}
      />
      <Path
        d="M50 69 C33 69 26 57 31 47 C25 45 24 37 33 34 C30 23 40 18 47 24 C49 16 51 16 53 24 C60 18 70 23 67 34 C76 37 75 45 69 47 C74 57 67 69 50 69Z"
        fill={color}
        opacity={0.8}
      />
      <Path
        d="M50 65 C35 65 29 55 33 47 C28 45 27 39 35 36 C32 27 41 23 47 28 C49 21 51 21 53 28 C59 23 68 27 65 36 C73 39 72 45 67 47 C71 55 65 65 50 65Z"
        fill={color}
      />
      <Circle cx="43" cy="47" r="3.5" fill="#3D1F00" opacity={0.7} />
      <Circle cx="57" cy="47" r="3.5" fill="#3D1F00" opacity={0.7} />
      <Path
        d="M45 55 Q50 59 55 55"
        stroke="#3D1F00"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
    </Svg>
  );
}

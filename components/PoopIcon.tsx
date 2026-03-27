import Svg, { Path } from 'react-native-svg';

interface PoopIconProps {
  size?: number;
  color?: string;
}

export default function PoopIcon({ size = 24, color = '#000000' }: PoopIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C10.34 3 9 4.34 9 6C9 6.35 9.07 6.68 9.18 7H9C7.34 7 6 8.34 6 10C6 10.35 6.07 10.68 6.18 11H6C4.34 11 3 12.34 3 14C3 14.93 3.4 15.77 4.03 16.35C4.01 16.56 4 16.78 4 17C4 19.76 6.24 22 9 22H15C17.76 22 20 19.76 20 17C20 16.78 19.99 16.56 19.97 16.35C20.6 15.77 21 14.93 21 14C21 12.34 19.66 11 18 11H17.82C17.93 10.68 18 10.35 18 10C18 8.34 16.66 7 15 7H14.82C14.93 6.68 15 6.35 15 6C15 4.34 13.66 3 12 3Z"
        fill={color}
      />
    </Svg>
  );
}

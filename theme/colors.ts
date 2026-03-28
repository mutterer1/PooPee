export const DS = {
  primary: '#633a7f',
  onPrimary: '#ffffff',
  primaryContainer: '#ecddf5',
  onPrimaryContainer: '#1e0035',

  secondary: '#4f644b',
  onSecondary: '#ffffff',
  secondaryContainer: '#cfe6c7',
  onSecondaryContainer: '#53684f',

  tertiary: '#c0392b',
  onTertiary: '#ffffff',
  tertiaryFixed: '#ffdbd1',
  onTertiaryFixed: '#390c02',

  surface: '#f9faf6',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f0',
  surfaceContainer: '#eceeed',
  surfaceContainerHigh: '#e6e8e4',
  surfaceContainerHighest: '#e2e3df',
  onSurface: '#1a1c1a',
  onSurfaceVariant: '#4c444f',

  outline: '#7d7679',
  outlineVariant: '#cec3d0',

  success: '#4caf50',
  warning: '#ff9800',
  error: '#c0392b',

  tracking: {
    bowel: '#a8d5ba',
    urination: '#81d4fa',
    meal: '#f9c7bc',
    insight: '#cfe6c7',
  },
} as const;

export const MEDITATIVE_COLORS = {
  primary: {
    sage: '#a8d5ba',
    lavender: '#633a7f',
    sky: '#81d4fa',
    coral: '#f9c7bc',
    teal: '#4f644b',
  },
  secondary: {
    gold: '#D4A574',
    rose: '#E8B4B8',
    mint: '#cfe6c7',
  },
  neutral: {
    white: '#ffffff',
    offWhite: '#f9faf6',
    lightestGray: '#f3f4f0',
    darkSlate: '#1a1c1a',
    mediumGray: '#7d7679',
    lightGray: '#e2e3df',
  },
  semantic: {
    success: '#cfe6c7',
    warning: '#D4A574',
    error: '#ffdbd1',
    info: '#81d4fa',
  },
  backgrounds: {
    light: '#f3f4f0',
    card: '#ffffff',
    overlay: 'rgba(26, 28, 26, 0.5)',
  },
  text: {
    primary: '#1a1c1a',
    secondary: '#4c444f',
    light: '#f9faf6',
    accent: '#633a7f',
  },
  tracking: {
    bowel: '#a8d5ba',
    urination: '#81d4fa',
    meal: '#f9c7bc',
    insight: '#cfe6c7',
  },
  chatbot: {
    accent: '#f9c7bc',
    background: '#ffffff',
    border: '#e2e3df',
  },
  achievements: {
    highlight: '#ecddf5',
    accent: '#4f644b',
  },
} as const;

export type ColorKey = keyof typeof MEDITATIVE_COLORS;

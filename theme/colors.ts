export const MEDITATIVE_COLORS = {
  primary: {
    sage: '#A8D5BA',
    lavender: '#B4A7D6',
    sky: '#87CEEB',
    coral: '#F8A89E',
    teal: '#4A9B9E',
  },
  secondary: {
    gold: '#D4A574',
    rose: '#E8B4B8',
    mint: '#A8D8C8',
  },
  neutral: {
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightestGray: '#F5F5F5',
    darkSlate: '#2C3E50',
    mediumGray: '#8A8A8A',
    lightGray: '#E0E0E0',
  },
  semantic: {
    success: '#A8D8C8',
    warning: '#D4A574',
    error: '#F8A89E',
    info: '#87CEEB',
  },
  backgrounds: {
    light: '#E8F5F1',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: '#2C3E50',
    secondary: '#8A8A8A',
    light: '#FAFAFA',
  },
  tracking: {
    bowel: '#A8D5BA',
    urination: '#87CEEB',
    meal: '#F8A89E',
    insight: '#B4A7D6',
  },
  chatbot: {
    accent: '#F8A89E',
    background: '#FFFFFF',
    border: '#E8B4B8',
  },
  achievements: {
    highlight: '#B4A7D6',
    accent: '#D4A574',
  },
} as const;

export type ColorKey = keyof typeof MEDITATIVE_COLORS;

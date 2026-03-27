import { StyleSheet } from 'react-native';
import { MEDITATIVE_COLORS } from './colors';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MEDITATIVE_COLORS.backgrounds.light,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  card: {
    backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: MEDITATIVE_COLORS.neutral.lightGray,
    ...SHADOWS.sm,
  },
  button: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    color: MEDITATIVE_COLORS.text.primary,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    color: MEDITATIVE_COLORS.text.primary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF8DC',
    lineHeight: 24,
  },
  input: {
    backgroundColor: MEDITATIVE_COLORS.backgrounds.card,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: MEDITATIVE_COLORS.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: MEDITATIVE_COLORS.neutral.lightGray,
  },
});

export const buttonStyles = (backgroundColor: string = MEDITATIVE_COLORS.primary.lavender) =>
  StyleSheet.create({
    primary: {
      ...baseStyles.button,
      backgroundColor,
    },
    secondary: {
      ...baseStyles.button,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: backgroundColor,
    },
    small: {
      ...baseStyles.button,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      minHeight: 32,
    },
  });

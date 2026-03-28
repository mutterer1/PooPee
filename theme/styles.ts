import { StyleSheet } from 'react-native';
import { MEDITATIVE_COLORS, DS } from './colors';

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
  xl: 48,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: DS.onSurfaceVariant,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: DS.onSurfaceVariant,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  lg: {
    shadowColor: DS.onSurfaceVariant,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 6,
  },
} as const;

export const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.surfaceContainerLow,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  card: {
    backgroundColor: DS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  button: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    color: DS.onSurface,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    color: DS.primary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: DS.onPrimary,
    lineHeight: 24,
  },
  input: {
    backgroundColor: DS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    color: DS.onSurface,
    fontSize: 16,
    shadowColor: DS.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
});

export const buttonStyles = (backgroundColor: string = DS.primary) =>
  StyleSheet.create({
    primary: {
      ...baseStyles.button,
      backgroundColor,
    },
    secondary: {
      ...baseStyles.button,
      backgroundColor: DS.secondaryContainer,
    },
    small: {
      ...baseStyles.button,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      minHeight: 36,
    },
  });

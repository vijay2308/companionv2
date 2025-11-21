import { Platform } from 'react-native';

export const COLORS = {
  // Perplexity-inspired Dark Mode Palette
  background: '#191A1A', // Deep slate gray/black
  surface: '#202222', // Slightly lighter slate for cards
  surfaceHighlight: '#2D2F2F', // Hover/Active state

  primary: '#2BB8A7', // Perplexity Teal
  secondary: '#3E4142', // Secondary elements

  text: '#E8E8E8', // High contrast text
  textSecondary: '#A0A0A0', // Muted text
  textTertiary: '#6B6E70', // Very muted text

  border: '#2D2F2F',

  success: '#2BB8A7',
  error: '#EF5350',
  warning: '#FFB74D',
  info: '#4FC3F7',

  // Glassmorphism
  glass: 'rgba(32, 34, 34, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.05)',
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  round: 9999,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: COLORS.text,
  },
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

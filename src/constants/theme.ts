import { Platform } from 'react-native';

/**
 * Design System Constants
 * Style: Sophisticated Playful
 * Palette: Charcoal, Vibrant Blue, Sage, Off-White
 */

export const Colors = {
  light: {
    // Primary palette
    primary: '#171e19',     // Charcoal
    accent: '#0052ff',      // Vibrant Blue 
    secondary: '#b7c6c2',   // Sage / Gray-Green
    background: '#eeebe3',  // Off-White
    surface: '#ffffff',     // White cards
    
    // UI Helpers
    text: '#171e19',
    textSecondary: '#b7c6c2',
    border: 'rgba(23, 30, 25, 0.6)',
    glass: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(23, 30, 25, 0.3)',
    
    // Status
    success: '#10b981',
    warning: '#f59e0b',
    error: '#0052ff', // Linked to accent blue
    info: '#0ea5e9',
  },
  dark: {
    // Note: Dark mode follows the same sophisticated charcoal base
    primary: '#ffffff',
    accent: '#0052ff',
    secondary: '#b7c6c2',
    background: '#171e19',
    surface: '#262d28',
    
    text: '#ffffff',
    textSecondary: '#b7c6c2',
    border: 'rgba(255, 255, 255, 0.4)',
    glass: 'rgba(38, 45, 40, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    
    success: '#10b981',
    warning: '#f59e0b',
    error: '#0052ff',
    info: '#0ea5e9',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  header: 56,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24, // Standard nested card radius
  xl: 40, // Signature oversized radius
  full: 9999,
};

export const Fonts = {
  regular: 'Roboto_400Regular',
  bold: 'Roboto_700Bold',
  extraBold: 'Roboto_700Bold', // Roboto doesn't have 800 by default in this package
  black: 'Roboto_900Black',
  display: 'Roboto_900Black',
  displayBold: 'Roboto_700Bold',
};

export const Typography = {
  hero: {
    fontSize: 48,
    fontFamily: Fonts.display,
    lineHeight: 52,
    letterSpacing: -1,
  },
  h1: {
    fontSize: 32,
    fontFamily: Fonts.black,
    lineHeight: 40,
    textTransform: 'none' as const,
  },
  h2: {
    fontSize: 24,
    fontFamily: Fonts.black,
    lineHeight: 32,
    textTransform: 'none' as const,
  },
  h3: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    lineHeight: 24,
    textTransform: 'none' as const,
  },
  body: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
  },
  label: {
    fontSize: 10,
    fontFamily: Fonts.black,
    letterSpacing: 1.5,
    textTransform: 'none' as const,
  },
  utility: {
    fontSize: 12,
    fontFamily: Fonts.displayBold,
    letterSpacing: 1,
    textTransform: 'none' as const,
  },
  small: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    lineHeight: 16,
  },
  caption: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    lineHeight: 14,
  }
};

export const Shadows = {
  soft: {
    shadowColor: '#171e19',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  blue: { // Updated from red to blue
    shadowColor: '#0052ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  sm: {
    shadowColor: '#171e19',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  strong: {
    shadowColor: '#171e19',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  }
};

export const Animations = {
  duration: 250,
  easing: [0.25, 0.1, 0.25, 1] as [number, number, number, number], // ease-in-out
};

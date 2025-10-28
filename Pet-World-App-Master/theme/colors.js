export const colors = {
  // Primary Colors - Earthy and Warm
  primary: '#8B4513',        // SaddleBrown (main)
  primaryDark: '#5C2E0F',    // Darker brown
  primaryLight: '#D2B48C',   // Tan / Light brown

  // Secondary Colors - Complementary Naturals
  secondary: '#A0522D',      // Sienna (earthy tone)
  secondaryDark: '#6B3A1C',  // Deeper sienna
  secondaryLight: '#EED9C4', // Pale sienna / background shade

  // Accent Colors - Natural but contrasting
  accent: '#C19A6B',         // Light brown (camel)
  accentWarm: '#F4A460',     // Sandy Brown
  accentEarth: '#DEB887',    // BurlyWood (soft, warm)

  // Neutral Colors - Gentle, soft background tones
  background: '#FDF8F3',     // Off white with warm undertone
  surface: '#FFFFFF',        // White for cards or elevated surfaces
  surfaceVariant: '#F5EFE6', // Subtle beige

  // Text Colors
  textPrimary: '#3E2723',    // Deep brown (high contrast on light backgrounds)
  textSecondary: 'gray', // Medium brown
  textTertiary: '#A1887F',   // Muted brown/gray

  // Status Colors
  success: '#388E3C',        // Earthy green
  warning: '#E67E22',        // Deep orange
  error: '#C0392B',          // Brick red
  info: '#5DADE2',           // Muted sky blue

  // Gradient Combinations (warmer and earthy blends)
  gradientPrimary: ['#8B4513', '#D2B48C'],
  gradientSecondary: ['#A0522D', '#DEB887'],
  gradientWarm: ['#F4A460', '#DEB887'],
  gradientCool: ['#C19A6B', '#EED9C4'],
  gradientSunset: ['#E97451', '#FFDAB9'], // Clay orange to peach
};

export const typography = {
  // Headers
  h1: { fontSize: 32, fontWeight: '800', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  
  // Body text
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  
  // Captions and labels
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  
  // Button text
  button: { fontSize: 16, fontWeight: '600', lineHeight: 20 },
  buttonLarge: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 50,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
};

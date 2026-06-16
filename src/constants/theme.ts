export const Theme = {
  bg: '#05060A',
  bgElevated: '#0B0E16',
  surface: '#121622',
  surfaceAlt: '#1B2030',
  border: '#262C3D',
  text: '#F5F7FA',
  textDim: '#9AA3B2',
  textFaint: '#5C6477',
  accent: '#6EE7FF',
  accentAlt: '#B69CFF',
  energy: '#7CFFCB',
  chorus: '#FFD36E',
  warning: '#FF9F6B',
  danger: '#FF6B6B',
  success: '#4ADE80',
  pulse: '#8BE9FF',
} as const;

export type ThemeKey = keyof typeof Theme;

export const FONT_SCALE_MULTIPLIER: Record<'comfortable' | 'large' | 'xl', number> = {
  comfortable: 1,
  large: 1.18,
  xl: 1.4,
};

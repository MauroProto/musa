export const Theme = {
  bg: '#000000',
  bgElevated: '#0B0B0D',
  surface: '#161617',
  surfaceAlt: '#212123',
  border: 'rgba(235,235,245,0.10)',
  separator: 'rgba(235,235,245,0.07)',
  fill: 'rgba(235,235,245,0.07)',

  text: '#FFFFFF',
  textDim: 'rgba(235,235,245,0.60)',
  textFaint: 'rgba(235,235,245,0.32)',

  accent: '#0A84FF',
  accentText: '#FFFFFF',
  accentAlt: '#5E5CE6',

  pulse: '#64D2FF',
  energy: '#64D2FF',
  chorus: '#FFB340',
  warning: '#FF9F0A',
  danger: '#FF453A',
  success: '#30D158',
} as const;

export type ThemeKey = keyof typeof Theme;

export const FONT_SCALE_MULTIPLIER: Record<'comfortable' | 'large' | 'xl', number> = {
  comfortable: 1,
  large: 1.14,
  xl: 1.32,
};

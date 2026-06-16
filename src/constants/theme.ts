/**
 * MUSA — sistema visual monocromo.
 * Negro absoluto, blanco, y una escala de grises por opacidad.
 * La jerarquía se construye con contraste, peso y espacio.
 * El color se usa solo para errores.
 */

export const Theme = {
  // Fondo
  bg: '#000000',
  bgDeep: '#000000',
  bgElevated: '#0A0A0B',

  // Superficies (glass por opacidad de blanco)
  surface: 'rgba(255,255,255,0.045)',
  surfaceStrong: 'rgba(255,255,255,0.09)',
  surfaceAlt: 'rgba(255,255,255,0.09)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.22)',
  separator: 'rgba(255,255,255,0.07)',
  fill: 'rgba(255,255,255,0.07)',

  // Texto (escala de grises)
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.56)',
  textFaint: 'rgba(255,255,255,0.30)',
  textGhost: 'rgba(255,255,255,0.16)',

  // Acento = blanco (botón primario invertido, estilo Apple)
  accent: '#FFFFFF',
  accentText: '#000000',
  accentAlt: 'rgba(255,255,255,0.72)',

  // Semánticos en monocromo (jerarquía por brillo)
  pulse: '#FFFFFF',
  energy: '#FFFFFF',
  chorus: '#FFFFFF',
  warning: 'rgba(255,255,255,0.85)',
  success: 'rgba(255,255,255,0.85)',
  danger: '#FF5A52', // único color, solo para errores
} as const;

export type ThemeKey = keyof typeof Theme;

export type SectionKind = 'verse' | 'chorus' | 'intro' | 'outro' | 'bridge';

/** En monocromo el acento es siempre blanco. */
export function accentFor(_kind?: SectionKind): string {
  return Theme.text;
}

/** 0 = verso · 1 = coro. Se usa para brillo/escala, no para color. */
export function warmthFor(kind?: SectionKind): number {
  return kind === 'chorus' ? 1 : 0;
}

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 8,
  xl: 8,
  pill: 999,
} as const;

/**
 * Motion tokens (curvas y duraciones).
 * Curvas custom: las nativas de CSS/RN son "débiles".
 * Se consumen con Easing.bezier(...MOTION.easeOut) en reanimated.
 */
export const MOTION = {
  easeOut: [0.23, 1, 0.32, 1] as const, // entradas/salidas, sensación inmediata
  easeInOut: [0.77, 0, 0.175, 1] as const, // movimiento en pantalla
  press: 0.97, // escala al presionar
  dur: {
    press: 140,
    fast: 180,
    base: 240,
    slow: 300,
  },
} as const;

export const FONT_SCALE_MULTIPLIER: Record<'comfortable' | 'large' | 'xl', number> = {
  comfortable: 1,
  large: 1.14,
  xl: 1.32,
};

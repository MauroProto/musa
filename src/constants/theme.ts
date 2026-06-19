/**
 * MUSA — "Quiet Light" visual system.
 *
 * A calm, monochrome LIGHT theme. Near-white canvas, near-black text, a quiet
 * grey scale for surfaces. No accent hue (pure monochrome) — depth comes from
 * value contrast and soft shadows, never colour. Deaf-first legibility first.
 */

export const Theme = {
  // ── Canvas (light, near-white — never pure #FFF) ──────────────────────
  bg: '#FAFAFA',
  bgDeep: '#FFFFFF',
  bgElevated: '#FFFFFF',

  // ── Surfaces (solid, minimalist elevated tiers) ───────────────────────
  card: '#F1F2F4',
  cardStrong: '#E7E9EC',
  cardWhisper: '#F6F7F8',
  surface: 'rgba(11,12,14,0.04)',
  surfaceStrong: 'rgba(11,12,14,0.07)',
  surfaceAlt: 'rgba(11,12,14,0.06)',
  border: 'transparent',
  borderStrong: 'rgba(11,12,14,0.12)',
  separator: 'rgba(11,12,14,0.07)',
  fill: 'rgba(11,12,14,0.05)',

  // ── Text (near-black scale) ───────────────────────────────────────────
  text: '#0B0C0E',
  textDim: 'rgba(11,12,14,0.60)',
  textFaint: 'rgba(11,12,14,0.40)',
  textGhost: 'rgba(11,12,14,0.20)',

  // ── Primary = near-black (inverted, max contrast on light) ────────────
  accent: '#0B0C0E',
  accentText: '#FFFFFF',
  accentAlt: 'rgba(11,12,14,0.72)',

  // ── Semantic (monochrome) ─────────────────────────────────────────────
  pulse: '#0B0C0E',
  energy: '#0B0C0E',
  chorus: '#0B0C0E',
  warning: 'rgba(11,12,14,0.85)',
  success: '#0B0C0E',
  danger: '#D93636', // errors only

  // ── Bright red ─────────────────────────────────────────────────────────
  // A single bright-red accent — the one chromatic punctuation in the
  // otherwise monochrome system.
  rec: '#D30000',

  // ── Kept for compatibility (no longer used as a brand accent) ─────────
  teal: '#0B0C0E',
  tealBright: '#0B0C0E',
  tealDeep: '#0B0C0E',
  tealText: '#FFFFFF',
  rose: '#B8B8B8',
} as const;

export type ThemeKey = keyof typeof Theme;

export type SectionKind = 'verse' | 'chorus' | 'intro' | 'outro' | 'bridge';

/**
 * SURFACE — minimalist flat material. Solid elevated background, no border,
 * optional soft shadow. Depth by value, not lines.
 */
export const GLASS = {
  tint: 'light' as const,
  blur: { sheet: 36, panel: 28, card: 20, bar: 44, chip: 16 },
  fill: 'rgba(11,12,14,0.04)',
  fillStrong: 'rgba(11,12,14,0.07)',
  fillSolid: 'rgba(241,242,244,0.92)',
  highlight: 'rgba(255,255,255,0.9)',
  highlightSoft: 'rgba(255,255,255,0.5)',
  sheen: 'rgba(255,255,255,0.4)',
  edge: 'transparent',
  edgeStrong: 'rgba(11,12,14,0.12)',
  innerShadow: 'rgba(0,0,0,0.06)',
  base: 'rgba(241,242,244,0.92)',
} as const;

/** Kept for compatibility — monochrome neutrals only. */
export const CHROMA = {
  cyan: 'rgba(11,12,14,0.5)',
  magenta: 'rgba(11,12,14,0.5)',
  red: 'rgba(11,12,14,0.5)',
  blue: 'rgba(11,12,14,0.5)',
  cyanSoft: 'rgba(11,12,14,0.25)',
  magentaSoft: 'rgba(11,12,14,0.25)',
} as const;

/**
 * AURORA — kept for API compatibility but monochrome. Used only as a faint
 * neutral wash if anything still references it.
 */
/**
 * CUE_BLOOMS — a tighter, warmer palette for the reactive background blooms.
 * Each cue lights the canvas with a meaningful hue; drums/beat use the
 * recording-button red so red pulses appear naturally while listening.
 */
export const CUE_BLOOMS = {
  bass: '#2E5BFF', // deep blue — body / low end
  drums: '#E63946', // recording-button red — attack
  guitar: '#3FA86B', // moss green — texture
  voice: '#F2A23A', // warm amber — voice
  emotion: '#A95BD0', // plum — emotion shift
  chorus: '#F26B3A', // ember orange — the payoff
  build: '#3D7BE0', // sky blue — building
  release: '#8B95A8', // cool grey — section end
  neutral: '#8B8E96',
} as const;

export const AURORA = {
  teal: '#0B0C0E',
  cyan: '#3A3A3A',
  aqua: '#5A5A5A',
  deep: '#8A8A8A',
  rose: '#B8B8B8',
  ember: '#9A9A9A',
} as const;

export type AuroraMood = 'calm' | 'verse' | 'build' | 'chorus' | 'tense' | 'release';

export function auroraPaletteFor(_mood: AuroraMood): [string, string, string] {
  return [AURORA.deep, AURORA.aqua, AURORA.rose];
}

/** Content accent is always near-black. */
export function accentFor(_kind?: SectionKind): string {
  return Theme.text;
}

/** 0 = verse · 1 = chorus. Drives brightness/scale, not colour. */
export function warmthFor(kind?: SectionKind): number {
  return kind === 'chorus' ? 1 : 0;
}

export function auroraMoodForSection(kind?: SectionKind): AuroraMood {
  switch (kind) {
    case 'chorus':
      return 'chorus';
    case 'bridge':
      return 'tense';
    case 'intro':
      return 'calm';
    case 'outro':
      return 'release';
    case 'verse':
    default:
      return 'verse';
  }
}

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  card: 20,
  field: 14,
  pill: 999,
} as const;

/** Soft shadows on a light canvas. */
export const ELEVATION = {
  card: {
    shadowColor: '#0B0C0E',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bar: {
    shadowColor: '#0B0C0E',
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  hero: {
    shadowColor: '#0B0C0E',
    shadowOpacity: 0.14,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
} as const;

export const MOTION = {
  easeOut: [0.23, 1, 0.32, 1] as const,
  easeInOut: [0.77, 0, 0.175, 1] as const,
  easeSoft: [0.4, 0, 0.2, 1] as const,
  press: 0.97,
  pressDeep: 0.94,
  dur: {
    press: 140,
    fast: 180,
    base: 240,
    slow: 320,
    lazy: 560,
    ambient: 5200,
  },
  spring: {
    snappy: { damping: 18, stiffness: 220, mass: 0.7 },
    gentle: { damping: 22, stiffness: 140, mass: 0.9 },
    liquid: { damping: 16, stiffness: 110, mass: 1.1 },
  },
} as const;

export const FONT_SCALE_MULTIPLIER: Record<'comfortable' | 'large' | 'xl', number> = {
  comfortable: 1,
  large: 1.14,
  xl: 1.32,
};

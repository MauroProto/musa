import type { HapticEventType } from './types.ts';

export type PlayerBackgroundBloom = {
  key: string;
  color: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  drift: number;
  reverse?: boolean;
};

export type PlayerBackgroundGrainDot = {
  key: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
};

export type CueBloomLayout = {
  x: number;
  y: number;
  size: number;
  opacity: number;
};

const GRAIN_DOT_COUNT = 84;

function createGrainDot(index: number): PlayerBackgroundGrainDot {
  const sizes = [0.7, 0.9, 1.1, 1.35];
  const opacities = [0.13, 0.17, 0.21, 0.24, 0.19];
  return {
    key: `g${String(index).padStart(2, '0')}`,
    x: ((index * 37) % 100) / 100,
    y: ((index * 61) % 100) / 100,
    size: sizes[index % sizes.length],
    opacity: opacities[index % opacities.length],
  };
}

export const PLAYER_BACKGROUND_BASE = {
  color: '#FAFAF7',
  washColors: [
    'rgba(255,255,255,0.96)',
    'rgba(248,249,249,0.82)',
    'rgba(235,241,247,0.26)',
    'rgba(250,250,247,0.96)',
  ],
  washLocations: [0, 0.34, 0.72, 1],
} as const;

export const PLAYER_BACKGROUND_BLOOMS: PlayerBackgroundBloom[] = [
  { key: 'blue-left', color: '#2E74FF', x: 0.1, y: 0.2, size: 1.2, opacity: 0.07, drift: 20 },
  { key: 'cyan-top', color: '#55D7E7', x: 0.54, y: 0.12, size: 1.08, opacity: 0.06, drift: 16, reverse: true },
  { key: 'frost-right', color: '#FFFFFF', x: 0.88, y: 0.4, size: 1.18, opacity: 0.2, drift: 18 },
  { key: 'paper-upper', color: '#EEF4FA', x: 0.82, y: 0.12, size: 0.9, opacity: 0.2, drift: 10, reverse: true },
  { key: 'blue-low', color: '#74A9FF', x: 0.16, y: 0.86, size: 1.02, opacity: 0.05, drift: 14 },
  { key: 'silver-low', color: '#E6ECF1', x: 0.72, y: 0.9, size: 1.08, opacity: 0.18, drift: 12, reverse: true },
];

export const PLAYER_BACKGROUND_TEXTURE = {
  enabled: true,
  opacity: 0.16,
  scale: 2.05,
  tintColor: '#68727C',
} as const;

export const PLAYER_BACKGROUND_GRAIN = {
  enabled: true,
  color: 'rgba(38,48,56,0.24)',
  dots: Array.from({ length: GRAIN_DOT_COUNT }, (_, index) => createGrainDot(index + 1)),
} as const;

export const LYRIC_STACK_CHROME = {
  slots: ['previous', 'current', 'next'] as const,
  wordTimingSource: 'unavailable' as const,
} as const;

export function cueBloomLayoutFor(type?: HapticEventType): CueBloomLayout {
  switch (type) {
    case 'bass_pulse':
      return { x: 0.22, y: 0.78, size: 0.95, opacity: 0.54 };
    case 'beat':
    case 'drum_fill':
      return { x: 0.78, y: 0.28, size: 0.82, opacity: 0.5 };
    case 'guitar_riff':
      return { x: 0.28, y: 0.48, size: 1.0, opacity: 0.6 };
    case 'guitar_strum':
      return { x: 0.36, y: 0.42, size: 0.9, opacity: 0.5 };
    case 'line_start':
    case 'sustain':
      return { x: 0.55, y: 0.38, size: 0.88, opacity: 0.46 };
    case 'chorus':
      return { x: 0.54, y: 0.5, size: 1.28, opacity: 0.68 };
    case 'chorus_warning':
    case 'energy_rise':
      return { x: 0.72, y: 0.18, size: 1.08, opacity: 0.54 };
    case 'mood_shift':
      return { x: 0.62, y: 0.7, size: 0.96, opacity: 0.5 };
    case 'section_end':
    case 'pause':
      return { x: 0.82, y: 0.82, size: 0.9, opacity: 0.38 };
    default:
      return { x: 0.5, y: 0.46, size: 0.86, opacity: 0.36 };
  }
}

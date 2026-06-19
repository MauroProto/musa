import type { HapticEventType, Intensity } from './types';

/**
 * MUSA — per-layer gains (the live mixer).
 *
 * One gain per separable musical layer (0 = off, 1 = as-authored, up to 1.6 =
 * boosted). The same gains drive BOTH:
 *   - what you FEEL  (haptic cue intensity per layer), and
 *   - what you HEAR (per-stem audio volume, when audio is on).
 *
 * Pure & deterministic — no React, no platform APIs.
 */
export type MixLayer = 'drums' | 'bass' | 'guitar' | 'vocals';

export type LayerGains = Record<MixLayer, number>;

export const MIX_LAYERS: MixLayer[] = ['drums', 'bass', 'guitar', 'vocals'];

export const MIX_LAYER_LABEL: Record<MixLayer, string> = {
  drums: 'Drums',
  bass: 'Bass',
  guitar: 'Guitar',
  vocals: 'Voice',
};

export const GAIN_MIN = 0;
export const GAIN_MAX = 1.6;

export const DEFAULT_LAYER_GAINS: LayerGains = { drums: 1, bass: 1, guitar: 1, vocals: 1 };

export function clampGain(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(GAIN_MIN, Math.min(GAIN_MAX, value));
}

export function normalizeLayerGains(value: unknown): LayerGains {
  const v = (value ?? {}) as Partial<Record<MixLayer, unknown>>;
  return {
    drums: clampGain(typeof v.drums === 'number' ? v.drums : 1),
    bass: clampGain(typeof v.bass === 'number' ? v.bass : 1),
    guitar: clampGain(typeof v.guitar === 'number' ? v.guitar : 1),
    vocals: clampGain(typeof v.vocals === 'number' ? v.vocals : 1),
  };
}

/** Which mixer layer a haptic cue belongs to (null = structural, never scaled). */
export function layerForEventType(type: HapticEventType): MixLayer | null {
  switch (type) {
    case 'bass_pulse':
      return 'bass';
    case 'drum_fill':
    case 'beat':
      return 'drums';
    case 'guitar_riff':
    case 'guitar_strum':
      return 'guitar';
    case 'line_start':
    case 'sustain':
      return 'vocals';
    case 'chorus':
    case 'chorus_warning':
    case 'energy_rise':
    case 'mood_shift':
    case 'pause':
    case 'section_end':
      return null;
  }
}

/** Gain multiplier for a cue given the current mixer (1 for structural cues). */
export function gainForEventType(type: HapticEventType, gains: LayerGains): number {
  const layer = layerForEventType(type);
  return layer ? gains[layer] : 1;
}

const INTENSITY_STEPS: Intensity[] = [0.2, 0.4, 0.6, 0.8, 1];

/** Snap an arbitrary 0..1 value to the nearest discrete Intensity step. */
export function clampToIntensity(value: number): Intensity {
  const clamped = Math.max(0, Math.min(1, value));
  let best: Intensity = INTENSITY_STEPS[0];
  let bestDiff = Infinity;
  for (const step of INTENSITY_STEPS) {
    const diff = Math.abs(step - clamped);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = step;
    }
  }
  return best;
}

/** Below this effective intensity a cue is considered muted and skipped. */
export const MUTE_THRESHOLD = 0.06;

import { clampToIntensity, gainForEventType, MUTE_THRESHOLD, type LayerGains } from './layer-gains.ts';
import type { HapticEventType, Intensity } from './types.ts';

export type HapticPreviewOptions = {
  visualOnly?: boolean;
  pulseOn?: boolean;
  layerGains?: LayerGains;
};

export function resolveHapticPreviewIntensity(
  type: HapticEventType,
  intensity: Intensity,
  options: HapticPreviewOptions = {},
): Intensity | null {
  if (options.visualOnly) return null;
  if (type === 'beat' && options.pulseOn === false) return null;

  const scaled = intensity * (options.layerGains ? gainForEventType(type, options.layerGains) : 1);
  if (scaled < MUTE_THRESHOLD) return null;

  return clampToIntensity(scaled);
}

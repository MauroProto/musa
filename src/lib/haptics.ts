import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { HapticEventType, HapticStrength, Intensity } from './types';

const STRENGTH_FACTOR: Record<HapticStrength, number> = {
  soft: 0.55,
  medium: 0.8,
  strong: 1,
};

type Band = { style: Haptics.ImpactFeedbackStyle; ms: number };

function bandFor(combined: number): Band {
  if (combined < 0.4) {
    return { style: Haptics.ImpactFeedbackStyle.Light, ms: 14 };
  }
  if (combined < 0.7) {
    return { style: Haptics.ImpactFeedbackStyle.Medium, ms: 28 };
  }
  return { style: Haptics.ImpactFeedbackStyle.Heavy, ms: 50 };
}

function vibrateWeb(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* no-op */
  }
}

function impactNative(band: Band) {
  void Haptics.impactAsync(band.style).catch(() => {});
}

export type HapticController = {
  fire: (type: HapticEventType, intensity: Intensity) => void;
  stop: () => void;
};

export function createHapticController(opts: {
  strength: HapticStrength;
  visualOnly: boolean;
}): HapticController {
  const factor = STRENGTH_FACTOR[opts.strength] ?? 1;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  function schedule(fn: () => void, delayMs: number) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, delayMs);
    timers.add(id);
  }

  function fire(type: HapticEventType, intensity: Intensity) {
    if (opts.visualOnly) return;
    const combined = Math.max(0, Math.min(1, intensity * factor));
    const band = bandFor(combined);
    const isWeb = Platform.OS === 'web';

    switch (type) {
      case 'line_start': {
        if (isWeb) vibrateWeb([band.ms, 45, band.ms]);
        else {
          impactNative(band);
          schedule(() => impactNative(band), 80);
        }
        break;
      }
      case 'beat': {
        if (isWeb) vibrateWeb(band.ms);
        else impactNative(band);
        break;
      }
      case 'sustain': {
        const long = Math.round(180 + combined * 700);
        if (isWeb) vibrateWeb(long);
        else {
          impactNative(band);
          schedule(() => impactNative(band), 120);
          schedule(() => impactNative(band), 240);
        }
        break;
      }
      case 'chorus_warning': {
        if (isWeb) vibrateWeb([band.ms, 70, band.ms + 8, 70, band.ms + 16]);
        else {
          impactNative(band);
          schedule(() => impactNative(band), 110);
          schedule(() => impactNative({ ...band, style: Haptics.ImpactFeedbackStyle.Medium }), 220);
        }
        break;
      }
      case 'chorus': {
        if (isWeb) vibrateWeb([Math.round(band.ms * 2.4), 30, band.ms]);
        else {
          impactNative({ style: Haptics.ImpactFeedbackStyle.Heavy, ms: band.ms });
          schedule(() => impactNative({ style: Haptics.ImpactFeedbackStyle.Heavy, ms: band.ms }), 70);
        }
        break;
      }
      case 'section_end': {
        if (isWeb) vibrateWeb(Math.round(band.ms * 1.8));
        else impactNative({ style: Haptics.ImpactFeedbackStyle.Medium, ms: 40 });
        break;
      }
      case 'pause':
        break;
    }
  }

  function stop() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
    if (Platform.OS === 'web') vibrateWeb(0);
  }

  return { fire, stop };
}

export function previewHaptic(
  type: HapticEventType,
  strength: HapticStrength,
  intensity: Intensity,
) {
  const ctrl = createHapticController({ strength, visualOnly: false });
  ctrl.fire(type, intensity);
  setTimeout(() => ctrl.stop(), 1500);
}

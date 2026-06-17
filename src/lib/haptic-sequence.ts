import type { HapticEventType, HapticStrength, Intensity } from './types';

export type AndroidHapticName =
  | 'clock-tick'
  | 'confirm'
  | 'context-click'
  | 'gesture-end'
  | 'gesture-start'
  | 'keyboard-press'
  | 'long-press'
  | 'segment-frequent-tick'
  | 'segment-tick'
  | 'virtual-key'
  | 'virtual-key-release';

export type IosHapticName =
  | 'impact-heavy'
  | 'impact-light'
  | 'impact-medium'
  | 'impact-rigid'
  | 'impact-soft'
  | 'notification-success'
  | 'notification-warning'
  | 'selection';

export type HapticStep = {
  delayMs: number;
  android: AndroidHapticName;
  ios: IosHapticName;
  webMs: number;
};

export type HapticSequence = {
  steps: HapticStep[];
  webPattern: number | number[] | null;
  stopAfterMs: number;
};

type HapticSequenceOptions = {
  strength: HapticStrength;
  intensity: Intensity;
};

const STRENGTH_GAIN: Record<HapticStrength, number> = {
  soft: 0.68,
  medium: 0.92,
  strong: 1.25,
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function energyFor(strength: HapticStrength, intensity: Intensity): number {
  return clamp01(intensity * STRENGTH_GAIN[strength]);
}

function pulseMs(energy: number, min: number, max: number): number {
  return Math.round(min + (max - min) * energy);
}

function tap(delayMs: number, android: AndroidHapticName, ios: IosHapticName, webMs: number) {
  return { delayMs, android, ios, webMs };
}

function lightTap(delayMs: number, energy: number): HapticStep {
  return tap(delayMs, 'segment-frequent-tick', 'selection', pulseMs(energy, 8, 16));
}

function buildWebPattern(steps: HapticStep[]): number | number[] | null {
  if (steps.length === 0) return null;
  if (steps.length === 1 && steps[0].delayMs === 0) return steps[0].webMs;

  const pattern: number[] = [];
  let cursorMs = 0;
  for (const step of steps) {
    const gapMs = Math.max(0, step.delayMs - cursorMs);
    if (pattern.length > 0 || gapMs > 0) pattern.push(gapMs);
    pattern.push(step.webMs);
    cursorMs = step.delayMs + step.webMs;
  }
  return pattern;
}

function finish(steps: HapticStep[]): HapticSequence {
  const last = steps.at(-1);
  return {
    steps,
    webPattern: buildWebPattern(steps),
    stopAfterMs: last ? last.delayMs + last.webMs + 80 : 0,
  };
}

export function buildHapticSequence(
  type: HapticEventType,
  opts: HapticSequenceOptions,
): HapticSequence {
  const energy = energyFor(opts.strength, opts.intensity);

  switch (type) {
    case 'beat':
      return finish([lightTap(0, Math.min(energy, 0.45))]);

    case 'bass_pulse': {
      const base = [
        tap(0, 'long-press', 'impact-heavy', pulseMs(energy, 36, 72)),
      ];
      if (opts.strength === 'soft') return finish(base);
      const medium = [
        ...base,
        tap(118, 'gesture-end', 'impact-medium', pulseMs(energy, 18, 34)),
      ];
      if (opts.strength === 'medium') return finish(medium);
      return finish([
        ...medium,
        tap(230, 'confirm', 'impact-rigid', pulseMs(energy, 18, 32)),
      ]);
    }

    case 'drum_fill':
      return finish([
        tap(0, 'keyboard-press', 'impact-rigid', pulseMs(energy, 8, 18)),
        tap(62, 'segment-tick', 'impact-light', pulseMs(energy, 8, 18)),
        tap(124, 'keyboard-press', 'impact-rigid', pulseMs(energy, 9, 20)),
        tap(196, 'confirm', 'impact-medium', pulseMs(energy, 12, 26)),
      ]);

    case 'energy_rise': {
      const steps = [
        tap(0, 'segment-tick', 'impact-light', pulseMs(energy, 12, 24)),
        tap(140, 'context-click', 'impact-medium', pulseMs(energy, 18, 34)),
        tap(320, 'confirm', 'notification-warning', pulseMs(energy, 26, 48)),
      ];
      if (opts.strength !== 'strong') return finish(steps);
      return finish([
        ...steps,
        tap(500, 'confirm', 'impact-heavy', pulseMs(energy, 26, 50)),
      ]);
    }

    case 'line_start':
      return finish([
        tap(0, 'virtual-key', energy > 0.72 ? 'impact-medium' : 'impact-light', pulseMs(energy, 14, 30)),
        tap(82, 'virtual-key-release', 'impact-light', pulseMs(energy, 10, 22)),
      ]);

    case 'mood_shift':
      return finish([
        tap(0, 'context-click', 'impact-soft', pulseMs(energy, 16, 30)),
        tap(170, 'gesture-start', 'notification-warning', pulseMs(energy, 20, 40)),
      ]);

    case 'sustain': {
      const baseSteps = [
        tap(0, 'segment-tick', 'impact-soft', pulseMs(energy, 16, 28)),
        lightTap(120, energy),
        tap(240, 'clock-tick', 'impact-light', pulseMs(energy, 12, 24)),
      ];
      if (opts.strength === 'soft') return finish(baseSteps);
      const mediumSteps = [
        ...baseSteps,
        lightTap(360, energy),
        tap(500, 'context-click', 'impact-soft', pulseMs(energy, 14, 28)),
      ];
      if (opts.strength === 'medium') return finish(mediumSteps);
      return finish([
        ...mediumSteps,
        tap(640, 'segment-tick', 'impact-medium', pulseMs(energy, 18, 34)),
      ]);
    }

    case 'chorus_warning': {
      const steps = [
        tap(0, 'segment-tick', 'impact-light', pulseMs(energy, 14, 28)),
        tap(130, 'context-click', 'impact-medium', pulseMs(energy, 18, 34)),
        tap(285, 'confirm', 'notification-warning', pulseMs(energy, 24, 44)),
      ];
      if (opts.strength !== 'strong') return finish(steps);
      return finish([
        ...steps,
        tap(455, 'gesture-start', 'impact-rigid', pulseMs(energy, 22, 42)),
      ]);
    }

    case 'chorus': {
      const base = [
        tap(0, 'long-press', 'impact-heavy', pulseMs(energy, 40, 76)),
        tap(125, 'confirm', 'notification-success', pulseMs(energy, 28, 52)),
      ];
      if (opts.strength === 'soft') return finish(base);
      const medium = [
        ...base,
        tap(245, 'gesture-end', 'impact-rigid', pulseMs(energy, 24, 42)),
      ];
      if (opts.strength === 'medium') return finish(medium);
      return finish([
        tap(0, 'long-press', 'impact-heavy', pulseMs(energy, 50, 86)),
        tap(92, 'confirm', 'notification-success', pulseMs(energy, 30, 56)),
        tap(190, 'long-press', 'impact-rigid', pulseMs(energy, 42, 70)),
        tap(315, 'confirm', 'impact-heavy', pulseMs(energy, 28, 54)),
        tap(445, 'gesture-end', 'impact-medium', pulseMs(energy, 18, 34)),
      ]);
    }

    case 'section_end':
      return finish([
        tap(0, 'gesture-end', 'impact-medium', pulseMs(energy, 22, 42)),
        tap(115, 'clock-tick', 'impact-soft', pulseMs(energy, 12, 24)),
      ]);

    case 'pause':
      return finish([]);
  }
}

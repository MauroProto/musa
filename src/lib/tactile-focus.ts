import type { AuthoredMoment, HapticEventType, Intensity, SensoryLayer } from './types.ts';

export type TactileFocus = {
  label: string;
  layer: SensoryLayer;
  cueType: HapticEventType;
  intensity: Intensity;
  startMs: number;
  endMs: number;
  suppressBeat: boolean;
};

export function resolveTactileFocus(
  moments: AuthoredMoment[] | undefined,
  currentMs: number,
): TactileFocus | null {
  const active = (moments ?? [])
    .filter((moment) => currentMs >= moment.t && currentMs <= moment.endMs)
    .sort((a, b) => focusPriority(b) - focusPriority(a) || b.intensity - a.intensity || a.t - b.t);

  const top = active[0];
  if (!top) return null;

  return {
    label: top.label,
    layer: top.layer,
    cueType: top.cueType,
    intensity: top.intensity,
    startMs: top.t,
    endMs: top.endMs,
    suppressBeat: top.suppressBeat === true,
  };
}

export function shouldSuppressBeatAt(
  moments: AuthoredMoment[] | undefined,
  currentMs: number,
): boolean {
  return (moments ?? []).some(
    (moment) => moment.suppressBeat === true && currentMs >= moment.t && currentMs <= moment.endMs,
  );
}

function focusPriority(moment: AuthoredMoment): number {
  switch (moment.cueType) {
    case 'chorus':
      return 100;
    case 'guitar_riff':
      return 92;
    case 'drum_fill':
      return 88;
    case 'guitar_strum':
      return 82;
    case 'bass_pulse':
      return 78;
    case 'energy_rise':
      return 74;
    case 'mood_shift':
      return 68;
    default:
      return 40;
  }
}

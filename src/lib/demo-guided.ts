import { DANI_CALIFORNIA_TRACK_ID } from './demo-score-tracks.ts';
import type { HapticEventType, SyncedLine } from './types.ts';

export type GuidedDemoStep = {
  id: string;
  label: string;
  detail: string;
  jumpMs: number;
  endMs: number;
  cueType: HapticEventType;
};

const DANI_GUIDED_STEPS: GuidedDemoStep[] = [
  {
    id: 'drums-intro',
    label: 'Drums count-in',
    detail: 'Start with the dry percussion pulse so the tempo is readable before the band enters.',
    jumpMs: 0,
    endMs: 7500,
    cueType: 'drum_fill',
  },
  {
    id: 'signature-riff',
    label: 'Signature guitar riff',
    detail: 'The phone switches to a syncopated guitar pattern: short, brushed, and repeated.',
    jumpMs: 7500,
    endMs: 15500,
    cueType: 'guitar_riff',
  },
  {
    id: 'verse-bass',
    label: 'Verse bass walk',
    detail: 'Low-end pulses carry the verse body under the vocal phrasing.',
    jumpMs: 15580,
    endMs: 45000,
    cueType: 'bass_pulse',
  },
  {
    id: 'pre-chorus',
    label: 'Pre-chorus build',
    detail: 'Ascending pressure tells you the hook is coming before it lands.',
    jumpMs: 45000,
    endMs: 56000,
    cueType: 'energy_rise',
  },
  {
    id: 'first-chorus',
    label: 'First chorus',
    detail: 'The strongest full-band haptic impact marks the shared payoff.',
    jumpMs: 56460,
    endMs: 76500,
    cueType: 'chorus',
  },
  {
    id: 'bridge',
    label: 'Bridge mood shift',
    detail: 'A softer emotional marker signals the song turning inward.',
    jumpMs: 137120,
    endMs: 156000,
    cueType: 'mood_shift',
  },
  {
    id: 'guitar-solo',
    label: 'Guitar solo',
    detail: 'Fast guitar strums return as the lead line opens up.',
    jumpMs: 190000,
    endMs: 230000,
    cueType: 'guitar_strum',
  },
];

export function guidedStepsForTrack(trackId: number): GuidedDemoStep[] {
  if (trackId !== DANI_CALIFORNIA_TRACK_ID) return [];
  return DANI_GUIDED_STEPS;
}

export function currentGuidedStep(trackId: number, currentMs: number): GuidedDemoStep | null {
  const steps = guidedStepsForTrack(trackId);
  return steps.find((step) => currentMs >= step.jumpMs && currentMs < step.endMs) ?? null;
}

export function nextGuidedStep(trackId: number, currentMs: number): GuidedDemoStep | null {
  const steps = guidedStepsForTrack(trackId);
  return steps.find((step) => step.jumpMs > currentMs) ?? null;
}

export function fallbackSensoryCaptionsForTrack(trackId: number): SyncedLine[] {
  if (trackId !== DANI_CALIFORNIA_TRACK_ID) return [];
  return DANI_GUIDED_STEPS.map((step) => ({
    startMs: step.jumpMs,
    endMs: step.endMs,
    text: step.label,
  }));
}
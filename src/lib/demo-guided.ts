import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from './demo-score-tracks.ts';
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

const ORDINARY_GUIDED_STEPS: GuidedDemoStep[] = [
  {
    id: 'acoustic-open',
    label: 'Acoustic pulse opens',
    detail: 'A close guitar pattern sets the tactile room before the full arrangement grows.',
    jumpMs: 0,
    endMs: 18500,
    cueType: 'guitar_strum',
  },
  {
    id: 'vocal-closeup',
    label: 'Vocal close-up',
    detail: 'The phone softens into longer vocal texture while the arrangement stays narrow.',
    jumpMs: 18500,
    endMs: 39000,
    cueType: 'sustain',
  },
  {
    id: 'first-lift',
    label: 'First body lift',
    detail: 'The first large arrival becomes a broader, stronger tactile impact.',
    jumpMs: 39000,
    endMs: 59000,
    cueType: 'chorus',
  },
  {
    id: 'strings-rise',
    label: 'Strings rise underneath',
    detail: 'Sustained strings feed the body layer and pull the song upward.',
    jumpMs: 76000,
    endMs: 99000,
    cueType: 'energy_rise',
  },
  {
    id: 'drums-widen',
    label: 'Drums widen the frame',
    detail: 'Percussion enters as sharper taps around the larger emotional swell.',
    jumpMs: 112000,
    endMs: 146000,
    cueType: 'drum_fill',
  },
  {
    id: 'final-lift',
    label: 'Final lift and release',
    detail: 'The strongest body cue holds, then clears into a softer ending.',
    jumpMs: 146000,
    endMs: 184000,
    cueType: 'chorus',
  },
];

const GUIDED_STEPS_BY_TRACK: Record<number, GuidedDemoStep[]> = {
  [DANI_CALIFORNIA_TRACK_ID]: DANI_GUIDED_STEPS,
  [ORDINARY_TRACK_ID]: ORDINARY_GUIDED_STEPS,
};

export function guidedStepsForTrack(trackId: number): GuidedDemoStep[] {
  return GUIDED_STEPS_BY_TRACK[trackId] ?? [];
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
  return guidedStepsForTrack(trackId).map((step) => ({
    startMs: step.jumpMs,
    endMs: step.endMs,
    text: step.label,
  }));
}

import type { HapticEventType, Intensity } from '../lib/types';

export type HapticLegendItem = {
  type: HapticEventType;
  icon: string;
  label: string;
  haptic: string;
  visual: string;
  why: string;
  color: string; // monocromo: el brillo del gris indica la intensidad
  intensity: Intensity;
};

export const HAPTIC_LEGEND: HapticLegendItem[] = [
  {
    type: 'line_start',
    icon: 'corner-down-right',
    label: 'New lyric line',
    haptic: 'Two crisp taps',
    visual: 'Line highlights',
    why: 'Marks when a vocal phrase begins',
    color: '#FFFFFF',
    intensity: 0.6,
  },
  {
    type: 'beat',
    icon: 'activity',
    label: 'Main pulse',
    haptic: 'Quiet timing tick',
    visual: 'Pulsing dot',
    why: 'Helps you keep timing',
    color: '#7C7C7C',
    intensity: 0.2,
  },
  {
    type: 'bass_pulse',
    icon: 'volume-2',
    label: 'Bass body',
    haptic: 'Heavy low pulse',
    visual: 'Energy meter thickens',
    why: 'Transmits the physical weight of the track',
    color: '#FFFFFF',
    intensity: 0.8,
  },
  {
    type: 'drum_fill',
    icon: 'fast-forward',
    label: 'Drum fill',
    haptic: 'Fast tap texture',
    visual: 'Pre-chorus flicker',
    why: 'Signals that the arrangement is about to turn',
    color: '#D8D8D8',
    intensity: 0.8,
  },
  {
    type: 'energy_rise',
    icon: 'trending-up',
    label: 'Energy build',
    haptic: 'Ascending pressure',
    visual: 'Meter climbs',
    why: 'Makes tension and release legible',
    color: '#ECECEC',
    intensity: 0.6,
  },
  {
    type: 'sustain',
    icon: 'wind',
    label: 'Emotional sustain',
    haptic: 'Textured pulse train',
    visual: 'Glowing line',
    why: 'Transmits a long, held phrase',
    color: '#B0B0B0',
    intensity: 0.6,
  },
  {
    type: 'mood_shift',
    icon: 'aperture',
    label: 'Mood shift',
    haptic: 'Soft tone marker',
    visual: 'Meaning label changes',
    why: 'Marks when the lyric changes emotional color',
    color: '#C4C4C4',
    intensity: 0.6,
  },
  {
    type: 'chorus_warning',
    icon: 'trending-up',
    label: 'Chorus coming',
    haptic: 'Rising countdown',
    visual: 'Countdown appears',
    why: 'Anticipation + structure',
    color: '#D0D0D0',
    intensity: 0.6,
  },
  {
    type: 'chorus',
    icon: 'zap',
    label: 'Chorus / drop',
    haptic: 'Heavy hit + rebound',
    visual: 'Screen blooms',
    why: 'The shared energy moment',
    color: '#FFFFFF',
    intensity: 1,
  },
  {
    type: 'pause',
    icon: 'pause',
    label: 'Vocal pause',
    haptic: 'No vibration',
    visual: 'Open space / breath',
    why: 'Feel absence and tension',
    color: '#5A5A5A',
    intensity: 0.2,
  },
  {
    type: 'section_end',
    icon: 'corner-down-left',
    label: 'Section ending',
    haptic: 'Release tap',
    visual: 'Energy settles',
    why: 'Closes a verse, bridge, or chorus',
    color: '#8C8C8C',
    intensity: 0.4,
  },
];

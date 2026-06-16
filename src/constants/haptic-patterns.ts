import type { HapticEventType, Intensity } from '../lib/types';

export type HapticLegendItem = {
  type: HapticEventType;
  icon: string;
  label: string;
  haptic: string;
  visual: string;
  why: string;
  color: string;
  intensity: Intensity;
};

export const HAPTIC_LEGEND: HapticLegendItem[] = [
  {
    type: 'line_start',
    icon: 'corner-down-right',
    label: 'New lyric line',
    haptic: 'Double tap',
    visual: 'Line highlights',
    why: 'Marks when a vocal phrase begins',
    color: '#0A84FF',
    intensity: 0.6,
  },
  {
    type: 'beat',
    icon: 'activity',
    label: 'Main pulse',
    haptic: 'Short tap',
    visual: 'Pulsing dot',
    why: 'Helps you keep timing',
    color: '#64D2FF',
    intensity: 0.2,
  },
  {
    type: 'sustain',
    icon: 'wind',
    label: 'Emotional sustain',
    haptic: 'Soft long vibration',
    visual: 'Glowing line',
    why: 'Transmits a long, held phrase',
    color: '#5E5CE6',
    intensity: 0.6,
  },
  {
    type: 'chorus_warning',
    icon: 'trending-up',
    label: 'Chorus coming',
    haptic: 'Three rising taps',
    visual: 'Countdown appears',
    why: 'Anticipation + structure',
    color: '#FF9F0A',
    intensity: 0.6,
  },
  {
    type: 'chorus',
    icon: 'zap',
    label: 'Chorus / drop',
    haptic: 'Strong hit',
    visual: 'Screen blooms',
    why: 'The shared energy moment',
    color: '#FFB340',
    intensity: 1,
  },
  {
    type: 'pause',
    icon: 'pause',
    label: 'Vocal pause',
    haptic: 'Haptic silence',
    visual: 'Open space / breath',
    why: 'Feel absence and tension',
    color: 'rgba(235,235,245,0.45)',
    intensity: 0.2,
  },
];

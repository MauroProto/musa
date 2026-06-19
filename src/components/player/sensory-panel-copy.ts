import type { IconName } from '../Icon';
import type { HapticEvent } from '../../lib/types';
import type { PlayerLayerState } from '../../lib/player-layer-state';

const CUE_LABELS: Record<HapticEvent['type'], string> = {
  bass_pulse: 'Bass body',
  beat: 'Main pulse',
  chorus: 'Chorus impact',
  chorus_warning: 'Chorus coming',
  drum_fill: 'Percussion turn',
  energy_rise: 'Energy build',
  guitar_riff: 'Signature riff',
  guitar_strum: 'Guitar strum',
  line_start: 'New lyric phrase',
  mood_shift: 'Mood shift',
  pause: 'Vocal space',
  section_end: 'Section release',
  sustain: 'Held vocal',
};

const CUE_DETAILS: Record<HapticEvent['type'], string> = {
  bass_pulse: 'Low-end energy is carrying the physical groove',
  beat: 'Timing pulse',
  chorus: 'The main hook opens with the strongest tactile accent',
  chorus_warning: 'A shared energy moment is approaching',
  drum_fill: 'Percussion is pushing into the next section',
  energy_rise: 'The song is building pressure',
  guitar_riff: 'The defining guitar riff is driving the song identity',
  guitar_strum: 'The guitar is carrying the movement of the track',
  line_start: 'A new vocal phrase begins',
  mood_shift: 'The lyric changed emotional color',
  pause: 'Silence creates tension',
  section_end: 'The arrangement releases',
  sustain: 'The vocal phrase is being held',
};

const CUE_ICONS: Partial<Record<HapticEvent['type'], IconName>> = {
  bass_pulse: 'bass',
  chorus: 'flash',
  chorus_warning: 'trendUp',
  drum_fill: 'drums',
  energy_rise: 'energy',
  guitar_riff: 'guitar',
  guitar_strum: 'guitar',
  line_start: 'voice',
  mood_shift: 'emotion',
  sustain: 'wind',
};

const LAYER_ICONS: Record<PlayerLayerState['key'], IconName> = {
  bass: 'bass',
  drums: 'drums',
  emotion: 'emotion',
  energy: 'energy',
  guitar: 'guitar',
  structure: 'structure',
  voice: 'voice',
};

export function cueLabel(type: HapticEvent['type']): string {
  return CUE_LABELS[type];
}

export function cueDetail(type: HapticEvent['type']): string {
  return CUE_DETAILS[type];
}

export function cueIcon(type?: HapticEvent['type']): IconName {
  return type ? CUE_ICONS[type] ?? 'disc' : 'disc';
}

export function layerIcon(key: PlayerLayerState['key']): IconName {
  return LAYER_ICONS[key];
}

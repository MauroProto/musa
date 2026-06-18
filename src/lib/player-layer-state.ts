import type { HapticEventType, SectionMark, SensoryMoment } from './types';

export type PlayerLayerKey = 'guitar' | 'drums' | 'bass' | 'voice' | 'energy' | 'emotion' | 'structure';

export type PlayerLayerState = {
  key: PlayerLayerKey;
  label: string;
  level: number;
  active: boolean;
};

type PlayerLayerStateInput = {
  energy: number;
  cueType?: HapticEventType;
  moments: SensoryMoment[];
  sectionKind?: SectionMark['kind'];
  isPlaying: boolean;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function cueLayer(type?: HapticEventType): PlayerLayerKey | null {
  switch (type) {
    case 'bass_pulse':
      return 'bass';
    case 'drum_fill':
      return 'drums';
    case 'guitar_strum':
      return 'guitar';
    case 'line_start':
    case 'sustain':
      return 'voice';
    case 'mood_shift':
      return 'emotion';
    case 'chorus':
    case 'chorus_warning':
    case 'energy_rise':
    case 'section_end':
      return 'structure';
    case 'beat':
    case 'pause':
    case undefined:
      return null;
  }
}

function momentBoost(moments: SensoryMoment[], key: PlayerLayerKey): number {
  return moments
    .filter((moment) => moment.layer === key)
    .reduce((max, moment) => Math.max(max, moment.intensity), 0);
}

export function buildPlayerLayerStates({
  energy,
  cueType,
  moments,
  sectionKind,
  isPlaying,
}: PlayerLayerStateInput): PlayerLayerState[] {
  const safeEnergy = clamp01(energy);
  const activeCueLayer = cueLayer(cueType);
  const sectionIsChorus = sectionKind === 'chorus';
  const sectionIsActive = sectionKind !== undefined;

  const rows: (Omit<PlayerLayerState, 'level' | 'active'> & { base: number })[] = [
    { key: 'guitar', label: 'Guitar', base: 0.16 + safeEnergy * 0.34 },
    { key: 'drums', label: 'Drums', base: 0.1 + safeEnergy * 0.34 },
    { key: 'bass', label: 'Low end', base: 0.1 + safeEnergy * 0.24 },
    { key: 'voice', label: 'Vocal', base: isPlaying ? 0.34 : 0.12 },
    { key: 'energy', label: 'Energy', base: safeEnergy },
    { key: 'emotion', label: 'Emotion', base: 0.12 },
    { key: 'structure', label: sectionIsChorus ? 'Chorus' : 'Form', base: sectionIsChorus ? 0.72 : sectionIsActive ? 0.28 : 0.16 },
  ];

  return rows.map((row) => {
    const cueBoost = activeCueLayer === row.key ? 1 : 0;
    const activeMomentBoost = momentBoost(moments, row.key);
    const level = clamp01(Math.max(row.base, cueBoost, activeMomentBoost));
    return {
      key: row.key,
      label: row.label,
      level,
      active: cueBoost > 0 || activeMomentBoost > 0 || (row.key === 'structure' && sectionIsChorus),
    };
  });
}

import type { AudioMode } from './audio-client';
import { DEFAULT_LAYER_GAINS, type LayerGains } from './layer-gains';
import type { HapticStrength, ListeningProfile } from './types';

export type FontScale = 'comfortable' | 'large' | 'xl';

/**
 * A starting point tuned for each way of listening. Applied when the profile is
 * chosen in onboarding (and re-appliable from Settings). Everything stays fully
 * adjustable afterwards — this is guidance, not a lock.
 */
export type ProfilePreset = {
  strength: HapticStrength;
  visualOnly: boolean;
  audioMode: AudioMode;
  fontScale: FontScale;
  layerGains: LayerGains;
  /** One-line, plain-language reason shown in Settings. */
  rationale: string;
};

export const PROFILE_LABEL: Record<ListeningProfile, string> = {
  deaf_visual: 'Deaf',
  hard_of_hearing: 'Hard of hearing',
  cochlear_implant: 'Cochlear implant',
  hearing_aid: 'Hearing aid',
  feel_more: 'Feel more',
};

export const PROFILE_PRESETS: Record<ListeningProfile, ProfilePreset> = {
  // Deaf — touch carries everything. Strong cues, silent, big captions, and the
  // body (bass) + voice pushed up so the song's shape is unmistakable.
  deaf_visual: {
    strength: 'strong',
    visualOnly: false,
    audioMode: 'silent',
    fontScale: 'xl',
    layerGains: { drums: 1, bass: 1.3, guitar: 0.9, vocals: 1.3 },
    rationale: 'Strong, silent, big captions — with the voice and body pushed up.',
  },
  // Hard of hearing — some sound remains. Play the mix, lift the voice you tend
  // to lose, keep haptics balanced.
  hard_of_hearing: {
    strength: 'medium',
    visualOnly: false,
    audioMode: 'mix',
    fontScale: 'large',
    layerGains: { drums: 1, bass: 1, guitar: 1, vocals: 1.3 },
    rationale: 'Plays the mix with the voice lifted — the part most easily lost.',
  },
  // Cochlear implant — rhythm and voice come through, texture is missed, so the
  // guitar/texture layer is boosted; voice isolated to learn the layer.
  cochlear_implant: {
    strength: 'medium',
    visualOnly: false,
    audioMode: 'isolate',
    fontScale: 'large',
    layerGains: { drums: 1, bass: 1, guitar: 1.35, vocals: 1.1 },
    rationale: 'Boosts the texture layer you miss, and lets you isolate one stem.',
  },
  // Hearing aid — clarity over rumble. Tame the low end, lift the voice.
  hearing_aid: {
    strength: 'medium',
    visualOnly: false,
    audioMode: 'mix',
    fontScale: 'large',
    layerGains: { drums: 1, bass: 0.7, guitar: 1, vocals: 1.2 },
    rationale: 'Tames low-end rumble and lifts the voice for clarity.',
  },
  // Feel more — a hearing user who wants the full multisensory hit.
  feel_more: {
    strength: 'strong',
    visualOnly: false,
    audioMode: 'mix',
    fontScale: 'large',
    layerGains: { drums: 1.2, bass: 1.2, guitar: 1.2, vocals: 1.2 },
    rationale: 'Everything turned up — the fullest multisensory version.',
  },
};

export function presetForProfile(profile: ListeningProfile): ProfilePreset {
  return PROFILE_PRESETS[profile];
}

export function defaultPreset(): ProfilePreset {
  return {
    strength: 'medium',
    visualOnly: false,
    audioMode: 'silent',
    fontScale: 'large',
    layerGains: DEFAULT_LAYER_GAINS,
    rationale: '',
  };
}

import type { AudioSource } from 'expo-audio';
import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from './demo-score-tracks';
import type { StemKind } from './audio-client';

type StemAudioKind = StemKind | 'no_vocals';
type StemSourceMap = Record<StemAudioKind, AudioSource>;

const STEM_AUDIO_ASSETS: Record<number, StemSourceMap> = {
  [DANI_CALIFORNIA_TRACK_ID]: {
    bass: require('../../assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_bass_split_by_lalalai.mp3'),
    drums: require('../../assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_drum_split_by_lalalai.mp3'),
    guitar: require('../../assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_electric_guitar_split_by_lalalai.mp3'),
    vocals: require('../../assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_vocals_split_by_lalalai.mp3'),
    no_vocals: require('../../assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_no_vocals_split_by_lalalai.mp3'),
  },
  [ORDINARY_TRACK_ID]: {
    bass: require('../../assets/lalalai/ordinary/Alex warren - Ordinary_strings_split_by_lalalai.mp3'),
    drums: require('../../assets/lalalai/ordinary/Alex warren - Ordinary_drum_split_by_lalalai.mp3'),
    guitar: require('../../assets/lalalai/ordinary/Alex warren - Ordinary_acoustic_guitar_split_by_lalalai.mp3'),
    vocals: require('../../assets/lalalai/ordinary/Alex warren - Ordinary_vocals_split_by_lalalai.mp3'),
    no_vocals: require('../../assets/lalalai/ordinary/Alex warren - Ordinary_no_vocals_split_by_lalalai.mp3'),
  },
};

export function getBundledStemAudioSource(trackId: number, stem: StemKind): AudioSource | null {
  return STEM_AUDIO_ASSETS[trackId]?.[stem] ?? null;
}

export function hasBundledStemAudio(trackId: number): boolean {
  const stems = STEM_AUDIO_ASSETS[trackId];
  return Boolean(stems?.bass && stems.drums && stems.guitar && stems.vocals);
}

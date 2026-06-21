import type { AudioSource } from 'expo-audio';
import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from './demo-score-tracks.ts';
import type { StemKind } from './audio-client.ts';

type StemSourceMap = Record<StemKind, string>;

const DEFAULT_STEM_AUDIO_BASE_URL =
  'https://raw.githubusercontent.com/MauroProto/musa/main/assets/lalalai';

const STEM_AUDIO_PATHS: Record<number, StemSourceMap> = {
  [DANI_CALIFORNIA_TRACK_ID]: {
    bass: 'pasirluyu_red-hot-chili-peppers-dani-california_bass_split_by_lalalai.mp3',
    drums: 'pasirluyu_red-hot-chili-peppers-dani-california_drum_split_by_lalalai.mp3',
    guitar: 'pasirluyu_red-hot-chili-peppers-dani-california_electric_guitar_split_by_lalalai.mp3',
    vocals: 'pasirluyu_red-hot-chili-peppers-dani-california_vocals_split_by_lalalai.mp3',
  },
  [ORDINARY_TRACK_ID]: {
    bass: 'ordinary/Alex warren - Ordinary_strings_split_by_lalalai.mp3',
    drums: 'ordinary/Alex warren - Ordinary_drum_split_by_lalalai.mp3',
    guitar: 'ordinary/Alex warren - Ordinary_acoustic_guitar_split_by_lalalai.mp3',
    vocals: 'ordinary/Alex warren - Ordinary_vocals_split_by_lalalai.mp3',
  },
};

function stemAudioBaseUrl(): string {
  return (process.env.EXPO_PUBLIC_STEM_AUDIO_BASE_URL ?? DEFAULT_STEM_AUDIO_BASE_URL).replace(/\/+$/, '');
}

export function getRemoteStemAudioUrl(trackId: number, stem: StemKind): string | null {
  const relativePath = STEM_AUDIO_PATHS[trackId]?.[stem];
  if (!relativePath) return null;
  const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
  return `${stemAudioBaseUrl()}/${encodedPath}`;
}

export function getRemoteStemAudioSource(trackId: number, stem: StemKind): AudioSource | null {
  const uri = getRemoteStemAudioUrl(trackId, stem);
  return uri ? { uri } : null;
}

export function hasRemoteStemAudio(trackId: number): boolean {
  const stems = STEM_AUDIO_PATHS[trackId];
  return Boolean(stems?.bass && stems.drums && stems.guitar && stems.vocals);
}

import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from './demo-score-tracks.ts';

export type StemKind = 'bass' | 'drums' | 'guitar' | 'vocals';
export type StemAudioKind = StemKind | 'no_vocals';
type StemSourceMap = Record<StemAudioKind, string>;

export const DEFAULT_STEM_AUDIO_BASE_URL =
  'https://pub-c392c19f21d2456aa30d465e6f0a9d40.r2.dev';

const STEM_AUDIO_PATHS: Record<number, StemSourceMap> = {
  [DANI_CALIFORNIA_TRACK_ID]: {
    bass: 'pasirluyu_red-hot-chili-peppers-dani-california_bass_split_by_lalalai.mp3',
    drums: 'pasirluyu_red-hot-chili-peppers-dani-california_drum_split_by_lalalai.mp3',
    guitar: 'pasirluyu_red-hot-chili-peppers-dani-california_electric_guitar_split_by_lalalai.mp3',
    no_vocals: 'pasirluyu_red-hot-chili-peppers-dani-california_no_vocals_split_by_lalalai.mp3',
    vocals: 'pasirluyu_red-hot-chili-peppers-dani-california_vocals_split_by_lalalai.mp3',
  },
  [ORDINARY_TRACK_ID]: {
    bass: 'ordinary/Alex warren - Ordinary_strings_split_by_lalalai.mp3',
    drums: 'ordinary/Alex warren - Ordinary_drum_split_by_lalalai.mp3',
    guitar: 'ordinary/Alex warren - Ordinary_acoustic_guitar_split_by_lalalai.mp3',
    no_vocals: 'ordinary/Alex warren - Ordinary_no_vocals_split_by_lalalai.mp3',
    vocals: 'ordinary/Alex warren - Ordinary_vocals_split_by_lalalai.mp3',
  },
};

function stemAudioBaseUrl(): string {
  const env =
    typeof process !== 'undefined' && process.env
      ? process.env.EXPO_PUBLIC_STEM_AUDIO_BASE_URL
      : undefined;
  return (env ?? DEFAULT_STEM_AUDIO_BASE_URL).replace(/\/+$/, '');
}

export function getRemoteStemAudioUrl(trackId: number, stem: StemAudioKind): string | null {
  const relativePath = STEM_AUDIO_PATHS[trackId]?.[stem];
  if (!relativePath) return null;
  const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
  return `${stemAudioBaseUrl()}/${encodedPath}`;
}

export function hasRemoteStemAudio(trackId: number): boolean {
  const stems = STEM_AUDIO_PATHS[trackId];
  return Boolean(stems?.bass && stems.drums && stems.guitar && stems.no_vocals && stems.vocals);
}

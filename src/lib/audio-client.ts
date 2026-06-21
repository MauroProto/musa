import { Platform } from 'react-native';
import type { AudioSource } from 'expo-audio';
import { getBundledStemAudioSource } from './stem-audio-assets';

/**
 * MUSA — client-safe audio mode + stem streaming URLs.
 *
 * Audio playback is OPTIONAL and OFF by default ("silent"), keeping MUSA
 * faithful to its Deaf-first pitch. When the user opts in ("mix" or
 * "isolate"), we stream the LALAL stems that are already separated locally
 * for the demo track, letting hard-of-hearing users hear + feel + read in
 * sync — and isolate a single layer, which Apple Music Haptics does not offer.
 */

/** Which audio experience the player uses. */
export type AudioMode = 'silent' | 'mix' | 'isolate';

/** A stem the user can isolate. `no_vocals` (instrumental) is internal to mix only. */
export type StemKind = 'bass' | 'drums' | 'guitar' | 'vocals';

export const ISOLATABLE_STEMS: { key: StemKind; label: string }[] = [
  { key: 'vocals', label: 'Vocals' },
  { key: 'guitar', label: 'Guitar' },
  { key: 'drums', label: 'Drums' },
  { key: 'bass', label: 'Body' },
];

export const AUDIO_MODE_OPTIONS: { key: AudioMode; label: string; hint: string }[] = [
  { key: 'silent', label: 'Silent', hint: 'Haptics + lyrics only (Deaf-first)' },
  { key: 'mix', label: 'Full mix', hint: 'Hear the song with haptics in sync' },
  { key: 'isolate', label: 'Isolate', hint: 'Solo one stem to learn the layer' },
];

function apiBase(): string {
  if (Platform.OS === 'web') return '';
  return process.env.EXPO_PUBLIC_API_BASE ?? '';
}

export function getStemStreamUrl(trackId: number, stem: 'bass' | 'drums' | 'guitar' | 'vocals' | 'no_vocals'): string {
  return `${apiBase()}/api/audio?trackId=${trackId}&stem=${stem}`;
}

export function usesBundledStemAudio(): boolean {
  return Platform.OS !== 'web' && apiBase().length === 0;
}

export function getStemAudioSource(trackId: number, stem: StemKind): AudioSource | null {
  if (usesBundledStemAudio()) {
    return getBundledStemAudioSource(trackId, stem);
  }
  return { uri: getStemStreamUrl(trackId, stem) };
}

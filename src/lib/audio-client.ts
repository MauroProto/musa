import { Platform } from 'react-native';
import { getRemoteStemAudioUrl } from './stem-audio-assets.ts';
import type { StemAudioKind, StemKind } from './stem-audio-assets.ts';

/**
 * MUSA — client-safe audio mode + stem streaming URLs.
 *
 * Audio playback is OPTIONAL and OFF by default ("silent"), keeping MUSA
 * faithful to its Deaf-first pitch. When the user opts in ("mix" or
 * "isolate"), we stream the repo-hosted LALAL stems for the demo track,
 * letting hard-of-hearing users hear + feel + read in sync — and isolate a
 * single layer, which Apple Music Haptics does not offer.
 */

/** Which audio experience the player uses. */
export type AudioMode = 'silent' | 'mix' | 'isolate';

type AudioSource = { uri: string };

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

export function getStemStreamUrl(trackId: number, stem: StemAudioKind): string {
  return `${apiBase()}/api/audio?trackId=${trackId}&stem=${stem}`;
}

export function usesRemoteStemAudio(): boolean {
  return apiBase().length === 0;
}

export function getStemAudioSource(trackId: number, stem: StemAudioKind): AudioSource | null {
  const remoteUri = getRemoteStemAudioUrl(trackId, stem);
  if (remoteUri) return { uri: remoteUri };
  if (Platform.OS !== 'web' && apiBase().length === 0) return null;
  return { uri: getStemStreamUrl(trackId, stem) };
}

export type { StemAudioKind, StemKind };

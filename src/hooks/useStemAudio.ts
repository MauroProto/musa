import type { AudioMode, StemKind } from '../lib/audio-client';
import type { LayerGains } from '../lib/layer-gains';

/**
 * Expo Go judge build: keep the player on the deterministic internal clock.
 *
 * The full stem-audio mixer is intentionally not loaded in the public Expo Go
 * path. Expo Go is the easiest no-install demo path for judges, but it is also
 * the least forgiving runtime for large streamed media + native audio state.
 * Haptics, captions, guided moments and stem analysis still run from bundled
 * data. Full audio belongs in an APK/dev build.
 */
export type StemAudioController = {
  ready: boolean;
  play(): void;
  pause(): void;
  seekTo(ms: number): void;
  getCurrentMs(): number | null;
};

export function useStemAudio(
  _trackId: number,
  _mode: AudioMode,
  _isolateStem: StemKind,
  _layerGains: LayerGains,
): StemAudioController | null {
  return null;
}

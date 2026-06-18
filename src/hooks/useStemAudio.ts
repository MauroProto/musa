import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { getStemStreamUrl } from '../lib/audio-client';
import type { AudioMode, StemKind } from '../lib/audio-client';

/**
 * MUSA — optional stem-audio controller.
 *
 * Manages up to two `expo-audio` players so the haptic score can optionally
 * play the real song:
 *   - silent  → no audio (Deaf-first default); the haptic clock drives everything.
 *   - mix     → vocals + no_vocals (instrumental) together = full mix.
 *   - isolate → a single stem soloed, so the user can learn one layer.
 *
 * The controller exposes a clock (`getCurrentMs`) that the player hook uses as
 * the master timebase when audio is active, replacing the rAF wall-clock for
 * sample-accurate haptic sync.
 */
export type StemAudioController = {
  /** Whether the active player has loaded audio and can play. */
  ready: boolean;
  play(): void;
  pause(): void;
  seekTo(ms: number): void;
  /** Current audio time in ms, or null when there is no audio clock. */
  getCurrentMs(): number | null;
};

const NO_SOURCE = null;

export function useStemAudio(
  trackId: number,
  mode: AudioMode,
  isolateStem: StemKind,
): StemAudioController | null {
  // Build sources per mode. The hook handles source replacement automatically.
  const primarySource =
    mode === 'silent' ? NO_SOURCE : mode === 'mix'
      ? { uri: getStemStreamUrl(trackId, 'vocals') }
      : { uri: getStemStreamUrl(trackId, isolateStem) };
  const secondarySource = mode === 'mix' ? { uri: getStemStreamUrl(trackId, 'no_vocals') } : NO_SOURCE;

  const primary = useAudioPlayer(primarySource, { updateInterval: 250, downloadFirst: false });
  const secondary = useAudioPlayer(secondarySource, { updateInterval: 250, downloadFirst: false });

  const primaryRef = useRef(primary);
  const secondaryRef = useRef(secondary);
  primaryRef.current = primary;
  secondaryRef.current = secondary;

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const playingRef = useRef(false);
  const readyRef = useRef(false);
  readyRef.current = primary.isLoaded;

  // Bypass the iOS silent switch so demo audio always plays.
  useEffect(() => {
    if (mode === 'silent') return;
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, [mode]);

  // Keep both players at full volume; mixing happens by muting the inactive one.
  // Note: useAudioPlayer RECREATES the player when its source changes (mode/stem
  // switch). A freshly-created player reports currentTime 0 while paused, so
  // getCurrentMs guards on `playing` to avoid poisoning the haptic clock. After a
  // mode switch mid-song the audio pauses until the user presses play (which seeks
  // to the current position); haptics keep going via the wall-clock fallback.
  useEffect(() => {
    primary.volume = 1;
    if (mode === 'mix') secondary.volume = 1;
  }, [primary, secondary, mode]);

  const play = useCallback(() => {
    playingRef.current = true;
    const p = primaryRef.current;
    if (!p) return;
    try {
      p.play();
      if (modeRef.current === 'mix') {
        secondaryRef.current.play();
      }
    } catch {
      /* native player not ready yet */
    }
  }, []);

  const pause = useCallback(() => {
    playingRef.current = false;
    try {
      primaryRef.current.pause();
      secondaryRef.current.pause();
    } catch {
      /* no-op */
    }
  }, []);

  const seekTo = useCallback((ms: number) => {
    const seconds = Math.max(0, ms / 1000);
    const p = primaryRef.current;
    if (!p) return;
    void p.seekTo(seconds).catch(() => {});
    if (modeRef.current === 'mix') {
      void secondaryRef.current.seekTo(seconds).catch(() => {});
    }
  }, []);

  const getCurrentMs = useCallback((): number | null => {
    if (modeRef.current === 'silent') return null;
    const p = primaryRef.current;
    // Ignore players that aren't actively playing: a freshly-recreated player
    // (after a mode/stem switch) reports currentTime 0 while paused, which would
    // otherwise drag the haptic clock back to the start of the song.
    if (!p || !p.isLoaded || !p.playing) return null;
    const ct = p.currentTime;
    if (!Number.isFinite(ct) || ct < 0) return null;
    return ct * 1000;
  }, []);

  // Light passive re-sync of the secondary onto the primary in mix mode, once
  // per ~1s of playback, to keep stems aligned despite minor clock drift.
  useEffect(() => {
    if (mode !== 'mix') return;
    const id = setInterval(() => {
      if (!playingRef.current) return;
      const p = primaryRef.current;
      const s = secondaryRef.current;
      if (!p || !s) return;
      const drift = Math.abs(p.currentTime - s.currentTime) * 1000;
      if (drift > 250) {
        void s.seekTo(p.currentTime).catch(() => {});
      }
    }, 1000);
    return () => clearInterval(id);
  }, [mode]);

  return useMemo(
    () => ({ ready: readyRef.current, play, pause, seekTo, getCurrentMs }),
    [play, pause, seekTo, getCurrentMs],
  );
}

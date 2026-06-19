import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { getStemStreamUrl } from '../lib/audio-client';
import type { AudioMode, StemKind } from '../lib/audio-client';
import { clampGain, type LayerGains } from '../lib/layer-gains';

/**
 * MUSA — optional stem-audio controller with a LIVE 4-stem mixer.
 *
 *   - silent  → no audio (Deaf-first default); the haptic clock drives everything.
 *   - mix     → bass + drums + guitar + vocals play together, each at its own
 *               volume from the live mixer (`layerGains`). Turn the voice up,
 *               the drums down — in real time.
 *   - isolate → a single stem soloed, to learn one layer.
 *
 * Drums is the clock in mix mode (it keeps advancing even when its volume is 0),
 * the soloed stem is the clock in isolate mode. Secondary stems are periodically
 * re-synced to the clock to fight drift.
 */
export type StemAudioController = {
  ready: boolean;
  play(): void;
  pause(): void;
  seekTo(ms: number): void;
  getCurrentMs(): number | null;
};

const NO_SOURCE = null;
const STEMS = ['bass', 'drums', 'guitar', 'vocals'] as const;
type Stem = (typeof STEMS)[number];

export function useStemAudio(
  trackId: number,
  mode: AudioMode,
  isolateStem: StemKind,
  layerGains: LayerGains,
): StemAudioController | null {
  const want = (stem: Stem): boolean => {
    if (mode === 'silent') return false;
    if (mode === 'isolate') return stem === isolateStem;
    return true; // mix → all four
  };
  const src = (stem: Stem) => (want(stem) ? { uri: getStemStreamUrl(trackId, stem) } : NO_SOURCE);

  const bass = useAudioPlayer(src('bass'), { updateInterval: 250, downloadFirst: false });
  const drums = useAudioPlayer(src('drums'), { updateInterval: 250, downloadFirst: false });
  const guitar = useAudioPlayer(src('guitar'), { updateInterval: 250, downloadFirst: false });
  const vocals = useAudioPlayer(src('vocals'), { updateInterval: 250, downloadFirst: false });

  const players = useMemo(
    () => ({ bass, drums, guitar, vocals }) as Record<Stem, ReturnType<typeof useAudioPlayer>>,
    [bass, drums, guitar, vocals],
  );
  const playersRef = useRef(players);
  playersRef.current = players;

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const isolateRef = useRef(isolateStem);
  isolateRef.current = isolateStem;
  const playingRef = useRef(false);

  /** The player used as the master clock for the current mode. */
  const clockStem = useCallback((): Stem => {
    if (modeRef.current === 'isolate') return isolateRef.current as Stem;
    return 'drums';
  }, []);

  const activeStems = useCallback((): Stem[] => {
    if (modeRef.current === 'silent') return [];
    if (modeRef.current === 'isolate') return [isolateRef.current as Stem];
    return [...STEMS];
  }, []);

  const ready = mode === 'isolate' ? players[isolateStem as Stem]?.isLoaded ?? false : drums.isLoaded;

  // Bypass the iOS silent switch so demo audio always plays.
  useEffect(() => {
    if (mode === 'silent') return;
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, [mode]);

  // Live volume from the mixer. In mix mode each stem follows its gain (0..1);
  // a soloed stem always plays at full volume.
  useEffect(() => {
    if (mode === 'silent') return;
    for (const stem of STEMS) {
      const p = players[stem];
      if (!p) continue;
      try {
        p.volume = mode === 'isolate' ? 1 : Math.min(1, clampGain(layerGains[stem]));
      } catch {
        /* player not ready */
      }
    }
  }, [players, mode, layerGains]);

  const play = useCallback(() => {
    playingRef.current = true;
    for (const stem of activeStems()) {
      try {
        playersRef.current[stem]?.play();
      } catch {
        /* not ready */
      }
    }
  }, [activeStems]);

  const pause = useCallback(() => {
    playingRef.current = false;
    for (const stem of STEMS) {
      try {
        playersRef.current[stem]?.pause();
      } catch {
        /* no-op */
      }
    }
  }, []);

  const seekTo = useCallback((ms: number) => {
    const seconds = Math.max(0, ms / 1000);
    for (const stem of activeStems()) {
      void playersRef.current[stem]?.seekTo(seconds).catch(() => {});
    }
  }, [activeStems]);

  const getCurrentMs = useCallback((): number | null => {
    if (modeRef.current === 'silent') return null;
    const p = playersRef.current[clockStem()];
    // Ignore players that aren't actively playing: a freshly-recreated player
    // reports currentTime 0 while paused, which would drag the haptic clock back.
    if (!p || !p.isLoaded || !p.playing) return null;
    const ct = p.currentTime;
    if (!Number.isFinite(ct) || ct < 0) return null;
    return ct * 1000;
  }, [clockStem]);

  // Re-sync secondary stems onto the clock once per ~1s of playback (mix only).
  useEffect(() => {
    if (mode !== 'mix') return;
    const id = setInterval(() => {
      if (!playingRef.current) return;
      const lead = playersRef.current.drums;
      if (!lead || !lead.isLoaded) return;
      for (const stem of STEMS) {
        if (stem === 'drums') continue;
        const s = playersRef.current[stem];
        if (!s || !s.isLoaded) continue;
        const drift = Math.abs(lead.currentTime - s.currentTime) * 1000;
        if (drift > 250) void s.seekTo(lead.currentTime).catch(() => {});
      }
    }, 1000);
    return () => clearInterval(id);
  }, [mode]);

  return useMemo(
    () => ({ ready, play, pause, seekTo, getCurrentMs }),
    [ready, play, pause, seekTo, getCurrentMs],
  );
}

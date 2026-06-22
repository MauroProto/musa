import { useCallback, useEffect, useMemo, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Platform } from 'react-native';
import { getStemAudioSource, type AudioMode, type StemKind } from '../lib/audio-client';
import { audioClockMs } from '../lib/audio-clock';
import { clampGain, type LayerGains } from '../lib/layer-gains';

/**
 * Optional demo audio controller.
 *
 * - silent: haptics + captions only.
 * - mix: no_vocals + vocals from R2, enough to reconstruct the full song while
 *   keeping Expo Go to two native audio players.
 * - isolate: one stem from R2, used to teach a tactile/audio layer.
 */
export type StemAudioController = {
  ready: boolean;
  play(): void;
  pause(): void;
  seekTo(ms: number): void;
  getCurrentMs(): number | null;
};

type ExpoAudioPlayer = ReturnType<typeof useAudioPlayer>;

const AUDIO_OPTIONS = {
  updateInterval: 250,
  downloadFirst: Platform.OS !== 'web',
  keepAudioSessionActive: true,
};
const NO_SOURCE = null;
const SEEK_CLOCK_HOLD_MS = 900;

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

export function useStemAudio(
  trackId: number,
  mode: AudioMode,
  isolateStem: StemKind,
  layerGains: LayerGains,
): StemAudioController | null {
  const bedSource = useMemo(
    () => (mode === 'mix' ? getStemAudioSource(trackId, 'no_vocals') : NO_SOURCE),
    [trackId, mode],
  );
  const vocalSource = useMemo(
    () => (mode === 'mix' ? getStemAudioSource(trackId, 'vocals') : NO_SOURCE),
    [trackId, mode],
  );
  const isolateSource = useMemo(
    () => (mode === 'isolate' ? getStemAudioSource(trackId, isolateStem) : NO_SOURCE),
    [trackId, mode, isolateStem],
  );

  const bed = useAudioPlayer(bedSource, AUDIO_OPTIONS);
  const vocals = useAudioPlayer(vocalSource, AUDIO_OPTIONS);
  const isolate = useAudioPlayer(isolateSource, AUDIO_OPTIONS);

  const bedStatus = useAudioPlayerStatus(bed);
  const vocalsStatus = useAudioPlayerStatus(vocals);
  const isolateStatus = useAudioPlayerStatus(isolate);

  const ready =
    mode === 'mix'
      ? bedStatus.isLoaded && vocalsStatus.isLoaded
      : mode === 'isolate'
        ? isolateStatus.isLoaded
        : false;

  const playersRef = useRef({ bed, vocals, isolate });
  playersRef.current = { bed, vocals, isolate };

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const playingRef = useRef(false);
  const lastSeekSecondsRef = useRef(0);
  const seekPendingUntilRef = useRef(0);

  const activePlayers = useCallback((): ExpoAudioPlayer[] => {
    const players = playersRef.current;
    if (modeRef.current === 'mix') return [players.bed, players.vocals];
    if (modeRef.current === 'isolate') return [players.isolate];
    return [];
  }, []);

  const pauseAll = useCallback(() => {
    for (const p of [playersRef.current.bed, playersRef.current.vocals, playersRef.current.isolate]) {
      try {
        p.pause();
      } catch {
        /* no-op */
      }
    }
  }, []);

  const playActivePlayers = useCallback(() => {
    if (modeRef.current === 'silent') return;
    for (const p of activePlayers()) {
      try {
        p.play();
      } catch {
        /* stream may still be loading */
      }
    }
  }, [activePlayers]);

  const pauseActivePlayers = useCallback(() => {
    for (const p of activePlayers()) {
      try {
        p.pause();
      } catch {
        /* no-op */
      }
    }
  }, [activePlayers]);

  const markSeekPending = useCallback(() => {
    seekPendingUntilRef.current = nowMs() + SEEK_CLOCK_HOLD_MS;
  }, []);

  const seekIsPending = useCallback(() => nowMs() < seekPendingUntilRef.current, []);

  useEffect(() => {
    if (mode === 'silent') {
      playingRef.current = false;
      pauseAll();
      return;
    }
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, [mode, pauseAll]);

  useEffect(() => {
    if (mode === 'silent') return;
    try {
      const bedGain = clampGain((layerGains.bass + layerGains.drums + layerGains.guitar) / 3);
      bed.volume = mode === 'mix' ? Math.min(1, bedGain) : 0;
      vocals.volume = mode === 'mix' ? Math.min(1, clampGain(layerGains.vocals)) : 0;
      isolate.volume = mode === 'isolate' ? 1 : 0;
    } catch {
      /* player may not be ready yet */
    }
  }, [bed, vocals, isolate, mode, layerGains]);

  const seekTo = useCallback(
    (ms: number) => {
      const seconds = Math.max(0, ms / 1000);
      lastSeekSecondsRef.current = seconds;
      const shouldResume = playingRef.current;
      markSeekPending();
      if (shouldResume) pauseActivePlayers();
      const seeks = activePlayers().map((p) => p.seekTo(seconds).catch(() => {}));
      void Promise.all(seeks).then(() => {
        seekPendingUntilRef.current = 0;
        if (playingRef.current) playActivePlayers();
      });
    },
    [activePlayers, markSeekPending, pauseActivePlayers, playActivePlayers],
  );

  const play = useCallback(() => {
    if (modeRef.current === 'silent') return;
    playingRef.current = true;
    playActivePlayers();
  }, [playActivePlayers]);

  const pause = useCallback(() => {
    playingRef.current = false;
    seekPendingUntilRef.current = 0;
    pauseAll();
  }, [pauseAll]);

  const getCurrentMs = useCallback((): number | null => {
    if (modeRef.current === 'silent') return null;
    const players = playersRef.current;
    const clock = modeRef.current === 'mix' ? players.bed : players.isolate;
    return audioClockMs({
      isLoaded: clock.isLoaded,
      currentTime: clock.currentTime,
      playing: clock.playing,
      playbackRequested: playingRef.current,
      seekPending: seekIsPending(),
    });
  }, [seekIsPending]);

  useEffect(() => {
    if (!ready || !playingRef.current) return;
    const seconds = lastSeekSecondsRef.current;
    markSeekPending();
    const seeks = activePlayers().map((p) => p.seekTo(seconds).catch(() => {}));
    void Promise.all(seeks).then(() => {
      seekPendingUntilRef.current = 0;
      if (playingRef.current) playActivePlayers();
    });
  }, [ready, activePlayers, markSeekPending, playActivePlayers]);

  useEffect(() => {
    if (mode !== 'mix') return;
    const id = setInterval(() => {
      if (!playingRef.current) return;
      const { bed: lead, vocals: follower } = playersRef.current;
      if (!lead.isLoaded || !follower.isLoaded) return;
      const driftMs = Math.abs(lead.currentTime - follower.currentTime) * 1000;
      if (driftMs > 220) void follower.seekTo(lead.currentTime).catch(() => {});
      if (!follower.playing) {
        try {
          follower.play();
        } catch {
          /* keep haptic clock running */
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [mode]);

  useEffect(() => pause, [pause]);

  return useMemo(
    () => (mode === 'silent' ? null : { ready, play, pause, seekTo, getCurrentMs }),
    [mode, ready, play, pause, seekTo, getCurrentMs],
  );
}

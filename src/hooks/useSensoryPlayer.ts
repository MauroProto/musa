import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getLyricsClient, getStemsClient } from '../lib/api-client';
import {
  activeSensoryMoments,
  buildSensoryScore,
  energyValueAt,
  getCurrentLineIndex,
  nearestChorusIn,
} from '../lib/sensory-score';
import { createHapticController, type HapticController } from '../lib/haptics';
import { seekByDeltaMs, seekToMs } from '../lib/player-time';
import { usePreferences } from '../store/preferences';
import type { HapticEvent, Intensity, SectionMark, SensoryMoment, SensoryScore, SyncedLine } from '../lib/types';

export type PlayerStatus = 'loading' | 'ready' | 'error';

export type PlayerCue = { id: number; type: HapticEvent['type']; t: number } | null;

export type SensoryPlayer = {
  status: PlayerStatus;
  errorMessage?: string;
  lines: SyncedLine[];
  score: SensoryScore | null;
  sections: SectionMark[];
  currentMs: number;
  durationMs: number;
  isPlaying: boolean;
  cue: PlayerCue;
  beatPulse: number;
  currentLineIndex: number;
  currentSection: SectionMark | null;
  activeMoments: SensoryMoment[];
  nextChorusInMs: number | null;
  energySource: string;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  seekBy: (deltaMs: number) => void;
  seekTo: (targetMs: number) => void;
};

export function useSensoryPlayer(trackId: number, hints: { durationMs?: number }): SensoryPlayer {
  const strength = usePreferences((s) => s.strength);
  const pulseOn = usePreferences((s) => s.pulseOn);
  const visualOnly = usePreferences((s) => s.visualOnly);

  const [status, setStatus] = useState<PlayerStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [lines, setLines] = useState<SyncedLine[]>([]);
  const [score, setScore] = useState<SensoryScore | null>(null);
  const [energySource, setEnergySource] = useState('estimated');

  const [currentMs, setCurrentMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cue, setCue] = useState<PlayerCue>(null);
  const [beatPulse, setBeatPulse] = useState(0);
  const cueIdRef = useRef(0);

  const currentMsRef = useRef(0);
  const playStartMsRef = useRef(0);
  const playStartWallRef = useRef(0);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const frameRef = useRef<() => void>(() => {});
  const eventCursorRef = useRef(0);
  const beatCursorRef = useRef(0);
  const lastStatePushRef = useRef(0);
  const lastSemanticHapticMsRef = useRef(-Infinity);
  const scoreRef = useRef<SensoryScore | null>(null);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const hapticRef = useRef<HapticController | null>(null);
  useEffect(() => {
    hapticRef.current = createHapticController({ strength, visualOnly });
    return () => hapticRef.current?.stop();
  }, [strength, visualOnly]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (cancelled) return;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      hapticRef.current?.stop();
      currentMsRef.current = 0;
      eventCursorRef.current = 0;
      beatCursorRef.current = 0;
      lastSemanticHapticMsRef.current = -Infinity;
      setCurrentMs(0);
      setIsPlaying(false);
      setCue(null);
      setBeatPulse(0);
      setEnergySource('estimated');
      setStatus('loading');
      setErrorMessage(undefined);
      try {
        const [{ lines: fetched }, stems] = await Promise.all([
          getLyricsClient(trackId),
          getStemsClient(trackId),
        ]);
        if (cancelled) return;
        const built = buildSensoryScore({
          lines: fetched,
          durationMs: hints.durationMs && hints.durationMs > 0 ? hints.durationMs : stems?.durationMs,
          bpm: stems?.bpm,
          stemAnalysis: stems?.stemAnalysis,
          energy: stems?.stemAnalysis ? undefined : stems?.energy,
        });
        if (cancelled) return;
        setLines(fetched);
        setScore(built);
        setEnergySource(built.source);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : 'Failed to load');
        setStatus('error');
      }
    }
    void Promise.resolve().then(load);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      hapticRef.current?.stop();
    };
  }, [trackId, hints.durationMs]);

  const durationMs = score?.durationMs ?? hints.durationMs ?? 0;

  const resetCursors = useCallback((tMs: number) => {
    const s = scoreRef.current;
    if (!s) return;
    eventCursorRef.current = lowerBound(s.events, (e) => e.t < tMs);
    beatCursorRef.current = lowerBound(s.beats, (b) => b < tMs);
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const frame = useCallback(() => {
    const now = performance.now();
    const tMs = Math.min(durationMs, playStartMsRef.current + (now - playStartWallRef.current));
    const s = scoreRef.current;

    if (s) {
      while (
        eventCursorRef.current < s.events.length &&
        s.events[eventCursorRef.current].t <= tMs
      ) {
        const e = s.events[eventCursorRef.current];
        eventCursorRef.current += 1;
        if (e.type !== 'beat') {
          hapticRef.current?.fire(e.type, e.intensity);
          lastSemanticHapticMsRef.current = e.t;
          cueIdRef.current += 1;
          setCue({ id: cueIdRef.current, type: e.type, t: e.t });
        }
      }
      while (beatCursorRef.current < s.beats.length && s.beats[beatCursorRef.current] <= tMs) {
        const beatT = s.beats[beatCursorRef.current];
        beatCursorRef.current += 1;
        setBeatPulse((p) => (p + 1) % 1_000_000);
        const hasNearbySemanticCue = Math.abs(beatT - lastSemanticHapticMsRef.current) < 260;
        if (pulseOn && !visualOnly && !hasNearbySemanticCue) {
          hapticRef.current?.fire('beat', beatIntensityFromEnergy(energyValueAt(s.energy, beatT)));
        }
      }
    }

    currentMsRef.current = tMs;
    if (now - lastStatePushRef.current > 80) {
      lastStatePushRef.current = now;
      setCurrentMs(tMs);
    }

    if (tMs >= durationMs) {
      stopLoop();
      setIsPlaying(false);
      return;
    }
    rafRef.current = requestAnimationFrame(() => frameRef.current());
  }, [durationMs, pulseOn, visualOnly, stopLoop]);

  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  const play = useCallback(() => {
    if (status !== 'ready' || !scoreRef.current) return;
    if (rafRef.current !== null) return;
    if (currentMsRef.current >= durationMs) {
      currentMsRef.current = 0;
      resetCursors(0);
    }
    playStartMsRef.current = currentMsRef.current;
    playStartWallRef.current = performance.now();
    resetCursors(currentMsRef.current);
    lastStatePushRef.current = 0;
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(() => frameRef.current());
  }, [status, durationMs, resetCursors]);

  const pause = useCallback(() => {
    stopLoop();
    setIsPlaying(false);
    hapticRef.current?.stop();
  }, [stopLoop]);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seekToPlaybackTime = useCallback((target: number) => {
      currentMsRef.current = target;
      setCurrentMs(target);
      resetCursors(target);
      if (isPlaying) {
        playStartMsRef.current = target;
        playStartWallRef.current = performance.now();
      }
  }, [isPlaying, resetCursors]);

  const seekBy = useCallback(
    (deltaMs: number) => {
      const target = seekByDeltaMs(currentMsRef.current, durationMs, deltaMs);
      seekToPlaybackTime(target);
    },
    [durationMs, seekToPlaybackTime],
  );

  const seekTo = useCallback(
    (targetMs: number) => {
      seekToPlaybackTime(seekToMs(targetMs, durationMs));
    },
    [durationMs, seekToPlaybackTime],
  );

  const restart = useCallback(() => {
    stopLoop();
    currentMsRef.current = 0;
    setCurrentMs(0);
    resetCursors(0);
    setIsPlaying(false);
    hapticRef.current?.stop();
  }, [resetCursors, stopLoop]);

  useEffect(() => {
    return () => {
      stopLoop();
      hapticRef.current?.stop();
    };
  }, [stopLoop]);

  const currentLineIndex = useMemo(
    () => (score ? getCurrentLineIndex(lines, currentMs) : -1),
    [score, lines, currentMs],
  );
  const currentSection = useMemo(() => {
    if (!score) return null;
    return score.sections.find((s) => currentMs >= s.t && (s.endMs === undefined || currentMs < s.endMs)) ?? null;
  }, [score, currentMs]);
  const activeMoments = useMemo(
    () => (score ? activeSensoryMoments(score.moments, currentMs, 3) : []),
    [score, currentMs],
  );
  const nextChorusInMs = useMemo(
    () => (score ? nearestChorusIn(score.chorusTimesMs, currentMs) : null),
    [score, currentMs],
  );

  return {
    status,
    errorMessage,
    lines,
    score,
    sections: score?.sections ?? [],
    currentMs,
    durationMs,
    isPlaying,
    cue,
    beatPulse,
    currentLineIndex,
    currentSection,
    activeMoments,
    nextChorusInMs,
    energySource,
    play,
    pause,
    toggle,
    restart,
    seekBy,
    seekTo,
  };
}

function beatIntensityFromEnergy(energy: number): Intensity {
  if (energy >= 0.72) return 0.6;
  if (energy >= 0.44) return 0.4;
  return 0.2;
}

function lowerBound<T>(arr: T[], predicate: (item: T) => boolean): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (predicate(arr[mid])) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

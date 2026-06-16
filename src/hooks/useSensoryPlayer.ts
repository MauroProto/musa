import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getLyricsClient, getStemsClient } from '../lib/api-client';
import { buildSensoryScore, getCurrentLineIndex, nearestChorusIn } from '../lib/sensory-score';
import { createHapticController, type HapticController } from '../lib/haptics';
import { usePreferences } from '../store/preferences';
import type { HapticEvent, SectionMark, SensoryScore, SyncedLine } from '../lib/types';

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
  nextChorusInMs: number | null;
  energySource: string;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  seekBy: (deltaMs: number) => void;
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
  const eventCursorRef = useRef(0);
  const beatCursorRef = useRef(0);
  const lastStatePushRef = useRef(0);
  const scoreRef = useRef<SensoryScore | null>(null);
  scoreRef.current = score;

  const hapticRef = useRef<HapticController | null>(null);
  useEffect(() => {
    hapticRef.current = createHapticController({ strength, visualOnly });
    return () => hapticRef.current?.stop();
  }, [strength, visualOnly]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setErrorMessage(undefined);
    async function load() {
      try {
        const { lines: fetched } = await getLyricsClient(trackId);
        if (cancelled) return;
        const stems = await getStemsClient(trackId).catch(() => null);
        if (cancelled) return;
        const built = buildSensoryScore({
          lines: fetched,
          durationMs: hints.durationMs && hints.durationMs > 0 ? hints.durationMs : undefined,
          energy: stems?.energy && stems.energy.length > 1 ? stems.energy : undefined,
        });
        if (cancelled) return;
        setLines(fetched);
        setScore(built);
        if (stems?.source) setEnergySource(stems.source);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : 'Failed to load');
        setStatus('error');
      }
    }
    void load();
    return () => {
      cancelled = true;
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
          cueIdRef.current += 1;
          setCue({ id: cueIdRef.current, type: e.type, t: e.t });
        }
      }
      while (beatCursorRef.current < s.beats.length && s.beats[beatCursorRef.current] <= tMs) {
        beatCursorRef.current += 1;
        setBeatPulse((p) => (p + 1) % 1_000_000);
        if (pulseOn && !visualOnly) {
          hapticRef.current?.fire('beat', 0.2);
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
    rafRef.current = requestAnimationFrame(frame);
  }, [durationMs, pulseOn, visualOnly, stopLoop]);

  const play = useCallback(() => {
    if (status !== 'ready' || !scoreRef.current) return;
    if (currentMsRef.current >= durationMs) {
      currentMsRef.current = 0;
      resetCursors(0);
    }
    playStartMsRef.current = currentMsRef.current;
    playStartWallRef.current = performance.now();
    resetCursors(currentMsRef.current);
    lastStatePushRef.current = 0;
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(frame);
  }, [status, durationMs, resetCursors, frame]);

  const pause = useCallback(() => {
    stopLoop();
    setIsPlaying(false);
    hapticRef.current?.stop();
  }, [stopLoop]);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seekBy = useCallback(
    (deltaMs: number) => {
      const target = Math.max(0, Math.min(durationMs, currentMsRef.current + deltaMs));
      currentMsRef.current = target;
      setCurrentMs(target);
      resetCursors(target);
      if (isPlaying) {
        playStartMsRef.current = target;
        playStartWallRef.current = performance.now();
      }
    },
    [durationMs, isPlaying, resetCursors],
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
    nextChorusInMs,
    energySource,
    play,
    pause,
    toggle,
    restart,
    seekBy,
  };
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

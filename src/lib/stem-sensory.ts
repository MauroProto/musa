import type {
  EnergyPoint,
  HapticEvent,
  Intensity,
  SensoryMoment,
  StemAnalysis,
  StemFrame,
} from './types';

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** The four separable musical layers we analyse. */
type StemKey = 'bass' | 'drums' | 'guitar' | 'vocals';

/** Maps a stem key to its onset (peak) field, when present. */
const ONSET_KEY: Record<StemKey, 'onsetBass' | 'onsetDrums' | 'onsetGuitar' | 'onsetVocals'> = {
  bass: 'onsetBass',
  drums: 'onsetDrums',
  guitar: 'onsetGuitar',
  vocals: 'onsetVocals',
};

function clampIntensity(value: number): Intensity {
  const steps: Intensity[] = [0.2, 0.4, 0.6, 0.8, 1];
  let best = steps[0];
  let bestDiff = Infinity;
  for (const step of steps) {
    const diff = Math.abs(step - value);
    if (diff < bestDiff) {
      best = step;
      bestDiff = diff;
    }
  }
  return best;
}

function orderedFrames(analysis: StemAnalysis): StemFrame[] {
  return [...analysis.frames].sort((a, b) => a.t - b.t);
}

/** RMS (sustained) level for a stem. Used for energy curves. */
function value(frame: StemFrame, key: keyof Omit<StemFrame, 't'>): number {
  return clamp01(frame[key] ?? 0);
}

/**
 * Transient/attack level for a stem. Prefers the onset (peak) field when
 * available, falling back to RMS so legacy frames without onsets still work.
 * Used for strum/fill/bass-attack detection where attacks matter more than level.
 */
function onsetValue(frame: StemFrame, key: StemKey): number {
  const onset = frame[ONSET_KEY[key]];
  return clamp01(onset ?? frame[key] ?? 0);
}

function isLocalPeak(frames: StemFrame[], index: number, key: StemKey, threshold: number): boolean {
  const current = onsetValue(frames[index], key);
  if (current < threshold) return false;
  const prev = index > 0 ? onsetValue(frames[index - 1], key) : 0;
  const next = index < frames.length - 1 ? onsetValue(frames[index + 1], key) : 0;
  return current >= prev && current >= next;
}

function nearestFrame(frames: StemFrame[], t: number): StemFrame {
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (frames[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  const next = frames[lo];
  const prev = lo > 0 ? frames[lo - 1] : next;
  return Math.abs(prev.t - t) <= Math.abs(next.t - t) ? prev : next;
}

function grooveStrengthAt(frames: StemFrame[], t: number): number {
  const frame = nearestFrame(frames, t);
  return clamp01(value(frame, 'drums') * 0.52 + value(frame, 'guitar') * 0.32 + value(frame, 'bass') * 0.16);
}

export function energyFromStemAnalysis(analysis: StemAnalysis): EnergyPoint[] {
  return orderedFrames(analysis).map((frame) => {
    const bass = value(frame, 'bass');
    const drums = value(frame, 'drums');
    const guitar = value(frame, 'guitar');
    const vocals = value(frame, 'vocals');
    const weighted = bass * 0.22 + drums * 0.38 + guitar * 0.3 + vocals * 0.1;
    return { t: frame.t, value: clamp01(weighted) };
  });
}

export function grooveBeatsFromStemAnalysis(analysis: StemAnalysis): number[] {
  const frames = orderedFrames(analysis);
  if (frames.length === 0) return [];

  const lastFrameT = frames.at(-1)?.t ?? 0;
  const durationMs = Math.max(analysis.durationMs ?? 0, lastFrameT);
  const bpm = Math.max(40, Math.min(220, analysis.bpm ?? 120));
  const stepMs = 60000 / bpm;
  const phaseStepMs = Math.max(25, Math.round(stepMs / 16));

  let bestPhase = 0;
  let bestScore = -Infinity;
  for (let phase = 0; phase < stepMs; phase += phaseStepMs) {
    let score = 0;
    let count = 0;
    for (let t = phase; t <= durationMs; t += stepMs) {
      const groove = grooveStrengthAt(frames, t);
      score += groove + (groove >= 0.55 ? 0.18 : 0);
      count += 1;
    }
    const normalized = count > 0 ? score / count : 0;
    if (normalized > bestScore) {
      bestScore = normalized;
      bestPhase = phase;
    }
  }

  const beats: number[] = [];
  for (let t = bestPhase; t <= durationMs; t += stepMs) {
    beats.push(Math.round(t));
  }
  return beats;
}

export function hapticEventsFromStemAnalysis(analysis: StemAnalysis): HapticEvent[] {
  const frames = orderedFrames(analysis);
  const events: HapticEvent[] = [];

  let lastBassT = -Infinity;
  for (let i = 0; i < frames.length; i++) {
    if (!isLocalPeak(frames, i, 'bass', 0.74)) continue;
    const frame = frames[i];
    if (frame.t - lastBassT < 1300) continue;
    const bass = onsetValue(frame, 'bass');
    events.push({
      t: frame.t,
      type: 'bass_pulse',
      intensity: clampIntensity(0.5 + bass * 0.45),
      durationMs: 220,
    });
    lastBassT = frame.t;
  }

  let lastFillT = -Infinity;
  for (let i = 0; i < frames.length - 2; i++) {
    const first = frames[i];
    const second = frames[i + 1];
    const third = frames[i + 2];
    const tightCluster = third.t - first.t <= 850;
    const strongDrums =
      onsetValue(first, 'drums') >= 0.66 &&
      onsetValue(second, 'drums') >= 0.66 &&
      onsetValue(third, 'drums') >= 0.66;
    if (!tightCluster || !strongDrums || first.t - lastFillT < 1600) continue;
    const maxDrum = Math.max(onsetValue(first, 'drums'), onsetValue(second, 'drums'), onsetValue(third, 'drums'));
    events.push({
      t: first.t,
      type: 'drum_fill',
      intensity: clampIntensity(0.55 + maxDrum * 0.45),
      durationMs: 360,
    });
    lastFillT = first.t;
  }
  for (let i = 0; i < frames.length; i++) {
    if (!isLocalPeak(frames, i, 'drums', 0.76)) continue;
    const frame = frames[i];
    if (frame.t - lastFillT < 2200) continue;
    const drum = onsetValue(frame, 'drums');
    events.push({
      t: frame.t,
      type: 'drum_fill',
      intensity: clampIntensity(0.52 + drum * 0.46),
      durationMs: 300,
    });
    lastFillT = frame.t;
  }

  let lastGuitarT = -Infinity;
  for (let i = 0; i < frames.length; i++) {
    if (!isLocalPeak(frames, i, 'guitar', 0.6)) continue;
    const frame = frames[i];
    if (frame.t - lastGuitarT < 700) continue;
    const guitar = onsetValue(frame, 'guitar');
    events.push({
      t: frame.t,
      type: 'guitar_strum',
      intensity: clampIntensity(0.48 + guitar * 0.46),
      durationMs: 220,
    });
    lastGuitarT = frame.t;
  }

  for (let i = 1; i < frames.length; i++) {
    const prev = energyFromFrame(frames[i - 1]);
    const current = energyFromFrame(frames[i]);
    if (current - prev < 0.26) continue;
    events.push({
      t: frames[i].t,
      type: 'energy_rise',
      intensity: clampIntensity(0.45 + (current - prev) * 1.4),
      durationMs: 520,
    });
  }

  return events.sort((a, b) => a.t - b.t || b.intensity - a.intensity);
}

export function momentsFromStemAnalysis(analysis: StemAnalysis): SensoryMoment[] {
  const frames = orderedFrames(analysis);
  const moments: SensoryMoment[] = [];
  let lastBassT = -Infinity;
  let lastDrumT = -Infinity;
  let lastGuitarT = -Infinity;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    if (isLocalPeak(frames, i, 'bass', 0.78) && frame.t - lastBassT >= 4200) {
      moments.push({
        t: frame.t,
        endMs: frame.t + 3200,
        layer: 'bass',
        label: 'Bass locks in',
        detail: 'Low-end stem is carrying the physical groove',
        intensity: clampIntensity(0.55 + value(frame, 'bass') * 0.4),
        mood: 'driving',
      });
      lastBassT = frame.t;
    }

    if (isLocalPeak(frames, i, 'drums', 0.8) && frame.t - lastDrumT >= 3600) {
      moments.push({
        t: frame.t,
        endMs: frame.t + 2600,
        layer: 'drums',
        label: 'Drum attack',
        detail: 'Percussion stem adds sharp forward motion',
        intensity: clampIntensity(0.55 + value(frame, 'drums') * 0.4),
        mood: 'driving',
      });
      lastDrumT = frame.t;
    }

    if (isLocalPeak(frames, i, 'guitar', 0.78) && frame.t - lastGuitarT >= 5200) {
      moments.push({
        t: frame.t,
        endMs: frame.t + 4200,
        layer: 'guitar',
        label: 'Guitar texture opens',
        detail: 'The guitar riff is carrying the song surface',
        intensity: clampIntensity(0.45 + value(frame, 'guitar') * 0.35),
        mood: 'euphoric',
      });
      lastGuitarT = frame.t;
    }
  }

  return moments.sort((a, b) => a.t - b.t || b.intensity - a.intensity);
}

function energyFromFrame(frame: StemFrame): number {
  return (
    value(frame, 'bass') * 0.22 +
    value(frame, 'drums') * 0.38 +
    value(frame, 'guitar') * 0.3 +
    value(frame, 'vocals') * 0.1
  );
}

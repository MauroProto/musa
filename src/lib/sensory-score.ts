import type {
  EnergyPoint,
  HapticEvent,
  HapticEventType,
  Intensity,
  SectionMark,
  SensoryScore,
  SensoryScoreInput,
  SensoryMoment,
  SensoryMood,
  SyncedLine,
} from './types';
import {
  energyFromStemAnalysis,
  grooveBeatsFromStemAnalysis,
  hapticEventsFromStemAnalysis,
  momentsFromStemAnalysis,
} from './stem-sensory.ts';

const DEFAULT_BPM = 120;
const SUSTAIN_THRESHOLD_MS = 3500;
const PAUSE_GAP_MS = 1800;
const CHORUS_WARNING_LEAD_MS = 8000;
const CHORUS_WINDOW = 3;
const CHORUS_MAX_BLOCK_GAP_MS = 3200;
const MIN_LINES_FOR_CHORUS = 6;
const STEM_EVENT_MERGE_WINDOW_MS = 180;

export function normalizeLyric(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function lineEndMs(line: SyncedLine, next?: SyncedLine, fallback = 3000): number {
  if (line.endMs && line.endMs > line.startMs) return line.endMs;
  if (next && next.startMs > line.startMs) {
    const span = next.startMs - line.startMs;
    return line.startMs + Math.min(Math.round(span * 0.65), 4000);
  }
  return line.startMs + fallback;
}

export function computeDurationMs(lines: SyncedLine[], hint?: number): number {
  if (hint && hint > 0) return hint;
  if (lines.length === 0) return 0;
  const last = lines[lines.length - 1];
  return last.endMs ?? last.startMs + 4000;
}

export function generateBeats(lines: SyncedLine[], bpm: number, durationMs: number): number[] {
  if (lines.length === 0 || durationMs <= 0) return [];
  const startMs = Math.max(0, lines[0].startMs - 400);
  const stepMs = 60000 / Math.max(40, Math.min(220, bpm));
  const beats: number[] = [];
  for (let t = startMs; t <= durationMs; t += stepMs) {
    beats.push(Math.round(t));
  }
  return beats;
}

type ChorusRegion = { startMs: number; endMs: number; lineStart: number; lineEnd: number };

export function detectChoruses(lines: SyncedLine[]): ChorusRegion[] {
  if (lines.length < MIN_LINES_FOR_CHORUS) return [];

  const fingerprints: { fp: string; occurrences: number[] }[] = [];

  for (let i = 0; i <= lines.length - CHORUS_WINDOW; i++) {
    const block = lines.slice(i, i + CHORUS_WINDOW);
    if (block.some((l) => normalizeLyric(l.text).length < 2)) continue;

    let denseEnough = true;
    for (let j = 1; j < block.length; j++) {
      if (block[j].startMs - block[j - 1].startMs > CHORUS_MAX_BLOCK_GAP_MS) {
        denseEnough = false;
        break;
      }
    }
    if (!denseEnough) continue;

    const fp = block.map((l) => normalizeLyric(l.text)).join(' | ');
    const existing = fingerprints.find((f) => f.fp === fp);
    if (existing) existing.occurrences.push(i);
    else fingerprints.push({ fp, occurrences: [i] });
  }

  const repeated = fingerprints.filter((f) => f.occurrences.length >= 2);
  if (repeated.length > 0) {
    repeated.sort((a, b) => {
      if (b.occurrences.length !== a.occurrences.length) {
        return b.occurrences.length - a.occurrences.length;
      }
      return lines[a.occurrences[0]].startMs - lines[b.occurrences[0]].startMs;
    });
    const best = repeated[0];
    return best.occurrences.map((startIdx, k) => {
      const endIdx = startIdx + CHORUS_WINDOW - 1;
      const startMs = lines[startIdx].startMs;
      const after = lines[endIdx + 1];
      const endMs = lineEndMs(lines[endIdx], after, 4000);
      void k;
      return { startMs, endMs, lineStart: startIdx, lineEnd: endIdx };
    });
  }

  return densestSectionAsChorus(lines);
}

function densestSectionAsChorus(lines: SyncedLine[]): ChorusRegion[] {
  const window = 4;
  let bestIdx = -1;
  let bestScore = Infinity;
  for (let i = 0; i <= lines.length - window; i++) {
    const block = lines.slice(i, i + window);
    if (block.some((l) => normalizeLyric(l.text).length < 2)) continue;
    let avgGap = 0;
    let valid = true;
    for (let j = 1; j < block.length; j++) {
      const gap = block[j].startMs - block[j - 1].startMs;
      if (gap <= 0 || gap > CHORUS_MAX_BLOCK_GAP_MS) {
        valid = false;
        break;
      }
      avgGap += gap;
    }
    if (!valid) continue;
    avgGap /= window - 1;
    if (avgGap < bestScore) {
      bestScore = avgGap;
      bestIdx = i;
    }
  }
  if (bestIdx < 0) return [];
  const startIdx = bestIdx;
  const endIdx = Math.min(lines.length - 1, bestIdx + window - 1);
  const after = lines[endIdx + 1];
  return [
    {
      startMs: lines[startIdx].startMs,
      endMs: lineEndMs(lines[endIdx], after, 4000),
      lineStart: startIdx,
      lineEnd: endIdx,
    },
  ];
}

function isInsideRegion(t: number, regions: { startMs: number; endMs: number }[]): boolean {
  return regions.some((r) => t >= r.startMs && t <= r.endMs);
}

export function estimateEnergy(
  lines: SyncedLine[],
  chorusRegions: ChorusRegion[],
  durationMs: number,
): EnergyPoint[] {
  if (lines.length === 0) return [];
  const points: EnergyPoint[] = [];
  const densityWindowMs = 8000;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nearby = lines.filter((l) => Math.abs(l.startMs - line.startMs) <= densityWindowMs).length;
    const density = Math.min(1, nearby / 8);
    const lengthFactor = Math.min(1, normalizeLyric(line.text).split(' ').length / 8);
    let base = 0.35 + density * 0.35 + lengthFactor * 0.2;
    if (isInsideRegion(line.startMs, chorusRegions)) base = Math.min(1, base + 0.3);
    points.push({ t: line.startMs, value: Math.max(0.1, Math.min(1, base)) });
  }
  if (durationMs > lines[lines.length - 1].startMs) {
    points.push({ t: durationMs, value: 0.15 });
  }
  return points.sort((a, b) => a.t - b.t);
}

function clampIntensity(v: number): Intensity {
  const steps: Intensity[] = [0.2, 0.4, 0.6, 0.8, 1];
  let nearest = steps[0];
  let bestDiff = Infinity;
  for (const s of steps) {
    const d = Math.abs(s - v);
    if (d < bestDiff) {
      bestDiff = d;
      nearest = s;
    }
  }
  return nearest;
}

function energyAt(energy: EnergyPoint[], t: number): number {
  if (energy.length === 0) return 0.5;
  let prev = energy[0];
  for (const p of energy) {
    if (p.t >= t) {
      if (p.t === t) return p.value;
      const span = p.t - prev.t;
      const f = span > 0 ? (t - prev.t) / span : 0;
      return prev.value + (p.value - prev.value) * f;
    }
    prev = p;
  }
  return prev.value;
}

export { energyAt as energyValueAt };

export function inferLyricMood(text: string): SensoryMood {
  const normalized = ` ${normalizeLyric(text)} `;
  const groups: { mood: SensoryMood; words: string[] }[] = [
    { mood: 'melancholic', words: [' tear ', ' tears ', ' cry ', ' crying ', ' lonely ', ' lost ', ' pain ', ' goodbye ', ' hurt '] },
    { mood: 'tense', words: [' fear ', ' afraid ', ' fire ', ' fight ', ' break ', ' danger ', ' dark ', ' world ', ' wrong '] },
    { mood: 'euphoric', words: [' light ', ' lights ', ' dance ', ' alive ', ' free ', ' high ', ' love ', ' tonight ', ' party '] },
    { mood: 'calm', words: [' sleep ', ' dream ', ' quiet ', ' slow ', ' soft ', ' home ', ' breathe '] },
  ];

  for (const group of groups) {
    if (group.words.some((word) => normalized.includes(word))) return group.mood;
  }
  return 'neutral';
}

function moodLabel(mood: SensoryMood): string {
  switch (mood) {
    case 'melancholic':
      return 'Melancholic phrase';
    case 'tense':
      return 'Tension in the lyric';
    case 'euphoric':
      return 'Lift in the lyric';
    case 'calm':
      return 'Soft emotional space';
    case 'driving':
      return 'Driving movement';
    case 'neutral':
      return 'Vocal phrase';
  }
}

function sectionLabel(kind: SectionMark['kind']): string {
  if (kind === 'chorus') return 'Chorus opens';
  if (kind === 'bridge') return 'Bridge turn';
  if (kind === 'intro') return 'Intro';
  if (kind === 'outro') return 'Outro';
  return 'Verse opens';
}

function buildSensoryMoments(args: {
  lines: SyncedLine[];
  sections: SectionMark[];
  energy: EnergyPoint[];
  durationMs: number;
}): SensoryMoment[] {
  const moments: SensoryMoment[] = [];

  for (const section of args.sections) {
    const endMs = section.endMs ?? Math.min(args.durationMs, section.t + 8000);
    const energy = energyAt(args.energy, section.t);
    moments.push({
      t: section.t,
      endMs,
      layer: 'structure',
      label: sectionLabel(section.kind),
      detail: section.kind === 'chorus' ? 'Main hook and shared energy moment' : 'Song structure changes',
      intensity: clampIntensity(0.45 + energy * 0.35),
      mood: section.kind === 'chorus' ? 'euphoric' : 'neutral',
    });
  }

  for (let i = 0; i < args.lines.length; i++) {
    const line = args.lines[i];
    const next = args.lines[i + 1];
    const mood = inferLyricMood(line.text);
    if (mood === 'neutral') continue;
    const endMs = next ? Math.min(next.startMs, line.startMs + 4200) : line.startMs + 3600;
    moments.push({
      t: line.startMs,
      endMs,
      layer: 'emotion',
      label: moodLabel(mood),
      detail: 'Lyric meaning changes the tactile/visual tone',
      intensity: mood === 'tense' || mood === 'euphoric' ? 0.8 : 0.6,
      mood,
    });
  }

  for (let i = 1; i < args.energy.length; i++) {
    const prev = args.energy[i - 1];
    const cur = args.energy[i];
    const delta = cur.value - prev.value;
    if (Math.abs(delta) < 0.22) continue;
    moments.push({
      t: cur.t,
      endMs: Math.min(args.durationMs, cur.t + 4500),
      layer: delta > 0 ? 'bass' : 'structure',
      label: delta > 0 ? 'Energy lift' : 'Energy release',
      detail: delta > 0 ? 'The track is building pressure' : 'The arrangement opens up',
      intensity: clampIntensity(0.45 + Math.abs(delta) * 1.4),
      mood: delta > 0 ? 'driving' : 'calm',
    });
  }

  return moments.sort((a, b) => a.t - b.t || b.intensity - a.intensity);
}

export function activeSensoryMoments(
  moments: SensoryMoment[],
  currentMs: number,
  limit = 3,
): SensoryMoment[] {
  return moments
    .filter((moment) => currentMs >= moment.t && currentMs <= moment.endMs)
    .sort((a, b) => b.intensity - a.intensity || a.t - b.t)
    .slice(0, limit);
}

function eventPriority(type: HapticEventType): number {
  switch (type) {
    case 'chorus':
      return 100;
    case 'drum_fill':
      return 90;
    case 'guitar_strum':
      return 88;
    case 'bass_pulse':
      return 84;
    case 'energy_rise':
      return 76;
    case 'chorus_warning':
      return 70;
    case 'mood_shift':
      return 62;
    case 'sustain':
      return 54;
    case 'line_start':
      return 42;
    case 'section_end':
      return 34;
    case 'pause':
      return 12;
    case 'beat':
      return 0;
  }
}

function shouldReplaceEvent(next: HapticEvent, previous: HapticEvent): boolean {
  const priorityDelta = eventPriority(next.type) - eventPriority(previous.type);
  if (priorityDelta !== 0) return priorityDelta > 0;
  return next.intensity > previous.intensity;
}

function coalesceStemBackedEvents(events: HapticEvent[]): HapticEvent[] {
  const kept: HapticEvent[] = [];
  for (const event of events) {
    let collisionIndex = -1;
    for (let i = kept.length - 1; i >= 0; i--) {
      if (Math.abs(kept[i].t - event.t) > STEM_EVENT_MERGE_WINDOW_MS) break;
      if (kept[i].type !== 'pause' && event.type !== 'pause') {
        collisionIndex = i;
        break;
      }
    }

    if (collisionIndex < 0) {
      kept.push(event);
      continue;
    }

    if (shouldReplaceEvent(event, kept[collisionIndex])) {
      kept[collisionIndex] = event;
    }
  }
  return kept.sort((a, b) => a.t - b.t || eventPriority(b.type) - eventPriority(a.type));
}

export function buildSensoryScore(input: SensoryScoreInput): SensoryScore {
  const lines = [...input.lines].sort((a, b) => a.startMs - b.startMs);
  const durationMs = computeDurationMs(lines, input.durationMs ?? input.stemAnalysis?.durationMs);
  const bpm = input.bpm ?? input.stemAnalysis?.bpm ?? DEFAULT_BPM;
  const chorusRegions = detectChoruses(lines);
  const energy = input.energy ?? (
    input.stemAnalysis ? energyFromStemAnalysis(input.stemAnalysis) : estimateEnergy(lines, chorusRegions, durationMs)
  );
  const beats = input.stemAnalysis
    ? grooveBeatsFromStemAnalysis(input.stemAnalysis)
    : generateBeats(lines, bpm, durationMs);

  const events: HapticEvent[] = [];
  const chorusTimesMs = chorusRegions.map((r) => r.startMs);
  const chorusWarningTimes = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    const endMs = lineEndMs(line, next, 3000);
    const lineDurMs = endMs - line.startMs;
    const inChorus = isInsideRegion(line.startMs, chorusRegions);
    const eAt = energyAt(energy, line.startMs);

    const lineIntensity = clampIntensity(0.55 + (inChorus ? 0.25 : 0) + eAt * 0.2);
    events.push({
      t: line.startMs,
      type: 'line_start' as HapticEventType,
      intensity: lineIntensity,
      durationMs: 60,
    });

    if (lineDurMs > SUSTAIN_THRESHOLD_MS) {
      events.push({
        t: line.startMs + Math.min(900, lineDurMs * 0.3),
        type: 'sustain',
        intensity: clampIntensity(0.6 + (inChorus ? 0.2 : 0)),
        durationMs: Math.min(1800, lineDurMs - 900),
      });
    }

    const mood = inferLyricMood(line.text);
    if (mood !== 'neutral') {
      events.push({
        t: line.startMs + 140,
        type: 'mood_shift',
        intensity: mood === 'tense' || mood === 'euphoric' ? 0.8 : 0.6,
        durationMs: 220,
      });
    }

    if (next) {
      const gap = next.startMs - endMs;
      if (gap >= PAUSE_GAP_MS) {
        events.push({
          t: endMs + Math.min(gap / 2, 400),
          type: 'pause',
          intensity: 0.2,
          durationMs: Math.min(gap, 1200),
        });
      }
    }
  }

  for (const region of chorusRegions) {
    const riseT = region.startMs - 4200;
    if (riseT >= 0) {
      events.push({
        t: riseT,
        type: 'energy_rise',
        intensity: 0.6,
        durationMs: 520,
      });
    }

    const fillT = region.startMs - 1800;
    if (fillT >= 0) {
      events.push({
        t: fillT,
        type: 'drum_fill',
        intensity: 0.8,
        durationMs: 360,
      });
    }

    const warningT = region.startMs - CHORUS_WARNING_LEAD_MS;
    if (warningT >= 0 && !chorusWarningTimes.has(warningT)) {
      chorusWarningTimes.add(warningT);
      events.push({
        t: warningT,
        type: 'chorus_warning',
        intensity: 0.6,
        durationMs: 240,
      });
    }
    const eAt = energyAt(energy, region.startMs);
    events.push({
      t: region.startMs,
      type: 'chorus',
      intensity: clampIntensity(0.85 + eAt * 0.15),
      durationMs: 280,
    });
  }

  if (input.stemAnalysis) {
    events.push(...hapticEventsFromStemAnalysis(input.stemAnalysis));
  } else {
    let lastBassT = -Infinity;
    for (const beat of beats) {
      const eAt = energyAt(energy, beat);
      const inChorus = isInsideRegion(beat, chorusRegions);
      if (!inChorus && eAt < 0.72) continue;
      if (beat - lastBassT < 900) continue;
      events.push({
        t: beat,
        type: 'bass_pulse',
        intensity: clampIntensity(0.45 + eAt * 0.45),
        durationMs: 220,
      });
      lastBassT = beat;
    }
  }

  if (lines.length > 0) {
    const lastEnd = lineEndMs(lines[lines.length - 1], undefined, 3000);
    events.push({
      t: Math.min(lastEnd + 200, durationMs),
      type: 'section_end',
      intensity: 0.4,
      durationMs: 500,
    });
  }

  const sections: SectionMark[] = buildSections(lines, chorusRegions, durationMs);
  const moments = [
    ...buildSensoryMoments({ lines, sections, energy, durationMs }),
    ...(input.stemAnalysis ? momentsFromStemAnalysis(input.stemAnalysis) : []),
  ].sort((a, b) => a.t - b.t || b.intensity - a.intensity);

  events.sort((a, b) => a.t - b.t || eventPriority(b.type) - eventPriority(a.type));
  const shapedEvents = input.stemAnalysis ? coalesceStemBackedEvents(events) : events;
  return {
    events: shapedEvents,
    beats,
    sections,
    energy,
    moments,
    durationMs,
    chorusTimesMs,
    source: input.stemAnalysis?.source ?? 'semantic',
    bpm,
  };
}

function buildSections(
  lines: SyncedLine[],
  chorusRegions: ChorusRegion[],
  durationMs: number,
): SectionMark[] {
  const sections: SectionMark[] = [];
  if (lines.length === 0) return sections;

  const sortedChoruses = [...chorusRegions].sort((a, b) => a.startMs - b.startMs);

  const boundaries: { t: number; isChorusStart: boolean; isChorusEnd: boolean }[] = [];
  for (const c of sortedChoruses) {
    boundaries.push({ t: c.startMs, isChorusStart: true, isChorusEnd: false });
    boundaries.push({ t: c.endMs, isChorusStart: false, isChorusEnd: true });
  }
  boundaries.sort((a, b) => a.t - b.t);

  let cursor = 0;
  let inChorus = false;
  let chorusStart = 0;
  for (const b of boundaries) {
    if (b.isChorusStart) {
      if (!inChorus && b.t > cursor) {
        sections.push({ t: cursor, endMs: b.t, kind: 'verse' });
      }
      inChorus = true;
      chorusStart = b.t;
    } else if (b.isChorusEnd) {
      sections.push({ t: chorusStart, endMs: b.t, kind: 'chorus' });
      inChorus = false;
      cursor = b.t;
    }
  }
  if (!inChorus && cursor < durationMs) {
    sections.push({ t: cursor, endMs: durationMs, kind: 'verse' });
  }
  return sections;
}

export function nearestChorusIn(chorusTimesMs: number[], currentMs: number): number | null {
  const upcoming = chorusTimesMs.filter((t) => t > currentMs + 500);
  if (upcoming.length === 0) return null;
  return upcoming[0] - currentMs;
}

export function getCurrentLineIndex(lines: SyncedLine[], currentMs: number): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startMs <= currentMs) idx = i;
    else break;
  }
  return idx;
}

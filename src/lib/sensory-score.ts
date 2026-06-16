import type {
  EnergyPoint,
  HapticEvent,
  HapticEventType,
  Intensity,
  SectionMark,
  SensoryScore,
  SensoryScoreInput,
  SyncedLine,
} from './types';

const DEFAULT_BPM = 120;
const SUSTAIN_THRESHOLD_MS = 3500;
const PAUSE_GAP_MS = 1800;
const CHORUS_WARNING_LEAD_MS = 8000;
const CHORUS_WINDOW = 3;
const CHORUS_MAX_BLOCK_GAP_MS = 3200;
const MIN_LINES_FOR_CHORUS = 6;

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

export function buildSensoryScore(input: SensoryScoreInput): SensoryScore {
  const lines = [...input.lines].sort((a, b) => a.startMs - b.startMs);
  const durationMs = computeDurationMs(lines, input.durationMs);
  const bpm = input.bpm ?? DEFAULT_BPM;
  const chorusRegions = detectChoruses(lines);
  const energy = input.energy ?? estimateEnergy(lines, chorusRegions, durationMs);
  const beats = generateBeats(lines, bpm, durationMs);

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

  events.sort((a, b) => a.t - b.t);
  return { events, beats, sections, energy, durationMs, chorusTimesMs };
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

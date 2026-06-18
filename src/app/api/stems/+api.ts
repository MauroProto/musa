import {
  DEMO_LYRICS,
  STEM_DEMO_FALLBACK_LINES,
  getSyncedLyrics,
  hasMusixmatchKey,
  isDemoTrack,
} from '../../../lib/api-server';
import { buildSensoryScore } from '../../../lib/sensory-score';
import {
  DANI_CALIFORNIA_STEM_ANALYSIS,
  DANI_CALIFORNIA_TRACK_IDS,
} from '../../../lib/generated/dani-california-stem-analysis';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const trackId = Number(url.searchParams.get('trackId') ?? 0);
  if (!trackId) {
    return json({ error: 'trackId required' }, 400);
  }

  const stemAnalysis = DANI_CALIFORNIA_TRACK_IDS.has(trackId)
    ? DANI_CALIFORNIA_STEM_ANALYSIS
    : undefined;
  let lines = stemAnalysis ? (STEM_DEMO_FALLBACK_LINES[trackId] ?? []) : DEMO_LYRICS[9001];

  if (isDemoTrack(trackId)) {
    lines = DEMO_LYRICS[trackId];
  } else if (hasMusixmatchKey()) {
    const fetched = await getSyncedLyrics(trackId).catch(() => ({
      lines: stemAnalysis ? (STEM_DEMO_FALLBACK_LINES[trackId] ?? []) : DEMO_LYRICS[9001],
      instrumental: false,
    }));
    lines = fetched.lines.length > 0 ? fetched.lines : (stemAnalysis ? (STEM_DEMO_FALLBACK_LINES[trackId] ?? []) : DEMO_LYRICS[9001]);
  }

  const lastStart = lines[lines.length - 1]?.startMs ?? 0;
  const score = buildSensoryScore({
    lines,
    durationMs: stemAnalysis?.durationMs ?? (lastStart > 0 ? lastStart + 4000 : 60000),
    stemAnalysis,
  });

  return json({
    energy: score.energy,
    beats: score.beats,
    durationMs: score.durationMs,
    bpm: score.bpm,
    source: score.source,
    stemAnalysis,
  });
}

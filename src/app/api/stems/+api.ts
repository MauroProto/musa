import {
  STEM_DEMO_FALLBACK_LINES,
  getSyncedLyrics,
  hasMusixmatchKey,
} from '../../../lib/api-server';
import { buildSensoryScore } from '../../../lib/sensory-score';
import { getStemDemoAnalysis } from '../../../lib/stem-demo-analyses';

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

  const stemAnalysis = getStemDemoAnalysis(trackId);
  let lines: import('../../../lib/types').SyncedLine[] = stemAnalysis
    ? (STEM_DEMO_FALLBACK_LINES[trackId] ?? [])
    : [];

  if (hasMusixmatchKey()) {
    const fetched = await getSyncedLyrics(trackId).catch(() => ({
      lines: stemAnalysis ? (STEM_DEMO_FALLBACK_LINES[trackId] ?? []) : [],
      instrumental: false,
    }));
    lines =
      fetched.lines.length > 0
        ? fetched.lines
        : stemAnalysis
          ? (STEM_DEMO_FALLBACK_LINES[trackId] ?? [])
          : [];
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

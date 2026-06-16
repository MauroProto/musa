import {
  DEMO_LYRICS,
  getSyncedLyrics,
  hasMusixmatchKey,
  isDemoTrack,
} from '../../../lib/api-server';
import { buildSensoryScore } from '../../../lib/sensory-score';

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

  let lines = DEMO_LYRICS[9001];
  const source: 'lalal' | 'estimated' = 'estimated';

  if (isDemoTrack(trackId)) {
    lines = DEMO_LYRICS[trackId];
  } else if (hasMusixmatchKey()) {
    const fetched = await getSyncedLyrics(trackId).catch(() => ({
      lines: DEMO_LYRICS[9001],
      instrumental: false,
    }));
    lines = fetched.lines.length > 0 ? fetched.lines : DEMO_LYRICS[9001];
  }

  const lastStart = lines[lines.length - 1]?.startMs ?? 0;
  const score = buildSensoryScore({
    lines,
    durationMs: lastStart > 0 ? lastStart + 4000 : 60000,
  });

  return json({
    energy: score.energy,
    beats: score.beats,
    durationMs: score.durationMs,
    source,
  });
}

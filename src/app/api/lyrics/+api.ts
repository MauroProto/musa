import {
  DEMO_LYRICS,
  STEM_DEMO_FALLBACK_LINES,
  getSyncedLyrics,
  hasMusixmatchKey,
  isDemoTrack,
} from '../../../lib/api-server';
import { isStemDemoTrack } from '../../../lib/demo-score-tracks';

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

  if (isDemoTrack(trackId)) {
    return json({ lines: DEMO_LYRICS[trackId], source: 'fixtures', instrumental: false });
  }

  if (!hasMusixmatchKey()) {
    if (isStemDemoTrack(trackId)) {
      return json({
        lines: STEM_DEMO_FALLBACK_LINES[trackId] ?? [],
        source: 'stem-demo',
        fallback: true,
        instrumental: false,
      });
    }
    return json({
      lines: DEMO_LYRICS[9001],
      source: 'fixtures',
      fallback: true,
      instrumental: false,
    });
  }

  try {
    const { lines, instrumental } = await getSyncedLyrics(trackId);
    return json({ lines, source: 'musixmatch', instrumental });
  } catch (err) {
    if (isStemDemoTrack(trackId)) {
      return json(
        {
          lines: STEM_DEMO_FALLBACK_LINES[trackId] ?? [],
          source: 'stem-demo',
          fallback: true,
          error: err instanceof Error ? err.message : 'lyrics failed',
        },
        200,
      );
    }
    return json(
      {
        lines: DEMO_LYRICS[9001],
        source: 'fixtures',
        fallback: true,
        error: err instanceof Error ? err.message : 'lyrics failed',
      },
      200,
    );
  }
}

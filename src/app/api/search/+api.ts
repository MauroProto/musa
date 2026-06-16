import { DEMO_TRACKS, hasMusixmatchKey, searchTracks as mxSearch } from '../../../lib/api-server';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  if (!q) {
    return json({ tracks: [], source: 'empty' });
  }

  if (!hasMusixmatchKey()) {
    const tracks = DEMO_TRACKS.filter((t) =>
      `${t.title} ${t.artist}`.toLowerCase().includes(q.toLowerCase()),
    );
    return json({ tracks, source: 'fixtures' });
  }

  try {
    const tracks = await mxSearch(q);
    return json({ tracks, source: 'musixmatch' });
  } catch (err) {
    return json(
      {
        tracks: DEMO_TRACKS,
        source: 'fixtures',
        error: err instanceof Error ? err.message : 'search failed',
      },
      200,
    );
  }
}

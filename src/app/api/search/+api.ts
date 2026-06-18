import { DEMO_TRACKS, hasMusixmatchKey, searchDemoTracks, searchTracks as mxSearch } from '../../../lib/api-server';
import type { Track } from '../../../lib/types';

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
    const tracks = searchDemoTracks(q);
    return json({ tracks, source: 'fixtures' });
  }

  try {
    const tracks = mergeTracks(searchDemoTracks(q), await mxSearch(q));
    return json({ tracks, source: tracks.some((track) => searchDemoTracks(q).some((demo) => demo.trackId === track.trackId)) ? 'demo+musixmatch' : 'musixmatch' });
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

function mergeTracks(priority: Track[], rest: Track[]): Track[] {
  const seen = new Set<number>();
  const merged: Track[] = [];
  for (const track of [...priority, ...rest]) {
    if (seen.has(track.trackId)) continue;
    seen.add(track.trackId);
    merged.push(track);
  }
  return merged;
}

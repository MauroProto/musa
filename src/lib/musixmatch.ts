import type { SyncedLine, Track } from './types';

const MX_BASE =
  process.env.EXPO_PUBLIC_MUSIXMATCH_BASE_URL ??
  process.env.MUSIXMATCH_BASE_URL ??
  'https://api.musixmatch.com/ws/1.1';

function apiKey(): string | undefined {
  return process.env.MUSIXMATCH_API_KEY ?? process.env.EXPO_PUBLIC_MUSIXMATCH_API_KEY;
}

export function hasMusixmatchKey(): boolean {
  return Boolean(apiKey());
}

type Json = Record<string, unknown>;

async function mxGet(pathname: string, params: Record<string, string | number>): Promise<Json> {
  const key = apiKey();
  if (!key) {
    throw new Error('MUSIXMATCH_API_KEY is not configured on the server.');
  }
  const url = new URL(`${MX_BASE}/${pathname}`);
  const qp = new URLSearchParams({
    apikey: key,
    app_id: 'musa',
    format: 'json',
  });
  for (const [k, v] of Object.entries(params)) qp.set(k, String(v));
  url.search = qp.toString();

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Musixmatch ${pathname} HTTP ${res.status}`);
  }
  const json = (await res.json()) as { message?: Json };
  const message = json.message ?? {};
  const header = (message.header ?? {}) as Json;
  const statusCode = Number(header.status_code ?? 0);
  if (statusCode !== 0 && statusCode !== 200) {
    throw new Error(`Musixmatch ${pathname} status ${statusCode}`);
  }
  return (message.body ?? {}) as Json;
}

export function parseLrc(lrc: string): SyncedLine[] {
  const lines: SyncedLine[] = [];
  const re = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  for (const raw of lrc.split(/\r?\n/)) {
    const text = raw.replace(re, '').trim();
    re.lastIndex = 0;
    const stamps: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw))) {
      const min = Number(m[1]);
      const sec = Number(m[2]);
      const fracStr = m[3] ?? '0';
      const frac = Number(fracStr.padEnd(3, '0').slice(0, 3));
      stamps.push(((min * 60 + sec) * 1000) + frac);
    }
    if (stamps.length === 0) continue;
    for (const startMs of stamps) {
      lines.push({ startMs, text });
    }
  }
  lines.sort((a, b) => a.startMs - b.startMs);
  for (let i = 0; i < lines.length; i++) {
    const next = lines[i + 1];
    if (next && (!lines[i].endMs || lines[i].endMs! <= lines[i].startMs)) {
      lines[i].endMs = next.startMs;
    }
  }
  return lines;
}

function mapTrack(t: Json): Track {
  const trackId = Number(t.track_id);
  return {
    trackId,
    title: String(t.track_name ?? ''),
    artist: String(t.artist_name ?? ''),
    album: t.album_name ? String(t.album_name) : undefined,
    artworkUrl: (t.album_coverart_100x100 ?? t.album_coverart_350x350 ?? t.track_image ?? undefined) as
      | string
      | undefined,
    durationMs: t.track_length ? Number(t.track_length) * 1000 : undefined,
    hasSubtitles: Boolean(t.has_subtitles && Number(t.has_subtitles) >= 1),
    instrumental: Boolean(Number(t.instrumental ?? 0)),
  };
}

export async function searchTracks(query: string, pageSize = 8): Promise<Track[]> {
  const body = await mxGet('track.search', {
    q: query,
    page: 1,
    page_size: pageSize,
    s_track_rating: 'desc',
    f_subtitle_length: 1,
    f_has_subtitle: 1,
  });
  const list = ((body.track_list ?? []) as Json[]).map((i) => (i.track ?? {}) as Json);
  return list.map(mapTrack).filter((t) => t.trackId > 0);
}

export async function getTrackById(trackId: number): Promise<Track> {
  const body = await mxGet('track.get', { track_id: trackId });
  return mapTrack((body.track ?? {}) as Json);
}

export async function getSyncedLyrics(
  trackId: number,
): Promise<{ lines: SyncedLine[]; raw?: string; instrumental: boolean }> {
  try {
    const body = await mxGet('track.subtitle.get', {
      track_id: trackId,
      subtitle_format: 'lrc',
    });
    const subtitle = (body.subtitle ?? {}) as Json;
    const raw = (subtitle.subtitle_body ?? '') as string;
    if (!raw) {
      return { lines: [], instrumental: false };
    }
    return { lines: parseLrc(raw), raw, instrumental: false };
  } catch {
    const track = await getTrackById(trackId).catch(() => null);
    return { lines: [], instrumental: Boolean(track?.instrumental) };
  }
}

export async function getPlainLyrics(trackId: number): Promise<string | null> {
  try {
    const body = await mxGet('track.lyrics.get', { track_id: trackId });
    const lyrics = (body.lyrics ?? {}) as Json;
    return (lyrics.lyrics_body ?? null) as string | null;
  } catch {
    return null;
  }
}

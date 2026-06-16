import { Platform } from 'react-native';
import type { EnergyPoint, SyncedLine, Track } from './types';
import { DEMO_LYRICS, DEMO_TRACKS, isDemoTrack } from './fixtures';

function apiBase(): string {
  if (Platform.OS === 'web') return '';
  return process.env.EXPO_PUBLIC_API_BASE ?? '';
}

async function safeFetch(path: string, init?: RequestInit, timeoutMs = 8000): Promise<Response | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(path, { ...init, signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch {
    return null;
  }
}

export async function searchTracksClient(q: string): Promise<{ tracks: Track[]; source: string }> {
  const res = await safeFetch(`${apiBase()}/api/search?q=${encodeURIComponent(q)}`);
  if (res && res.ok) {
    const data = (await res.json()) as { tracks?: Track[]; source?: string };
    if (data.tracks) return { tracks: data.tracks, source: data.source ?? 'api' };
  }
  const tracks = DEMO_TRACKS.filter((t) =>
    `${t.title} ${t.artist}`.toLowerCase().includes(q.toLowerCase()),
  );
  return { tracks: tracks.length ? tracks : DEMO_TRACKS, source: 'fixtures' };
}

export async function getLyricsClient(
  trackId: number,
): Promise<{ lines: SyncedLine[]; source: string; instrumental?: boolean }> {
  if (isDemoTrack(trackId)) {
    return { lines: DEMO_LYRICS[trackId], source: 'fixtures' };
  }
  const res = await safeFetch(`${apiBase()}/api/lyrics?trackId=${trackId}`);
  if (res && res.ok) {
    const data = (await res.json()) as { lines?: SyncedLine[]; source?: string; instrumental?: boolean };
    if (data.lines) return { lines: data.lines, source: data.source ?? 'api', instrumental: data.instrumental };
  }
  return { lines: DEMO_LYRICS[9001], source: 'fixtures' };
}

export async function getStemsClient(trackId: number): Promise<{
  energy: EnergyPoint[];
  beats: number[];
  durationMs: number;
  source: string;
} | null> {
  const res = await safeFetch(`${apiBase()}/api/stems?trackId=${trackId}`);
  if (res && res.ok) {
    return (await res.json()) as {
      energy: EnergyPoint[];
      beats: number[];
      durationMs: number;
      source: string;
    };
  }
  return null;
}

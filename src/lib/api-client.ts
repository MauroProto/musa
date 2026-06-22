import { Platform } from 'react-native';
import type { EnergyPoint, StemAnalysis, SyncedLine, Track } from './types';
import { DEMO_TRACKS, searchDemoTracks } from './fixtures';
import { isStemDemoTrack } from './demo-score-tracks';
import { fallbackSensoryCaptionsForTrack } from './demo-guided';
import { fallbackLiveCaptionsForTrack } from './live-shows';
import { getStemDemoAnalysis } from './stem-demo-analyses';

function apiBase(): string {
  if (Platform.OS === 'web') return '';
  return process.env.EXPO_PUBLIC_API_BASE ?? '';
}

function usesLocalStemDemoData(trackId: number): boolean {
  return Platform.OS !== 'web' && isStemDemoTrack(trackId);
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
  const tracks = searchDemoTracks(q);
  return { tracks: tracks.length ? tracks : DEMO_TRACKS, source: 'fixtures' };
}

export async function getLyricsClient(
  trackId: number,
): Promise<{ lines: SyncedLine[]; source: string; instrumental?: boolean }> {
  const res = await safeFetch(`${apiBase()}/api/lyrics?trackId=${trackId}`);
  if (res && res.ok) {
    const data = (await res.json()) as { lines?: SyncedLine[]; source?: string; instrumental?: boolean };
    if (data.lines) return { lines: data.lines, source: data.source ?? 'api', instrumental: data.instrumental };
  }
  if (isStemDemoTrack(trackId)) {
    return { lines: fallbackSensoryCaptionsForTrack(trackId), source: 'stem-demo' };
  }
  const liveCaptions = fallbackLiveCaptionsForTrack(trackId);
  if (liveCaptions.length > 0) {
    return { lines: liveCaptions, source: 'live-sim' };
  }
  return { lines: [], source: 'none' };
}

export async function getStemsClient(trackId: number): Promise<{
  energy: EnergyPoint[];
  beats: number[];
  durationMs: number;
  bpm?: number;
  source: string;
  stemAnalysis?: StemAnalysis;
} | null> {
  if (usesLocalStemDemoData(trackId)) {
    const stemAnalysis = getStemDemoAnalysis(trackId);
    if (stemAnalysis) {
      return {
        energy: [],
        beats: [],
        durationMs: stemAnalysis.durationMs ?? 60000,
        bpm: stemAnalysis.bpm,
        source: 'lalal-local',
        stemAnalysis,
      };
    }
  }
  const res = await safeFetch(`${apiBase()}/api/stems?trackId=${trackId}`);
  if (res && res.ok) {
    return (await res.json()) as {
      energy: EnergyPoint[];
      beats: number[];
      durationMs: number;
      bpm?: number;
      source: string;
      stemAnalysis?: StemAnalysis;
    };
  }
  if (isStemDemoTrack(trackId)) {
    const stemAnalysis = getStemDemoAnalysis(trackId);
    if (stemAnalysis) {
      return {
        energy: [],
        beats: [],
        durationMs: stemAnalysis.durationMs ?? 60000,
        bpm: stemAnalysis.bpm,
        source: 'lalal-local',
        stemAnalysis,
      };
    }
  }
  return null;
}

/**
 * MUSA — server-only mapping from trackId to LALAL stem audio files on disk.
 *
 * The stem MP3s are gitignored (copyrighted inputs), so this module only
 * resolves files that exist locally on the demo machine. The /api/audio route
 * streams them on demand; nothing is bundled into the app.
 *
 * SERVER-ONLY: never import from client code.
 */
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { DANI_CALIFORNIA_TRACK_IDS } from './generated/dani-california-stem-analysis';

export type StemAudioKind = 'bass' | 'drums' | 'guitar' | 'vocals' | 'no_vocals';

const STEM_FILE_MARKERS: Record<StemAudioKind, string> = {
  bass: '_bass_',
  drums: '_drum_',
  guitar: '_electric_guitar_',
  vocals: '_vocals_',
  no_vocals: '_no_vocals_',
};

const SUPPORTED_TRACK_IDS = new Set<number>(DANI_CALIFORNIA_TRACK_IDS);

function assetsDir(): string {
  return path.join(process.cwd(), 'assets', 'lalalai');
}

function findStemFile(dir: string, marker: string): string | null {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return null;
  }
  return entries.find((f) => f.includes(marker) && f.endsWith('.mp3')) ?? null;
}

export function hasStemAudio(trackId: number): boolean {
  if (!SUPPORTED_TRACK_IDS.has(trackId)) return false;
  const dir = assetsDir();
  return Object.values(STEM_FILE_MARKERS).every((marker) => findStemFile(dir, marker) !== null);
}

export function resolveStemPath(trackId: number, stem: StemAudioKind): string | null {
  if (!SUPPORTED_TRACK_IDS.has(trackId)) return null;
  const dir = assetsDir();
  const file = findStemFile(dir, STEM_FILE_MARKERS[stem]);
  if (!file) return null;
  return path.join(dir, file);
}

export function stemFileSize(filePath: string): number {
  try {
    return statSync(filePath).size;
  } catch {
    return 0;
  }
}

export const SUPPORTED_STEM_KINDS: StemAudioKind[] = ['bass', 'drums', 'guitar', 'vocals', 'no_vocals'];

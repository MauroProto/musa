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
import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID, STEM_DEMO_TRACK_IDS } from './demo-score-tracks';

export type StemAudioKind = 'bass' | 'drums' | 'guitar' | 'vocals' | 'no_vocals';

type StemAssetConfig = {
  relativeDir: string;
  markers: Record<StemAudioKind, string>;
};

const STEM_ASSET_CONFIGS: Record<number, StemAssetConfig> = {
  [DANI_CALIFORNIA_TRACK_ID]: {
    relativeDir: '',
    markers: {
      bass: '_bass_',
      drums: '_drum_',
      guitar: '_electric_guitar_',
      vocals: '_vocals_',
      no_vocals: '_no_vocals_',
    },
  },
  [ORDINARY_TRACK_ID]: {
    relativeDir: 'ordinary',
    markers: {
      // Ordinary has no separated bass stem. Use strings as the body/low layer.
      bass: '_strings_split_by_lalalai',
      drums: '_drum_split_by_lalalai',
      guitar: '_acoustic_guitar_split_by_lalalai',
      vocals: '_vocals_split_by_lalalai',
      no_vocals: '_no_vocals_split_by_lalalai',
    },
  },
};

const SUPPORTED_TRACK_IDS = new Set<number>(STEM_DEMO_TRACK_IDS);

function assetsDir(config: StemAssetConfig): string {
  return path.join(process.cwd(), 'assets', 'lalalai', config.relativeDir);
}

function findStemFile(dir: string, marker: string): string | null {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return null;
  }
  const candidates = entries.filter((f) => f.includes(marker) && f.endsWith('.mp3'));
  if (marker.startsWith('_no_')) return candidates[0] ?? null;
  return candidates.find((f) => !f.includes('_no_')) ?? candidates[0] ?? null;
}

function configForTrack(trackId: number): StemAssetConfig | null {
  if (!SUPPORTED_TRACK_IDS.has(trackId)) return null;
  return STEM_ASSET_CONFIGS[trackId] ?? null;
}

export function hasStemAudio(trackId: number): boolean {
  const config = configForTrack(trackId);
  if (!config) return false;
  const dir = assetsDir(config);
  return Object.values(config.markers).every((marker) => findStemFile(dir, marker) !== null);
}

export function resolveStemPath(trackId: number, stem: StemAudioKind): string | null {
  const config = configForTrack(trackId);
  if (!config) return null;
  const dir = assetsDir(config);
  const file = findStemFile(dir, config.markers[stem]);
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

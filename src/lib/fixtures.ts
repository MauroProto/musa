import type { SyncedLine, Track } from './types';
import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from './demo-score-tracks.ts';

/**
 * Curated demo scores. Both are real songs with pre-separated LALAL.AI stems,
 * so their haptic score is driven by genuine bass / drums / guitar / vocal
 * envelopes — not a synthetic estimate.
 */
export const DEMO_TRACKS: Track[] = [
  {
    trackId: DANI_CALIFORNIA_TRACK_ID,
    title: 'Dani California',
    artist: 'Red Hot Chili Peppers',
    hasSubtitles: true,
    instrumental: false,
    durationMs: 281000,
  },
  {
    trackId: ORDINARY_TRACK_ID,
    title: 'Ordinary',
    artist: 'Alex Warren',
    hasSubtitles: true,
    instrumental: false,
    durationMs: 187000,
  },
];

/**
 * Sensory captions shown when live lyrics can't be loaded for a stem demo
 * (e.g. offline). They describe the tactile map rather than reproduce lyrics.
 */
export const STEM_DEMO_FALLBACK_LINES: Record<number, SyncedLine[]> = {
  [DANI_CALIFORNIA_TRACK_ID]: [
    { startMs: 0, text: 'Stem score ready' },
    { startMs: 8000, text: 'Bass and drums lead the tactile map' },
    { startMs: 18000, text: 'Live lyrics load from Musixmatch' },
  ],
  [ORDINARY_TRACK_ID]: [
    { startMs: 0, text: 'Acoustic pulse opens the space' },
    { startMs: 18000, text: 'Close vocal phrase comes forward' },
    { startMs: 39000, text: 'First lift lands across the body' },
    { startMs: 76000, text: 'Strings begin the long rise' },
    { startMs: 112000, text: 'Drums widen the final build' },
    { startMs: 146000, text: 'Last lift holds, then releases' },
  ],
};

export function searchDemoTracks(query: string): Track[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return DEMO_TRACKS.filter((track) =>
    `${track.title} ${track.artist} ${track.album ?? ''}`.toLowerCase().includes(q),
  );
}

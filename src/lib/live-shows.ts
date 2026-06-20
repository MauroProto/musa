import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from './demo-score-tracks.ts';

/**
 * MUSA Live — concert data model (mock).
 *
 * A {@link Concert} is a published show whose {@link SetlistEntry | setlist} maps
 * each performed song to one of our real stem-backed demo scores, so the haptics
 * felt during the live experience are genuine — not synthetic.
 *
 * Musicathon rule: only `trackId`s are stored here (no lyrics).
 */

export type SetlistEntry = {
  /** Real, stem-backed track whose sensory score drives the haptics. */
  trackId: number;
  title: string;
  artist: string;
  /** Full song length (ms) — shown in the setlist, informational only. */
  durationMs: number;
  /**
   * How long this song runs in the live demo before auto-advancing (ms).
   * Keeps the simulated concert to a few minutes instead of the full songs.
   */
  previewMs: number;
  /** Quiet gap after the song (banter / tuning) before the next one (ms). */
  gapMs: number;
  /** Optional short note shown to the audience. */
  note?: string;
};

export type ConcertStatus = 'live' | 'upcoming' | 'ended';

export type Concert = {
  id: string;
  /** Event / lineup name (a festival bill can carry multiple artists). */
  name: string;
  subtitle: string;
  venue: string;
  city: string;
  /** Human-friendly date/time label. */
  when: string;
  status: ConcertStatus;
  joinCode: string;
  setlist: SetlistEntry[];
};

const LANTERN_FIELDS: Concert = {
  id: 'lantern-fields',
  name: 'Lantern Fields Festival',
  subtitle: 'River Stage',
  venue: 'Treasure Island',
  city: 'San Francisco, CA',
  when: 'Live now',
  status: 'live',
  joinCode: 'LANTERN',
  setlist: [
    {
      trackId: ORDINARY_TRACK_ID,
      title: 'Ordinary',
      artist: 'Alex Warren',
      durationMs: 187000,
      previewMs: 46000,
      gapMs: 7000,
      note: 'Opening the River Stage',
    },
    {
      trackId: DANI_CALIFORNIA_TRACK_ID,
      title: 'Dani California',
      artist: 'Red Hot Chili Peppers',
      durationMs: 281000,
      previewMs: 58000,
      gapMs: 0,
      note: 'Headline set',
    },
  ],
};

const NIGHTGARDEN: Concert = {
  id: 'nightgarden-sessions',
  name: 'Nightgarden Sessions',
  subtitle: 'An intimate night',
  venue: 'The Fillmore',
  city: 'San Francisco, CA',
  when: 'Sat, Jun 27 · 8:30 PM',
  status: 'upcoming',
  joinCode: 'GARDEN',
  setlist: [
    {
      trackId: DANI_CALIFORNIA_TRACK_ID,
      title: 'Dani California',
      artist: 'Red Hot Chili Peppers',
      durationMs: 281000,
      previewMs: 58000,
      gapMs: 7000,
    },
    {
      trackId: ORDINARY_TRACK_ID,
      title: 'Ordinary',
      artist: 'Alex Warren',
      durationMs: 187000,
      previewMs: 46000,
      gapMs: 0,
    },
  ],
};

export const LIVE_SHOWS: Concert[] = [LANTERN_FIELDS, NIGHTGARDEN];

export function getShowById(id: string): Concert | null {
  return LIVE_SHOWS.find((show) => show.id === id) ?? null;
}

export function liveShows(): Concert[] {
  return LIVE_SHOWS.filter((show) => show.status === 'live');
}

export function upcomingShows(): Concert[] {
  return LIVE_SHOWS.filter((show) => show.status === 'upcoming');
}

/** Total scheduled run of a concert's previews + gaps, in ms. */
export function showRuntimeMs(show: Concert): number {
  return show.setlist.reduce((sum, entry) => sum + entry.previewMs + entry.gapMs, 0);
}

import { ORDINARY_TRACK_ID } from './demo-score-tracks.ts';
import type { SyncedLine } from './types.ts';

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

type AlexWarrenSong = {
  title: string;
  durationMs: number;
  note: string;
  realTrackId?: number;
};

const LIVE_SIM_TRACK_ID_BASE = 790_000_000;

const ALEX_WARREN_CATALOG: AlexWarrenSong[] = [
  { title: 'PASSENGER', durationMs: 159771, note: 'New opener' },
  { title: 'FEVER DREAM', durationMs: 153430, note: 'High-energy lift' },
  { title: 'FINE PLACE TO DIE', durationMs: 187423, note: 'Dark pulse' },
  { title: 'The Outside', durationMs: 183854, note: 'Wide-room verse' },
  { title: 'First Time On Earth', durationMs: 161053, note: 'Bright vocal push' },
  { title: 'Bloodline (with Jelly Roll)', durationMs: 182008, note: 'Guest-call moment' },
  { title: 'Burning Down', durationMs: 179437, note: 'Percussive build' },
  { title: 'Getaway Car', durationMs: 184406, note: 'Forward motion' },
  { title: 'Who I Am', durationMs: 202358, note: 'Crowd chant pocket' },
  { title: "You Can't Stop This", durationMs: 161105, note: 'Defiant lift' },
  { title: 'On My Mind', durationMs: 189557, note: 'Close vocal pulse' },
  { title: 'Everything', durationMs: 168057, note: 'Warm mid-set release' },
  { title: 'Carry You Home', durationMs: 166881, note: 'Hands-up chorus' },
  { title: 'Heaven Without You', durationMs: 202435, note: 'Long emotional swell' },
  { title: 'Before You Leave Me', durationMs: 176178, note: 'Soft-to-strong turn' },
  { title: 'Troubled Waters', durationMs: 197775, note: 'Rolling body cue' },
  { title: 'Catch My Breath', durationMs: 192892, note: 'Breath and release' },
  { title: 'Never Be Far', durationMs: 197930, note: 'Phone-to-chest moment' },
  { title: 'Ordinary', durationMs: 186964, note: 'Stem-backed feature', realTrackId: ORDINARY_TRACK_ID },
  { title: 'Save You a Seat', durationMs: 197574, note: 'Quiet dedication' },
  { title: 'Chasing Shadows', durationMs: 164028, note: 'Shadow texture' },
  { title: 'Yard Sale', durationMs: 174197, note: 'Stripped-down reset' },
  { title: 'Give You Love', durationMs: 183400, note: 'Early catalog nod' },
  { title: 'Headlights', durationMs: 173213, note: 'Night-drive pulse' },
  { title: 'Change Your Mind', durationMs: 174406, note: 'Small-room bridge' },
  { title: 'How Could You (Be OK)', durationMs: 197595, note: 'Emotional drop' },
  { title: 'Remember Me Happy', durationMs: 141097, note: 'Memory cue' },
  { title: 'Screaming Underwater', durationMs: 146093, note: 'Tension texture' },
  { title: 'One More I Love You', durationMs: 216935, note: 'Late-set ballad' },
  { title: "You'll Be Alright, Kid Eternity", durationMs: 189554, note: 'Encore rise' },
  { title: "You'll Be Alright, Kid", durationMs: 149446, note: 'Final release' },
];

function simulatedTrackId(index: number): number {
  return LIVE_SIM_TRACK_ID_BASE + index + 1;
}

function previewLength(durationMs: number, index: number): number {
  const base = Math.round(durationMs * 0.17);
  const wave = (index % 5) * 1800;
  return Math.min(46000, Math.max(24000, base + wave));
}

function alexWarrenSetlist(): SetlistEntry[] {
  return ALEX_WARREN_CATALOG.map((song, index) => ({
    trackId: song.realTrackId ?? simulatedTrackId(index),
    title: song.title,
    artist: 'Alex Warren',
    durationMs: song.durationMs,
    previewMs: previewLength(song.durationMs, index),
    gapMs: index === ALEX_WARREN_CATALOG.length - 1 ? 0 : 6500,
    note: song.realTrackId ? `${song.note} · real stem score` : `${song.note} · simulated haptic score`,
  }));
}

export function fallbackLiveCaptionsForTrack(trackId: number): SyncedLine[] {
  const song = ALEX_WARREN_CATALOG.find((item, index) => !item.realTrackId && simulatedTrackId(index) === trackId);
  if (!song) return [];
  const anchors = [0.03, 0.18, 0.38, 0.62, 0.82].map((ratio) => Math.round(song.durationMs * ratio));
  return [
    { startMs: anchors[0], text: 'Stage lights drop into the first pulse' },
    { startMs: anchors[1], text: 'Voice moves close while the room settles' },
    { startMs: anchors[2], text: 'Body layer opens under the melody' },
    { startMs: anchors[3], text: 'Drums widen and the crowd lifts' },
    { startMs: anchors[4], text: 'Final swell resolves through the phone' },
  ];
}

export function featuredLiveEntryIndex(show: Concert): number {
  const ordinaryIndex = show.setlist.findIndex((entry) => entry.trackId === ORDINARY_TRACK_ID);
  return ordinaryIndex >= 0 ? ordinaryIndex : 0;
}

export const LIVE_SHOWS: Concert[] = [
  {
    id: 'alex-warren-catalog-live',
    name: 'Alex Warren Live',
    subtitle: 'Full catalog haptic simulation',
    venue: 'MUSA Virtual Arena',
    city: 'Online',
    when: 'Live now',
    status: 'live',
    joinCode: 'ALEX',
    setlist: alexWarrenSetlist(),
  },
];

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

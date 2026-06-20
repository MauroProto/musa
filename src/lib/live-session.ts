import type { Concert, SetlistEntry } from './live-shows.ts';

/**
 * MUSA Live — the concert clock.
 *
 * A pure, deterministic state machine that models a live show as it progresses
 * through its setlist. It carries no timing of its own: the runtime store anchors
 * wall-clock time and calls these transitions. Keep this module pure (no React,
 * no platform APIs, no timers) and covered by tests.
 *
 * Lifecycle:
 *   lobby ──begin──▶ live(0) ──songEnded──▶ intermission ──advance──▶ live(1)
 *                                   └─(last song)─▶ ended
 */

export type LiveDriveMode = 'auto' | 'host';

export type LiveStatus = 'lobby' | 'live' | 'intermission' | 'ended';

export type LiveSession = {
  showId: string;
  mode: LiveDriveMode;
  status: LiveStatus;
  /** Index of the current song (while live / intermission). */
  entryIndex: number;
};

export function createSession(show: Concert, mode: LiveDriveMode): LiveSession {
  return { showId: show.id, mode, status: 'lobby', entryIndex: 0 };
}

/** Start the show from the top. */
export function begin(session: LiveSession): LiveSession {
  if (session.status === 'ended') return session;
  return { ...session, status: 'live', entryIndex: 0 };
}

/** Jump straight to a specific song (host driving the console). */
export function startEntry(session: LiveSession, show: Concert, index: number): LiveSession {
  if (index < 0 || index >= show.setlist.length) return session;
  return { ...session, status: 'live', entryIndex: index };
}

/**
 * The current song finished. Move to an intermission, or end the show if this
 * was the last song. `entryIndex` stays put — {@link advance} increments it.
 */
export function songEnded(session: LiveSession, show: Concert): LiveSession {
  if (session.status !== 'live') return session;
  const isLast = session.entryIndex >= show.setlist.length - 1;
  return { ...session, status: isLast ? 'ended' : 'intermission' };
}

/** Intermission over → start the next song (or end if none remain). */
export function advance(session: LiveSession, show: Concert): LiveSession {
  const next = session.entryIndex + 1;
  if (next >= show.setlist.length) return { ...session, status: 'ended' };
  return { ...session, status: 'live', entryIndex: next };
}

export function finish(session: LiveSession): LiveSession {
  return { ...session, status: 'ended' };
}

export function setMode(session: LiveSession, mode: LiveDriveMode): LiveSession {
  return { ...session, mode };
}

/** The song currently being performed, or null between songs / before start. */
export function activeEntry(session: LiveSession, show: Concert): SetlistEntry | null {
  if (session.status !== 'live') return null;
  return show.setlist[session.entryIndex] ?? null;
}

/** The next song up (during a song or an intermission), or null if none. */
export function nextEntry(session: LiveSession, show: Concert): SetlistEntry | null {
  if (session.status === 'lobby') return show.setlist[0] ?? null;
  if (session.status === 'ended') return null;
  return show.setlist[session.entryIndex + 1] ?? null;
}

export function isShowOver(session: LiveSession): boolean {
  return session.status === 'ended';
}

/** "2 / 5" style progress through the setlist. */
export function progressLabel(session: LiveSession, show: Concert): string {
  const count = show.setlist.length;
  if (session.status === 'lobby') return `0 / ${count}`;
  if (session.status === 'ended') return `${count} / ${count}`;
  return `${Math.min(session.entryIndex + 1, count)} / ${count}`;
}

/**
 * Per-entry performance state, for rendering the setlist in the lobby and the
 * host console (done / now / next / upcoming).
 */
export type EntryPlayState = 'done' | 'now' | 'next' | 'upcoming';

export function entryPlayState(session: LiveSession, index: number): EntryPlayState {
  if (session.status === 'ended') return 'done';
  if (session.status === 'lobby') return index === 0 ? 'next' : 'upcoming';
  if (index < session.entryIndex) return 'done';
  if (index === session.entryIndex) return session.status === 'intermission' ? 'done' : 'now';
  if (index === session.entryIndex + 1) return 'next';
  return 'upcoming';
}

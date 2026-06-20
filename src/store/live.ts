import { create } from 'zustand';
import type { Concert } from '../lib/live-shows';
import {
  advance as advanceSession,
  begin as beginSession,
  createSession,
  finish as finishSession,
  setMode as setSessionMode,
  songEnded as songEndedSession,
  startEntry as startEntrySession,
  type LiveDriveMode,
  type LiveSession,
} from '../lib/live-session';

/**
 * MUSA Live — runtime session store.
 *
 * Holds the single live session shared between the attendee (pocket) view and
 * the mocked artist (host) console. It anchors wall-clock timing for the
 * auto-run mode (the intermission gap timer) and delegates every state
 * transition to the pure {@link LiveSession} machine.
 *
 * This store is intentionally ephemeral — nothing is persisted.
 */

type LiveStore = {
  show: Concert | null;
  session: LiveSession | null;
  /** Near-black, low-distraction screen while the phone is pocketed. */
  pocketDim: boolean;

  /** Join a show (idempotent if already joined). Defaults to auto drive. */
  join: (show: Concert, mode?: LiveDriveMode) => void;
  setMode: (mode: LiveDriveMode) => void;
  /** Start the show from the top. */
  begin: () => void;
  /** The active song's preview finished (called by the live runner). */
  reportSongEnded: () => void;
  /** Skip the intermission gap and start the next song now. */
  advance: () => void;
  /** Host: jump straight to a setlist entry. */
  hostStartEntry: (index: number) => void;
  /** End the show. */
  finish: () => void;
  setPocketDim: (v: boolean) => void;
  /** Leave the session and clear any pending timers. */
  leave: () => void;
};

let gapTimer: ReturnType<typeof setTimeout> | null = null;
function clearGapTimer() {
  if (gapTimer) {
    clearTimeout(gapTimer);
    gapTimer = null;
  }
}

export const useLive = create<LiveStore>((set, get) => ({
  show: null,
  session: null,
  pocketDim: false,

  join: (show, mode = 'auto') => {
    const current = get().session;
    if (current && current.showId === show.id) {
      // Already in this show — just make sure the drive mode is up to date.
      set({ show, session: setSessionMode(current, mode) });
      return;
    }
    clearGapTimer();
    set({ show, session: createSession(show, mode), pocketDim: false });
  },

  setMode: (mode) => {
    const { session } = get();
    if (!session) return;
    set({ session: setSessionMode(session, mode) });
  },

  begin: () => {
    const { session } = get();
    if (!session) return;
    clearGapTimer();
    set({ session: beginSession(session) });
  },

  reportSongEnded: () => {
    const { session, show } = get();
    if (!session || !show) return;
    const updated = songEndedSession(session, show);
    set({ session: updated });
    // Auto mode bridges the intermission gap on its own; host mode waits.
    if (updated.status === 'intermission' && updated.mode === 'auto') {
      const gapMs = show.setlist[updated.entryIndex]?.gapMs ?? 6000;
      clearGapTimer();
      gapTimer = setTimeout(() => {
        gapTimer = null;
        const cur = get().session;
        const curShow = get().show;
        if (!cur || !curShow || cur.status !== 'intermission') return;
        set({ session: advanceSession(cur, curShow) });
      }, Math.max(0, gapMs));
    }
  },

  advance: () => {
    const { session, show } = get();
    if (!session || !show) return;
    clearGapTimer();
    set({ session: advanceSession(session, show) });
  },

  hostStartEntry: (index) => {
    const { session, show } = get();
    if (!session || !show) return;
    clearGapTimer();
    set({ session: startEntrySession(session, show, index) });
  },

  finish: () => {
    const { session } = get();
    if (!session) return;
    clearGapTimer();
    set({ session: finishSession(session) });
  },

  setPocketDim: (pocketDim) => set({ pocketDim }),

  leave: () => {
    clearGapTimer();
    set({ show: null, session: null, pocketDim: false });
  },
}));

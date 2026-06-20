import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Concert } from './live-shows.ts';
import {
  activeEntry,
  advance,
  begin,
  createSession,
  entryPlayState,
  finish,
  isShowOver,
  nextEntry,
  progressLabel,
  setMode,
  songEnded,
  startEntry,
} from './live-session.ts';

const SHOW: Concert = {
  id: 'test-show',
  name: 'Test Festival',
  subtitle: 'Stage A',
  venue: 'Venue',
  city: 'City',
  when: 'Live now',
  status: 'live',
  joinCode: 'TEST',
  setlist: [
    { trackId: 1, title: 'One', artist: 'A', durationMs: 200000, previewMs: 40000, gapMs: 5000 },
    { trackId: 2, title: 'Two', artist: 'B', durationMs: 180000, previewMs: 40000, gapMs: 5000 },
  ],
};

test('createSession starts in the lobby at the top of the setlist', () => {
  const s = createSession(SHOW, 'auto');
  assert.equal(s.status, 'lobby');
  assert.equal(s.entryIndex, 0);
  assert.equal(s.mode, 'auto');
  assert.equal(activeEntry(s, SHOW), null);
  assert.equal(nextEntry(s, SHOW)?.trackId, 1);
  assert.equal(progressLabel(s, SHOW), '0 / 2');
});

test('begin moves the lobby into the first live song', () => {
  const s = begin(createSession(SHOW, 'auto'));
  assert.equal(s.status, 'live');
  assert.equal(s.entryIndex, 0);
  assert.equal(activeEntry(s, SHOW)?.trackId, 1);
  assert.equal(nextEntry(s, SHOW)?.trackId, 2);
  assert.equal(progressLabel(s, SHOW), '1 / 2');
});

test('songEnded mid-set goes to intermission, keeping the index', () => {
  const live = begin(createSession(SHOW, 'auto'));
  const inter = songEnded(live, SHOW);
  assert.equal(inter.status, 'intermission');
  assert.equal(inter.entryIndex, 0);
  assert.equal(activeEntry(inter, SHOW), null);
  assert.equal(nextEntry(inter, SHOW)?.trackId, 2);
});

test('advance leaves intermission for the next live song', () => {
  let s = begin(createSession(SHOW, 'auto'));
  s = songEnded(s, SHOW);
  s = advance(s, SHOW);
  assert.equal(s.status, 'live');
  assert.equal(s.entryIndex, 1);
  assert.equal(activeEntry(s, SHOW)?.trackId, 2);
  assert.equal(nextEntry(s, SHOW), null);
});

test('songEnded on the last song ends the show', () => {
  let s = begin(createSession(SHOW, 'auto'));
  s = advance(songEnded(s, SHOW), SHOW); // now on song 2
  s = songEnded(s, SHOW);
  assert.equal(s.status, 'ended');
  assert.equal(isShowOver(s), true);
  assert.equal(activeEntry(s, SHOW), null);
  assert.equal(progressLabel(s, SHOW), '2 / 2');
});

test('host can jump straight to any song with startEntry', () => {
  const s = startEntry(createSession(SHOW, 'host'), SHOW, 1);
  assert.equal(s.status, 'live');
  assert.equal(s.entryIndex, 1);
  assert.equal(activeEntry(s, SHOW)?.trackId, 2);
});

test('startEntry ignores out-of-range indices', () => {
  const base = createSession(SHOW, 'host');
  assert.deepEqual(startEntry(base, SHOW, -1), base);
  assert.deepEqual(startEntry(base, SHOW, 9), base);
});

test('finish ends the show from anywhere; setMode swaps the driver', () => {
  const s = finish(begin(createSession(SHOW, 'auto')));
  assert.equal(s.status, 'ended');
  assert.equal(setMode(createSession(SHOW, 'auto'), 'host').mode, 'host');
});

test('entryPlayState reflects done / now / next / upcoming', () => {
  const lobby = createSession(SHOW, 'auto');
  assert.equal(entryPlayState(lobby, 0), 'next');
  assert.equal(entryPlayState(lobby, 1), 'upcoming');

  const live = begin(lobby);
  assert.equal(entryPlayState(live, 0), 'now');
  assert.equal(entryPlayState(live, 1), 'next');

  const inter = songEnded(live, SHOW);
  assert.equal(entryPlayState(inter, 0), 'done');
  assert.equal(entryPlayState(inter, 1), 'next');

  const ended = finish(live);
  assert.equal(entryPlayState(ended, 0), 'done');
  assert.equal(entryPlayState(ended, 1), 'done');
});

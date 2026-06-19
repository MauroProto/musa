import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID, isStemDemoTrack } from './demo-score-tracks.ts';
import { DEMO_TRACKS, isDemoTrack, searchDemoTracks } from './fixtures.ts';

test('Dani California is listed as a demo score without bundling local lyrics', () => {
  const track = DEMO_TRACKS.find((item) => item.trackId === DANI_CALIFORNIA_TRACK_ID);

  assert.ok(track, 'expected Dani California in demo scores');
  assert.equal(DANI_CALIFORNIA_TRACK_ID, 95574135);
  assert.equal(track.title, 'Dani California');
  assert.equal(track.artist, 'Red Hot Chili Peppers');
  assert.equal(isStemDemoTrack(DANI_CALIFORNIA_TRACK_ID), true);
  assert.equal(isStemDemoTrack(84213309), false, 'Hello by Adele must not receive the Dani stem score');
  assert.equal(isDemoTrack(DANI_CALIFORNIA_TRACK_ID), false);
});

test('searchDemoTracks returns curated Dani score before external search results', () => {
  const tracks = searchDemoTracks('Dani California');

  assert.equal(tracks[0]?.trackId, DANI_CALIFORNIA_TRACK_ID);
});
test('Ordinary is listed as a stem-backed demo score without bundled lyrics', () => {
  const track = DEMO_TRACKS.find((item) => item.trackId === ORDINARY_TRACK_ID);

  assert.ok(track, 'expected Ordinary in demo scores');
  assert.equal(ORDINARY_TRACK_ID, 324489197);
  assert.equal(track.title, 'Ordinary');
  assert.equal(track.artist, 'Alex Warren');
  assert.equal(isStemDemoTrack(ORDINARY_TRACK_ID), true);
  assert.equal(isDemoTrack(ORDINARY_TRACK_ID), false);
  assert.equal(searchDemoTracks('ordinary alex warren')[0]?.trackId, ORDINARY_TRACK_ID);
});

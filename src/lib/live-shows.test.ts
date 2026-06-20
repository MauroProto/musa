import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ORDINARY_TRACK_ID } from './demo-score-tracks.ts';
import {
  fallbackLiveCaptionsForTrack,
  featuredLiveEntryIndex,
  getShowById,
  liveShows,
  showRuntimeMs,
} from './live-shows.ts';

test('live tab offers a full Alex Warren simulated concert', () => {
  const show = getShowById('alex-warren-catalog-live');

  assert.ok(show, 'expected Alex Warren live show');
  assert.equal(show.status, 'live');
  assert.equal(show.name, 'Alex Warren Live');
  assert.equal(show.setlist.length, 31);
  assert.ok(show.setlist.every((entry) => entry.artist === 'Alex Warren'));
  assert.equal(show.setlist.some((entry) => entry.artist === 'Red Hot Chili Peppers'), false);

  const titles = show.setlist.map((entry) => entry.title);
  assert.equal(new Set(titles).size, titles.length, 'setlist should not duplicate song titles');
  assert.deepEqual(titles.slice(0, 3), ['PASSENGER', 'FEVER DREAM', 'FINE PLACE TO DIE']);
  assert.ok(titles.includes('Ordinary'));
  assert.ok(titles.includes('Bloodline (with Jelly Roll)'));
  assert.ok(titles.includes('One More I Love You'));
  assert.ok(titles.includes("You'll Be Alright, Kid"));
});

test('Ordinary keeps the real stem-backed demo id inside the Alex Warren set', () => {
  const show = getShowById('alex-warren-catalog-live');
  const ordinary = show?.setlist.find((entry) => entry.title === 'Ordinary');

  assert.equal(ordinary?.trackId, ORDINARY_TRACK_ID);
});

test('floating show CTA targets Ordinary as the featured haptic entry', () => {
  const show = getShowById('alex-warren-catalog-live');

  assert.ok(show, 'expected Alex Warren live show');
  const index = featuredLiveEntryIndex(show);
  assert.equal(show.setlist[index]?.title, 'Ordinary');
  assert.equal(show.setlist[index]?.trackId, ORDINARY_TRACK_ID);
});

test('simulated Alex Warren live tracks have non-lyric sensory captions', () => {
  const show = getShowById('alex-warren-catalog-live');
  const passenger = show?.setlist.find((entry) => entry.title === 'PASSENGER');

  assert.ok(passenger, 'expected Passenger in the live set');
  const captions = fallbackLiveCaptionsForTrack(passenger.trackId);
  assert.equal(captions.length >= 5, true);
  assert.equal(captions.some((line) => line.text.toLowerCase().includes('passenger')), false);
  assert.equal(captions.some((line) => line.text.toLowerCase().includes('holy water')), false);
});

test('full catalog live show stays short enough for a demo run', () => {
  const show = liveShows()[0];

  assert.equal(show.id, 'alex-warren-catalog-live');
  assert.ok(showRuntimeMs(show) > 12 * 60 * 1000);
  assert.ok(showRuntimeMs(show) < 25 * 60 * 1000);
});

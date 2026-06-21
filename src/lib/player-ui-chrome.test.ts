import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHORUS_COUNTDOWN_CHROME,
  PLAYER_ALBUM_CHIP_CHROME,
  PLAYER_DOCK_CHROME,
  PLAYER_PROGRESS_DOT_CHROME,
  PLAYER_TRANSPORT_CHROME,
  SHOW_TACTILE_DETAILS_TOGGLE,
  SHOW_TACTILE_LAYER_PILL,
} from './player-ui-chrome.ts';

test('tactile status bar does not expose a details/settings toggle', () => {
  assert.equal(SHOW_TACTILE_DETAILS_TOGGLE, false);
});

test('compact tactile status avoids a secondary layer pill', () => {
  assert.equal(SHOW_TACTILE_LAYER_PILL, false);
});

test('player transport uses integrated chrome instead of a raised card', () => {
  assert.equal(PLAYER_DOCK_CHROME.surface, 'integrated');
  assert.equal(PLAYER_DOCK_CHROME.elevation, 'none');
});

test('player transport uses five actions with moment navigation around play', () => {
  assert.equal(PLAYER_TRANSPORT_CHROME.buttonCount, 5);
  assert.deepEqual(PLAYER_TRANSPORT_CHROME.innerActions, ['previous_moment', 'next_moment']);
  assert.deepEqual(PLAYER_TRANSPORT_CHROME.outerActions, ['restart_track', 'replay_moment']);
});

test('player album artwork is visual-only and anchored above the lyrics', () => {
  assert.equal(PLAYER_ALBUM_CHIP_CHROME.visible, true);
  assert.equal(PLAYER_ALBUM_CHIP_CHROME.showCopy, false);
  assert.ok(PLAYER_ALBUM_CHIP_CHROME.mobileSize >= 84);
  assert.ok(PLAYER_ALBUM_CHIP_CHROME.mobileSize <= 92);
  assert.equal(PLAYER_ALBUM_CHIP_CHROME.radius, 0);
  assert.equal(PLAYER_ALBUM_CHIP_CHROME.position, 'upper-lyrics');
});

test('chorus countdown stays inline above tactile focus without a pill or dot', () => {
  assert.equal(CHORUS_COUNTDOWN_CHROME.position, 'above-tactile-status');
  assert.equal(CHORUS_COUNTDOWN_CHROME.surface, 'inline');
  assert.equal(CHORUS_COUNTDOWN_CHROME.dotVisible, false);
});

test('player progress dot is intentionally more visible', () => {
  assert.equal(PLAYER_PROGRESS_DOT_CHROME.color, '#D30000');
  assert.ok(PLAYER_PROGRESS_DOT_CHROME.size >= 9);
});

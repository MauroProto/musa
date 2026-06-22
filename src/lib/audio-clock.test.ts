import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audioClockMs } from './audio-clock.ts';

test('audioClockMs keeps using currentTime while playback is requested but native audio is waiting', () => {
  assert.equal(
    audioClockMs({ isLoaded: true, currentTime: 12.5, playing: false, playbackRequested: true }),
    12500,
  );
});

test('audioClockMs returns null when paused by user or not loaded', () => {
  assert.equal(
    audioClockMs({ isLoaded: true, currentTime: 12.5, playing: false, playbackRequested: false }),
    null,
  );
  assert.equal(
    audioClockMs({ isLoaded: false, currentTime: 12.5, playing: true, playbackRequested: true }),
    null,
  );
});

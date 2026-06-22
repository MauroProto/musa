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

test('audioClockMs ignores native currentTime while a seek is pending', () => {
  assert.equal(
    audioClockMs({ isLoaded: true, currentTime: 120, playing: true, playbackRequested: true, seekPending: true }),
    null,
  );
});

test('audioClockMs ignores an implausible native rewind during playback', () => {
  assert.equal(
    audioClockMs({
      isLoaded: true,
      currentTime: 0.12,
      playing: true,
      playbackRequested: true,
      lastAcceptedMs: 15500,
      maxBackwardJumpMs: 1200,
    }),
    null,
  );
});

test('audioClockMs allows small native clock corrections during playback', () => {
  assert.equal(
    audioClockMs({
      isLoaded: true,
      currentTime: 14.4,
      playing: true,
      playbackRequested: true,
      lastAcceptedMs: 15500,
      maxBackwardJumpMs: 1200,
    }),
    14400,
  );
});

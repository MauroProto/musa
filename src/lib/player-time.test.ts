import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nextMomentMs,
  previousMomentMs,
  replayMomentMs,
  seekByDeltaMs,
  seekRatioToMs,
  seekToMs,
} from './player-time.ts';

test('seekByDeltaMs clamps relative seeking inside duration', () => {
  assert.equal(seekByDeltaMs(10000, 30000, 5000), 15000);
  assert.equal(seekByDeltaMs(10000, 30000, -15000), 0);
  assert.equal(seekByDeltaMs(25000, 30000, 10000), 30000);
});

test('seekRatioToMs maps a scrub ratio to a clamped time', () => {
  assert.equal(seekRatioToMs(0.5, 280000), 140000);
  assert.equal(seekRatioToMs(-0.2, 280000), 0);
  assert.equal(seekRatioToMs(1.4, 280000), 280000);
});

test('seekToMs clamps absolute seek requests', () => {
  assert.equal(seekToMs(42000, 280000), 42000);
  assert.equal(seekToMs(-1, 280000), 0);
  assert.equal(seekToMs(999999, 280000), 280000);
});

test('previousMomentMs jumps to the prior tactile moment with a small grace window', () => {
  const moments = [{ t: 5000 }, { t: 10000 }, { t: 25000 }];

  assert.equal(previousMomentMs(12000, moments), 10000);
  assert.equal(previousMomentMs(10050, moments), 5000);
  assert.equal(previousMomentMs(2000, moments), 0);
});

test('nextMomentMs jumps to the next tactile moment instead of a fixed time skip', () => {
  const moments = [{ t: 5000 }, { t: 10000 }, { t: 25000 }];

  assert.equal(nextMomentMs(9000, moments, 30000), 10000);
  assert.equal(nextMomentMs(10050, moments, 30000), 25000);
  assert.equal(nextMomentMs(26000, moments, 30000), 30000);
});

test('replayMomentMs returns the current tactile moment start when possible', () => {
  const moments = [{ t: 5000 }, { t: 10000 }, { t: 25000 }];

  assert.equal(replayMomentMs(10400, moments), 10000);
  assert.equal(replayMomentMs(3000, moments), 0);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seekByDeltaMs, seekRatioToMs, seekToMs } from './player-time.ts';

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

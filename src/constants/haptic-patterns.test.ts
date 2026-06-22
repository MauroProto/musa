import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HAPTIC_LEGEND } from './haptic-patterns.ts';

test('main pulse preview is strong enough to feel during calibration', () => {
  const mainPulse = HAPTIC_LEGEND.find((item) => item.type === 'beat');

  assert.ok(mainPulse, 'expected Main pulse legend item');
  assert.ok(mainPulse.intensity >= 0.6);
});

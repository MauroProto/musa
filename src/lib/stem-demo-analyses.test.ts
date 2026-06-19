import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ORDINARY_TRACK_ID } from './demo-score-tracks.ts';
import { getStemDemoAnalysis } from './stem-demo-analyses.ts';

test('Ordinary has a generated local LALAL analysis without bundled audio', () => {
  const analysis = getStemDemoAnalysis(ORDINARY_TRACK_ID);

  assert.ok(analysis, 'expected generated stem analysis for Ordinary');
  assert.equal(analysis.source, 'lalal-local');
  assert.ok((analysis.durationMs ?? 0) >= 180000);
  assert.ok((analysis.durationMs ?? 0) <= 190000);
  assert.ok(analysis.frames.length > 1000);
  assert.ok(analysis.frames.some((frame) => (frame.guitar ?? 0) > 0.25));
  assert.ok(analysis.frames.some((frame) => (frame.drums ?? 0) > 0.25));
  assert.ok(analysis.frames.some((frame) => (frame.vocals ?? 0) > 0.25));
  assert.ok(analysis.frames.some((frame) => (frame.bass ?? 0) > 0.25), 'strings should feed the body layer');
});

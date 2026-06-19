import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDemoTuning, tuningSnippetForMoments, type DemoTuningOverrides } from './demo-tuning.ts';
import type { AuthoredMoment } from './types.ts';

const base: AuthoredMoment[] = [
  {
    t: 1000,
    endMs: 2000,
    layer: 'guitar',
    label: 'riff',
    detail: 'curated',
    intensity: 0.8,
    cueType: 'guitar_riff',
    repeatEveryMs: 500,
  },
  {
    t: 3000,
    endMs: 4000,
    layer: 'structure',
    label: 'chorus',
    detail: 'curated',
    intensity: 1,
    cueType: 'chorus',
  },
];

test('applyDemoTuning offsets timing and edits repeat and intensity deterministically', () => {
  const overrides: DemoTuningOverrides = {
    riff: { startOffsetMs: 120, endOffsetMs: 300, repeatEveryMs: 420, intensity: 1, enabled: true },
  };

  const tuned = applyDemoTuning(base, overrides);
  const riff = tuned.find((moment) => moment.label === 'riff');

  assert.equal(riff?.t, 1120);
  assert.equal(riff?.endMs, 2300);
  assert.equal(riff?.repeatEveryMs, 420);
  assert.equal(riff?.intensity, 1);
});

test('applyDemoTuning removes disabled moments and clamps invalid windows', () => {
  const tuned = applyDemoTuning(base, {
    riff: { startOffsetMs: 2500, endOffsetMs: -900, enabled: true },
    chorus: { enabled: false },
  });

  assert.equal(tuned.some((moment) => moment.label === 'chorus'), false);
  const riff = tuned.find((moment) => moment.label === 'riff');
  assert.equal(riff?.t, 3500);
  assert.ok(riff!.endMs > riff!.t, 'end should be clamped after start');
});

test('tuningSnippetForMoments renders a patchable authored moment snippet', () => {
  const snippet = tuningSnippetForMoments(applyDemoTuning(base, { riff: { repeatEveryMs: 420 } }));

  assert.ok(snippet.includes('cueType: \'guitar_riff\''));
  assert.ok(snippet.includes('repeatEveryMs: 420'));
  assert.ok(snippet.includes('label: \'riff\''));
});
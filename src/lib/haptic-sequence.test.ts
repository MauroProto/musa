import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAndroidVibrationPattern, buildHapticSequence } from './haptic-sequence.ts';

test('beat stays subtle because it can fire many times per song', () => {
  const sequence = buildHapticSequence('beat', {
    strength: 'strong',
    intensity: 0.2,
  });

  assert.equal(sequence.steps.length, 1);
  assert.equal(sequence.steps[0].android, 'segment-frequent-tick');
});

test('chorus hit becomes a noticeable signature on strong settings', () => {
  const sequence = buildHapticSequence('chorus', {
    strength: 'strong',
    intensity: 1,
  });

  assert.ok(sequence.steps.length >= 4);
  assert.equal(sequence.steps[0].android, 'long-press');
  assert.ok(sequence.steps.some((step) => step.android === 'confirm'));
  assert.ok(sequence.stopAfterMs >= 450);
});

test('soft strength reduces chorus density for comfort', () => {
  const soft = buildHapticSequence('chorus', {
    strength: 'soft',
    intensity: 1,
  });
  const strong = buildHapticSequence('chorus', {
    strength: 'strong',
    intensity: 1,
  });

  assert.ok(soft.steps.length < strong.steps.length);
  assert.ok(soft.stopAfterMs < strong.stopAfterMs);
});

test('sustain uses a textured pulse train instead of one generic impact', () => {
  const sequence = buildHapticSequence('sustain', {
    strength: 'strong',
    intensity: 0.8,
  });

  assert.ok(sequence.steps.length >= 5);
  assert.equal(sequence.steps[0].ios, 'impact-soft');
  assert.ok(sequence.steps.at(-1)?.delayMs >= 480);
});

test('web fallback scales duration with strength', () => {
  const soft = buildHapticSequence('chorus_warning', {
    strength: 'soft',
    intensity: 0.6,
  });
  const strong = buildHapticSequence('chorus_warning', {
    strength: 'strong',
    intensity: 0.6,
  });

  assert.ok(Array.isArray(soft.webPattern));
  assert.ok(Array.isArray(strong.webPattern));
  assert.ok(strong.stopAfterMs > soft.stopAfterMs);
});

test('bass pulse uses a heavier body cue than the regular beat', () => {
  const beat = buildHapticSequence('beat', { strength: 'strong', intensity: 0.2 });
  const bass = buildHapticSequence('bass_pulse', { strength: 'strong', intensity: 0.8 });

  assert.ok(bass.stopAfterMs > beat.stopAfterMs);
  assert.equal(bass.steps[0].android, 'long-press');
});

test('drum fill is a quick multi-tap texture', () => {
  const sequence = buildHapticSequence('drum_fill', {
    strength: 'medium',
    intensity: 0.8,
  });

  assert.ok(sequence.steps.length >= 4);
  assert.ok(sequence.stopAfterMs < 420);
});

test('guitar strum is a tight brushed texture, not a heavy bass hit', () => {
  const sequence = buildHapticSequence('guitar_strum', {
    strength: 'strong',
    intensity: 0.8,
  });

  assert.ok(sequence.steps.length >= 3);
  assert.ok(sequence.stopAfterMs < 360);
  assert.notEqual(sequence.steps[0].android, 'long-press');
});

test('energy rise has an ascending build shape', () => {
  const sequence = buildHapticSequence('energy_rise', {
    strength: 'strong',
    intensity: 0.8,
  });

  assert.ok(sequence.steps.length >= 3);
  assert.equal(sequence.steps.at(-1)?.android, 'confirm');
});

test('android vibration fallback uses wait/vibrate pairs for React Native', () => {
  const sequence = buildHapticSequence('chorus', {
    strength: 'strong',
    intensity: 1,
  });
  const pattern = buildAndroidVibrationPattern(sequence.steps);

  assert.ok(pattern);
  assert.equal(pattern[0], 0);
  assert.equal(pattern.length, sequence.steps.length * 2);
  for (let i = 1; i < pattern.length; i += 2) {
    assert.ok(pattern[i] > 0, `vibration duration at index ${i} should be positive`);
  }
});

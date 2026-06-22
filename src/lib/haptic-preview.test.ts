import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveHapticPreviewIntensity } from './haptic-preview.ts';

test('haptic previews respect visual-only mode', () => {
  assert.equal(
    resolveHapticPreviewIntensity('chorus', 1, { visualOnly: true }),
    null,
  );
});

test('main pulse preview follows the beat pulse setting', () => {
  assert.equal(
    resolveHapticPreviewIntensity('beat', 0.4, { pulseOn: false }),
    null,
  );
  assert.equal(
    resolveHapticPreviewIntensity('beat', 0.4, { pulseOn: true }),
    0.4,
  );
});

test('haptic previews respect muted layer mixer gains', () => {
  const mutedDrums = { drums: 0, bass: 1, guitar: 1, vocals: 1 };

  assert.equal(
    resolveHapticPreviewIntensity('drum_fill', 0.8, { layerGains: mutedDrums }),
    null,
  );
  assert.equal(
    resolveHapticPreviewIntensity('beat', 0.4, { layerGains: mutedDrums }),
    null,
  );
});

test('haptic previews scale and clamp with layer mixer gains', () => {
  const boostedBass = { drums: 1, bass: 1.6, guitar: 1, vocals: 1 };

  assert.equal(
    resolveHapticPreviewIntensity('bass_pulse', 0.6, { layerGains: boostedBass }),
    1,
  );
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampGain,
  clampToIntensity,
  DEFAULT_LAYER_GAINS,
  gainForEventType,
  layerForEventType,
  normalizeLayerGains,
} from './layer-gains.ts';

test('layerForEventType maps cues to the four mixer layers', () => {
  assert.equal(layerForEventType('bass_pulse'), 'bass');
  assert.equal(layerForEventType('drum_fill'), 'drums');
  assert.equal(layerForEventType('beat'), 'drums');
  assert.equal(layerForEventType('guitar_riff'), 'guitar');
  assert.equal(layerForEventType('line_start'), 'vocals');
  assert.equal(layerForEventType('sustain'), 'vocals');
  // structural cues are never scaled by the mixer
  assert.equal(layerForEventType('chorus'), null);
  assert.equal(layerForEventType('mood_shift'), null);
});

test('gainForEventType scales by the matching layer, leaves structural at 1', () => {
  const gains = { ...DEFAULT_LAYER_GAINS, drums: 0, vocals: 1.5 };
  assert.equal(gainForEventType('drum_fill', gains), 0);
  assert.equal(gainForEventType('line_start', gains), 1.5);
  assert.equal(gainForEventType('chorus', gains), 1);
});

test('clampGain keeps gains inside 0..1.6 and recovers from junk', () => {
  assert.equal(clampGain(-2), 0);
  assert.equal(clampGain(9), 1.6);
  assert.equal(clampGain(Number.NaN), 1);
  assert.equal(clampGain(0.7), 0.7);
});

test('normalizeLayerGains fills defaults and clamps', () => {
  assert.deepEqual(normalizeLayerGains(undefined), DEFAULT_LAYER_GAINS);
  assert.deepEqual(normalizeLayerGains({ drums: 5, bass: -1 }), {
    drums: 1.6,
    bass: 0,
    guitar: 1,
    vocals: 1,
  });
});

test('clampToIntensity snaps to the nearest discrete step', () => {
  assert.equal(clampToIntensity(0), 0.2);
  assert.equal(clampToIntensity(0.55), 0.6);
  assert.equal(clampToIntensity(2), 1);
});

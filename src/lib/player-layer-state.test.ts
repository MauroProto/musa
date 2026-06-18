import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlayerLayerStates } from './player-layer-state.ts';
import type { SensoryMoment } from './types.ts';

function moment(layer: SensoryMoment['layer'], intensity: SensoryMoment['intensity']): SensoryMoment {
  return {
    t: 0,
    endMs: 2000,
    layer,
    label: layer,
    detail: layer,
    intensity,
  };
}

test('buildPlayerLayerStates makes a bass cue visually dominant', () => {
  const layers = buildPlayerLayerStates({
    energy: 0.42,
    cueType: 'bass_pulse',
    moments: [],
    sectionKind: 'verse',
    isPlaying: true,
  });

  const bass = layers.find((layer) => layer.key === 'bass');
  const drums = layers.find((layer) => layer.key === 'drums');
  assert.ok(bass);
  assert.ok(drums);
  assert.equal(bass.active, true);
  assert.ok(bass.level > drums.level);
});

test('buildPlayerLayerStates lifts structure during chorus sections', () => {
  const layers = buildPlayerLayerStates({
    energy: 0.5,
    cueType: undefined,
    moments: [],
    sectionKind: 'chorus',
    isPlaying: true,
  });

  const structure = layers.find((layer) => layer.key === 'structure');
  assert.ok(structure);
  assert.ok(structure.level >= 0.72);
});

test('buildPlayerLayerStates makes guitar dominant for guitar cues', () => {
  const layers = buildPlayerLayerStates({
    energy: 0.48,
    cueType: 'guitar_strum',
    moments: [],
    sectionKind: 'verse',
    isPlaying: true,
  });

  const guitar = layers.find((layer) => layer.key === 'guitar');
  const drums = layers.find((layer) => layer.key === 'drums');
  assert.ok(guitar);
  assert.ok(drums);
  assert.equal(guitar.active, true);
  assert.ok(guitar.level > drums.level);
});

test('buildPlayerLayerStates reflects active moments without hiding energy', () => {
  const layers = buildPlayerLayerStates({
    energy: 0.62,
    cueType: undefined,
    moments: [moment('emotion', 0.8)],
    sectionKind: 'verse',
    isPlaying: true,
  });

  const emotion = layers.find((layer) => layer.key === 'emotion');
  const energy = layers.find((layer) => layer.key === 'energy');
  assert.ok(emotion);
  assert.ok(energy);
  assert.equal(emotion.active, true);
  assert.ok(energy.level >= 0.62);
});

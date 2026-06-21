import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYER_BACKGROUND_BASE,
  LYRIC_STACK_CHROME,
  PLAYER_BACKGROUND_BLOOMS,
  PLAYER_BACKGROUND_GRAIN,
  PLAYER_BACKGROUND_TEXTURE,
  cueBloomLayoutFor,
} from './player-visual-chrome.ts';
import { CUE_BLOOMS } from '../constants/theme.ts';

test('player background blooms can travel across the whole screen', () => {
  const xs = PLAYER_BACKGROUND_BLOOMS.map((bloom) => bloom.x);
  const ys = PLAYER_BACKGROUND_BLOOMS.map((bloom) => bloom.y);

  assert.ok(PLAYER_BACKGROUND_BLOOMS.length >= 4);
  assert.ok(Math.min(...xs) <= 0.18);
  assert.ok(Math.max(...xs) >= 0.82);
  assert.ok(Math.min(...ys) <= 0.18);
  assert.ok(Math.max(...ys) >= 0.82);
});

test('player background uses a white canvas instead of a green wash', () => {
  assert.equal(PLAYER_BACKGROUND_BASE.color, '#FAFAF7');
  assert.ok(PLAYER_BACKGROUND_BASE.washColors.every((color) => !color.includes('85,224,178')));
  assert.ok(PLAYER_BACKGROUND_BASE.washColors.every((color) => !color.includes('55E0B2')));
});

test('player background keeps colour in music-driven blooms, not persistent green ambience', () => {
  assert.equal(PLAYER_BACKGROUND_TEXTURE.enabled, true);
  assert.ok(PLAYER_BACKGROUND_TEXTURE.opacity >= 0.12);
  assert.equal(PLAYER_BACKGROUND_TEXTURE.tintColor, '#68727C');
  assert.equal(PLAYER_BACKGROUND_GRAIN.enabled, true);
  assert.ok(PLAYER_BACKGROUND_GRAIN.dots.length >= 72);
  assert.ok(PLAYER_BACKGROUND_BLOOMS.some((bloom) => bloom.color === '#2E74FF'));
  assert.ok(PLAYER_BACKGROUND_BLOOMS.some((bloom) => bloom.color === '#55D7E7'));
  assert.ok(PLAYER_BACKGROUND_BLOOMS.every((bloom) => bloom.color !== '#55E0B2'));
  assert.ok(PLAYER_BACKGROUND_BLOOMS.every((bloom) => bloom.color !== '#B7F5E0'));
});

test('guitar cue bloom uses cyan instead of persistent green', () => {
  assert.equal(CUE_BLOOMS.guitar, '#35C5DE');
  assert.notEqual(CUE_BLOOMS.guitar, '#3FA86B');
});

test('cue bloom positions stay bounded but change by musical role', () => {
  const guitar = cueBloomLayoutFor('guitar_riff');
  const chorus = cueBloomLayoutFor('chorus');

  assert.notDeepEqual(guitar, chorus);
  for (const layout of [guitar, chorus]) {
    assert.ok(layout.x >= 0 && layout.x <= 1);
    assert.ok(layout.y >= 0 && layout.y <= 1);
    assert.ok(layout.size >= 0.5 && layout.size <= 1.35);
  }
});

test('music-driven cue blooms stay vivid over the white canvas', () => {
  assert.ok(cueBloomLayoutFor('guitar_riff').opacity >= 0.56);
  assert.ok(cueBloomLayoutFor('drum_fill').opacity >= 0.48);
  assert.ok(cueBloomLayoutFor('chorus').opacity >= 0.64);
});

test('lyric stack reserves previous current and next reading slots', () => {
  assert.deepEqual(LYRIC_STACK_CHROME.slots, ['previous', 'current', 'next']);
  assert.equal(LYRIC_STACK_CHROME.wordTimingSource, 'unavailable');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTactileFocus, shouldSuppressBeatAt } from './tactile-focus.ts';
import type { AuthoredMoment } from './types.ts';

function authored(
  label: string,
  t: number,
  endMs: number,
  cueType: AuthoredMoment['cueType'],
  layer: AuthoredMoment['layer'],
  suppressBeat = false,
): AuthoredMoment {
  return {
    t,
    endMs,
    cueType,
    layer,
    label,
    detail: label,
    intensity: cueType === 'chorus' ? 1 : 0.8,
    suppressBeat,
  };
}

const moments: AuthoredMoment[] = [
  authored('Drums count-in', 0, 7500, 'drum_fill', 'drums', false),
  authored('Signature guitar riff', 7500, 15500, 'guitar_riff', 'guitar', true),
  authored('First chorus', 56460, 76500, 'chorus', 'structure', true),
  authored('Guitar solo', 190000, 230000, 'guitar_strum', 'guitar', false),
];

test('resolveTactileFocus returns the active authored focus', () => {
  const focus = resolveTactileFocus(moments, 8200);

  assert.ok(focus);
  assert.equal(focus.label, 'Signature guitar riff');
  assert.equal(focus.layer, 'guitar');
  assert.equal(focus.cueType, 'guitar_riff');
});

test('shouldSuppressBeatAt suppresses beats during the signature riff', () => {
  assert.equal(shouldSuppressBeatAt(moments, 8200), true);
});

test('shouldSuppressBeatAt suppresses beats during chorus focus', () => {
  assert.equal(shouldSuppressBeatAt(moments, 57000), true);
});

test('shouldSuppressBeatAt allows rhythm under the guitar solo', () => {
  assert.equal(shouldSuppressBeatAt(moments, 191000), false);
});

test('resolveTactileFocus returns null outside authored windows', () => {
  assert.equal(resolveTactileFocus(moments, 30000), null);
});

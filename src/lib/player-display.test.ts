import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePlayerDisplayState } from './player-display.ts';
import type { SensoryMoment, SyncedLine } from './types.ts';

const lines: SyncedLine[] = [
  { startMs: 15000, endMs: 18000, text: 'First caption' },
  { startMs: 19000, endMs: 22000, text: 'Second caption' },
];

function moment(label: string, t = 0, endMs = 10000): SensoryMoment {
  return {
    t,
    endMs,
    layer: 'drums',
    label,
    detail: label,
    intensity: 0.6,
  };
}

test('resolvePlayerDisplayState shows press play only before playback starts', () => {
  const state = resolvePlayerDisplayState({
    lines,
    currentLineIndex: -1,
    isPlaying: false,
    currentMs: 0,
    activeMoments: [],
    guidedStep: null,
  });

  assert.equal(state.mode, 'idle');
  assert.equal(state.primaryText, 'Press play');
});

test('resolvePlayerDisplayState uses active moment during pre-lyric playback', () => {
  const state = resolvePlayerDisplayState({
    lines,
    currentLineIndex: -1,
    isPlaying: true,
    currentMs: 2000,
    activeMoments: [moment('Drums count-in')],
    guidedStep: null,
  });

  assert.equal(state.mode, 'prelude');
  assert.equal(state.primaryText, 'Drums count-in');
  assert.notEqual(state.primaryText, 'Press play');
  assert.equal(state.nextText, 'First caption');
});

test('resolvePlayerDisplayState prefers guided step when no active moment is present', () => {
  const state = resolvePlayerDisplayState({
    lines,
    currentLineIndex: -1,
    isPlaying: true,
    currentMs: 8000,
    activeMoments: [],
    guidedStep: {
      id: 'signature-riff',
      label: 'Signature guitar riff',
      detail: 'The phone switches to the riff.',
      jumpMs: 7500,
      endMs: 15500,
      cueType: 'guitar_riff',
    },
  });

  assert.equal(state.mode, 'prelude');
  assert.equal(state.primaryText, 'Signature guitar riff');
  assert.equal(state.statusLabel, 'Intro');
});

test('resolvePlayerDisplayState returns lyric context when a line is active', () => {
  const state = resolvePlayerDisplayState({
    lines,
    currentLineIndex: 1,
    isPlaying: true,
    currentMs: 19500,
    activeMoments: [moment('Verse bass walk', 15000, 45000)],
    guidedStep: null,
  });

  assert.equal(state.mode, 'lyric');
  assert.equal(state.primaryText, 'Second caption');
  assert.equal(state.previousText, 'First caption');
  assert.equal(state.nextText, null);
});

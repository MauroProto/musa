import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from './demo-score-tracks.ts';
import { fallbackSensoryCaptionsForTrack, guidedStepsForTrack } from './demo-guided.ts';

test('guided Dani steps cover the judge-facing song story', () => {
  const steps = guidedStepsForTrack(DANI_CALIFORNIA_TRACK_ID);
  const labels = steps.map((step) => step.label);

  assert.deepEqual(labels, [
    'Drums count-in',
    'Signature guitar riff',
    'Verse bass walk',
    'Pre-chorus build',
    'First chorus',
    'Bridge mood shift',
    'Guitar solo',
  ]);
  assert.equal(steps[1].cueType, 'guitar_riff');
  assert.ok(steps.every((step) => step.jumpMs >= 0));
});

test('fallback sensory captions are non-lyric and cover Dani authored moments', () => {
  const captions = fallbackSensoryCaptionsForTrack(DANI_CALIFORNIA_TRACK_ID);
  const text = captions.map((line) => line.text).join(' ').toLowerCase();

  assert.ok(captions.length >= 7);
  assert.ok(text.includes('signature guitar riff'));
  assert.ok(text.includes('first chorus'));
  assert.equal(text.includes('california, rest in peace'), false);
  assert.equal(text.includes('gettin'), false);
});
test('fallback sensory captions are non-lyric for Ordinary', () => {
  const captions = fallbackSensoryCaptionsForTrack(ORDINARY_TRACK_ID);
  const text = captions.map((line) => line.text).join(' ').toLowerCase();

  assert.ok(captions.length >= 5);
  assert.ok(text.includes('acoustic'));
  assert.ok(text.includes('strings'));
  assert.equal(text.includes('holy water'), false);
  assert.equal(text.includes('ordinary'), false, 'captions should describe the song feel, not quote or title-drop');
});

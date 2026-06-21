import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from './demo-score-tracks.ts';
import { getRemoteStemAudioUrl, hasRemoteStemAudio } from './stem-audio-assets.ts';

const EXPECTED_STEM_FILES = [
  'assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_bass_split_by_lalalai.mp3',
  'assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_drum_split_by_lalalai.mp3',
  'assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_electric_guitar_split_by_lalalai.mp3',
  'assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_no_vocals_split_by_lalalai.mp3',
  'assets/lalalai/pasirluyu_red-hot-chili-peppers-dani-california_vocals_split_by_lalalai.mp3',
  'assets/lalalai/ordinary/Alex warren - Ordinary_acoustic_guitar_split_by_lalalai.mp3',
  'assets/lalalai/ordinary/Alex warren - Ordinary_drum_split_by_lalalai.mp3',
  'assets/lalalai/ordinary/Alex warren - Ordinary_no_acoustic_guitar_split_by_lalalai.mp3',
  'assets/lalalai/ordinary/Alex warren - Ordinary_no_drum_split_by_lalalai.mp3',
  'assets/lalalai/ordinary/Alex warren - Ordinary_no_strings_split_by_lalalai.mp3',
  'assets/lalalai/ordinary/Alex warren - Ordinary_no_vocals_split_by_lalalai.mp3',
  'assets/lalalai/ordinary/Alex warren - Ordinary_strings_split_by_lalalai.mp3',
  'assets/lalalai/ordinary/Alex warren - Ordinary_vocals_split_by_lalalai.mp3',
];

test('Dani and Ordinary stem MP3s are present in the repo for judge demos', () => {
  for (const relativePath of EXPECTED_STEM_FILES) {
    assert.equal(existsSync(path.join(process.cwd(), relativePath)), true, relativePath);
  }
});

test('judge demo audio uses remote URLs instead of bundling MP3s into EAS Update', () => {
  const daniGuitarUrl = getRemoteStemAudioUrl(DANI_CALIFORNIA_TRACK_ID, 'guitar');
  const daniMixUrl = getRemoteStemAudioUrl(DANI_CALIFORNIA_TRACK_ID, 'no_vocals');
  const ordinaryGuitarUrl = getRemoteStemAudioUrl(ORDINARY_TRACK_ID, 'guitar');
  const ordinaryMixUrl = getRemoteStemAudioUrl(ORDINARY_TRACK_ID, 'no_vocals');

  assert.ok(daniGuitarUrl?.startsWith('https://pub-c392c19f21d2456aa30d465e6f0a9d40.r2.dev/'));
  assert.ok(daniGuitarUrl?.endsWith('dani-california_electric_guitar_split_by_lalalai.mp3'));
  assert.ok(daniMixUrl?.endsWith('dani-california_no_vocals_split_by_lalalai.mp3'));
  assert.ok(ordinaryGuitarUrl?.includes('ordinary/Alex%20warren%20-%20Ordinary_acoustic_guitar'));
  assert.ok(ordinaryMixUrl?.includes('ordinary/Alex%20warren%20-%20Ordinary_no_vocals'));
  assert.equal(hasRemoteStemAudio(DANI_CALIFORNIA_TRACK_ID), true);
  assert.equal(hasRemoteStemAudio(ORDINARY_TRACK_ID), true);
});

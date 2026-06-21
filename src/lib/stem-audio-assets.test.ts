import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';

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

test('Dani and Ordinary stem MP3s are present for bundled judge demos', () => {
  for (const relativePath of EXPECTED_STEM_FILES) {
    assert.equal(existsSync(path.join(process.cwd(), relativePath)), true, relativePath);
  }
});

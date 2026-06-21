import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('preferences store avoids the bundled zustand middleware barrel on web', () => {
  const source = readFileSync(new URL('./preferences.ts', import.meta.url), 'utf8');

  assert.equal(source.includes("from 'zustand/middleware'"), false);
});

test('preferences migrate old non-Deaf silent audio presets once', () => {
  const source = readFileSync(new URL('./preferences.ts', import.meta.url), 'utf8');

  assert.equal(source.includes('const AUDIO_PRESET_VERSION = 2'), true);
  assert.equal(source.includes('function migratePersistedPreferences'), true);
  assert.equal(source.includes("merged.profile !== 'deaf_visual'"), true);
  assert.equal(source.includes("parsed.audioMode === 'silent'"), true);
  assert.equal(source.includes('presetForProfile(merged.profile).audioMode'), true);
});

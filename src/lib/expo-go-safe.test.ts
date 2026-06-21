import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('public Expo Go build keeps native audio enabled for R2 streams', () => {
  const packageJson = JSON.parse(readRepoFile('package.json')) as {
    dependencies?: Record<string, string>;
  };
  const appJson = JSON.parse(readRepoFile('app.json')) as {
    expo?: { plugins?: unknown[] };
  };
  const stemAudioHook = readRepoFile('src/hooks/useStemAudio.ts');
  const player = readRepoFile('src/app/player.tsx');

  assert.ok(packageJson.dependencies?.['expo-audio']);
  assert.ok(appJson.expo?.plugins?.includes('expo-audio'));
  assert.equal(stemAudioHook.includes('useAudioPlayer'), true);
  assert.equal(stemAudioHook.includes('getStemAudioSource'), true);
  assert.equal(player.includes('AudioModeControl'), true);
});

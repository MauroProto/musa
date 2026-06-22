import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);

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

test('Railway Expo Go server strips EAS account fields from public config', () => {
  const previous = process.env.MUSA_EXPO_GO_SERVER;
  process.env.MUSA_EXPO_GO_SERVER = '1';

  try {
    const appConfig = require('../../app.config.js') as () => {
      owner?: string;
      updates?: unknown;
      extra?: { eas?: unknown };
    };
    const config = appConfig();

    assert.equal(config.owner, undefined);
    assert.equal(config.updates, undefined);
    assert.equal(config.extra?.eas, undefined);
  } finally {
    if (previous === undefined) {
      delete process.env.MUSA_EXPO_GO_SERVER;
    } else {
      process.env.MUSA_EXPO_GO_SERVER = previous;
    }
  }
});

test('native stem demos request synced lyrics before using sensory caption fallback', () => {
  const apiClient = readRepoFile('src/lib/api-client.ts');
  const lyricsFetchIndex = apiClient.indexOf('const res = await safeFetch(`${apiBase()}/api/lyrics?trackId=${trackId}`)');
  const stemFallbackIndex = apiClient.indexOf("return { lines: fallbackSensoryCaptionsForTrack(trackId), source: 'stem-demo' };");

  assert.ok(lyricsFetchIndex >= 0, 'expected getLyricsClient to call the lyrics API');
  assert.ok(stemFallbackIndex >= 0, 'expected getLyricsClient to retain stem demo fallback');
  assert.ok(
    lyricsFetchIndex < stemFallbackIndex,
    'stem demos should fetch Musixmatch-synced lyrics before falling back to sensory captions',
  );
});

test('native Expo Go clients keep a public API base for judge demos', () => {
  const apiClient = readRepoFile('src/lib/api-client.ts');

  assert.ok(
    apiClient.includes("const PUBLIC_EXPO_API_BASE = 'https://musa-expo-go-production.up.railway.app';"),
    'expected native API client to know the public Railway API base',
  );
  assert.ok(
    apiClient.includes('process.env.EXPO_PUBLIC_API_BASE || PUBLIC_EXPO_API_BASE'),
    'expected native API client to fall back when EXPO_PUBLIC_API_BASE is missing from the bundle',
  );
});

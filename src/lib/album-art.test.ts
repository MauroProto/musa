import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_TRACKS } from './fixtures.ts';
import { albumArtForTrack, DEMO_ALBUM_ART } from './album-art.ts';

test('every demo score has local album artwork metadata', () => {
  for (const track of DEMO_TRACKS) {
    const art = albumArtForTrack(track.trackId);
    assert.ok(art, `missing album art for ${track.title}`);
    assert.ok(art.fileName.endsWith('.jpg'));
    assert.ok(art.sourceUrl.startsWith('https://'));
  }
});

test('downloaded album artwork files exist in the repo', () => {
  for (const art of Object.values(DEMO_ALBUM_ART)) {
    const absolute = resolve(process.cwd(), 'assets', 'images', 'albums', art.fileName);
    assert.equal(existsSync(absolute), true, `missing ${art.fileName}`);
  }
});

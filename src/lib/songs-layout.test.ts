import { test } from 'node:test';
import assert from 'node:assert/strict';
import { songsHeroBannerHeight } from './songs-layout.ts';

test('songs hero stays compact on phone screens', () => {
  assert.equal(songsHeroBannerHeight(390), 150);
});

test('songs hero remains a banner instead of a large photo on wide screens', () => {
  assert.equal(songsHeroBannerHeight(920), 174);
  assert.ok(songsHeroBannerHeight(920) < 190);
});

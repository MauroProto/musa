import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playerHeaderRailWidth } from './player-header-layout.ts';

test('player header rail width mirrors the larger action side', () => {
  assert.equal(playerHeaderRailWidth({ buttonSize: 42, actionCount: 2, gap: 10 }), 94);
  assert.equal(playerHeaderRailWidth({ buttonSize: 44, actionCount: 2, gap: 16 }), 104);
});

test('player header rail width handles single-action sides without extra gap', () => {
  assert.equal(playerHeaderRailWidth({ buttonSize: 42, actionCount: 1, gap: 10 }), 42);
});

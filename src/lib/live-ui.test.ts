import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIVE_DISCOVER_COPY, liveSectionGap } from './live-ui.ts';

test('live subtitle stays concise enough for the phone header', () => {
  assert.ok(LIVE_DISCOVER_COPY.subtitle.length <= 110);
  assert.ok(!LIVE_DISCOVER_COPY.subtitle.includes('Keep your phone in your pocket'));
});

test('live section gap gives compact phones a little less vertical jump', () => {
  assert.equal(liveSectionGap(390), 26);
  assert.equal(liveSectionGap(560), 32);
});

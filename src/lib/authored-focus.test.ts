import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DANI_CALIFORNIA_SCREENPLAY } from './authored-screenplay.ts';

test('Dani authored focus windows suppress only the densest background beat layers', () => {
  const riff = DANI_CALIFORNIA_SCREENPLAY.find((moment) => moment.cueType === 'guitar_riff');
  const chorus = DANI_CALIFORNIA_SCREENPLAY.find((moment) => moment.cueType === 'chorus');
  const solo = DANI_CALIFORNIA_SCREENPLAY.find((moment) => moment.label === 'Guitar solo opens up');

  assert.ok(riff);
  assert.equal(riff.suppressBeat, true);
  assert.ok(chorus);
  assert.equal(chorus.suppressBeat, true);
  assert.ok(solo);
  assert.equal(solo.suppressBeat, false);
});

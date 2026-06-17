import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('preferences store avoids the bundled zustand middleware barrel on web', () => {
  const source = readFileSync(new URL('./preferences.ts', import.meta.url), 'utf8');

  assert.equal(source.includes("from 'zustand/middleware'"), false);
});

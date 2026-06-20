import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ENTER_MUSA_TARGET,
  INITIAL_ENTRY_TARGET,
  enterMusaDelayMs,
  shouldCompleteOnboardingOnEnter,
} from './onboarding-entry.ts';

test('app launch always starts at the MUSA entry screen', () => {
  assert.equal(INITIAL_ENTRY_TARGET, '/welcome');
});

test('Enter MUSA routes into the app shell', () => {
  assert.equal(ENTER_MUSA_TARGET, '/search');
  assert.equal(shouldCompleteOnboardingOnEnter(), true);
});

test('Enter MUSA keeps a short transition delay for tactile feedback', () => {
  assert.equal(enterMusaDelayMs(false), 260);
  assert.equal(enterMusaDelayMs(true), 80);
});

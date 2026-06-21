import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canEnterWelcome,
  WELCOME_PROFILE_PICKER,
  welcomeCtaLabel,
} from './welcome-onboarding.ts';

test('welcome requires a listening profile before entering the app', () => {
  assert.equal(canEnterWelcome(null), false);
  assert.equal(canEnterWelcome('deaf_visual'), true);
  assert.equal(canEnterWelcome('hard_of_hearing'), true);
});

test('welcome CTA reflects whether the profile step is complete', () => {
  assert.equal(welcomeCtaLabel(null, false), 'Choose a profile');
  assert.equal(welcomeCtaLabel('cochlear_implant', false), 'Enter MUSA');
  assert.equal(welcomeCtaLabel('hearing_aid', true), 'Opening');
});

test('welcome profile picker shows all cards in a wrapped grid without card subtitles', () => {
  assert.equal(WELCOME_PROFILE_PICKER.mode, 'grid');
  assert.equal(WELCOME_PROFILE_PICKER.showHints, false);
  assert.equal(WELCOME_PROFILE_PICKER.wrap, true);
});

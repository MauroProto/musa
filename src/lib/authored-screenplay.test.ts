import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSensoryScore } from './sensory-score.ts';
import type { AuthoredMoment, SyncedLine } from './types.ts';
import { DANI_CALIFORNIA_SCREENPLAY } from './authored-screenplay.ts';

function line(startMs: number, text: string): SyncedLine {
  return { startMs, text };
}

test('authored moments override auto-detected moments of the same layer in their window', () => {
  const authored: AuthoredMoment[] = [
    {
      t: 1000,
      endMs: 4000,
      layer: 'structure',
      label: 'Authored chorus — full band hit',
      detail: 'curated',
      intensity: 1,
      mood: 'euphoric',
      cueType: 'chorus',
    },
  ];
  const score = buildSensoryScore({
    lines: [line(0, 'a'), line(1000, 'b'), line(2500, 'b'), line(3000, 'b'), line(5000, 'c')],
    authored,
  });

  const structureMoments = score.moments.filter((m) => m.layer === 'structure');
  const authoredOnes = structureMoments.filter((m) => m.label === 'Authored chorus — full band hit');
  assert.ok(authoredOnes.length === 1, 'authored structure moment should be present');
  // No OTHER auto structure moment should survive inside [1000, 4000]
  const intruders = structureMoments.filter(
    (m) => m.label !== 'Authored chorus — full band hit' && m.t >= 1000 && m.t <= 4000,
  );
  assert.equal(intruders.length, 0, 'auto structure moments in the authored window should be suppressed');
});

test('authored riff with repeatEveryMs injects repeated guitar_strum cues across the window', () => {
  const authored: AuthoredMoment[] = [
    {
      t: 8000,
      endMs: 10000,
      layer: 'guitar',
      label: 'The signature riff',
      detail: 'curated',
      intensity: 0.8,
      cueType: 'guitar_strum',
      repeatEveryMs: 500,
    },
  ];
  const score = buildSensoryScore({
    lines: [line(0, 'intro')],
    durationMs: 12000,
    authored,
  });

  const strums = score.events.filter((e) => e.type === 'guitar_strum' && e.t >= 8000 && e.t <= 10000);
  assert.ok(strums.length >= 4, `repeated riff should emit several strums, got ${strums.length}`);
  assert.ok(strums.some((e) => e.t === 8000), 'first strum at moment.t');
  assert.ok(strums.some((e) => e.t === 8500), 'repeated strum at t+repeatEveryMs');
});

test('authored chorus cue registers in chorusTimesMs for the countdown', () => {
  const authored: AuthoredMoment[] = [
    {
      t: 51500,
      endMs: 70000,
      layer: 'structure',
      label: 'First chorus',
      detail: 'curated',
      intensity: 1,
      cueType: 'chorus',
    },
  ];
  const score = buildSensoryScore({
    lines: [line(0, 'a'), line(20000, 'b')],
    durationMs: 90000,
    authored,
  });

  assert.ok(
    score.chorusTimesMs.includes(51500),
    'authored chorus time should be reachable by the chorus countdown',
  );
});

test('DANI_CALIFORNIA_SCREENPLAY is non-empty and covers the intro riff', () => {
  assert.ok(DANI_CALIFORNIA_SCREENPLAY.length >= 5);
  const riff = DANI_CALIFORNIA_SCREENPLAY.find((m) => m.label === 'The signature riff');
  assert.ok(riff, 'the defining riff moment must be authored');
  assert.equal(riff?.cueType, 'guitar_riff');
  assert.ok(riff?.repeatEveryMs && riff.repeatEveryMs > 0, 'riff must repeat across its window');
  assert.ok(riff!.t < 10000, 'riff should start near the top of the song');
});

test('authored cues survive coalescing with auto stem events (priority by type)', () => {
  // guitar_strum (priority 88) authored at t=500 should win over a nearby
  // bass_pulse (priority 84) auto event within the merge window.
  const authored: AuthoredMoment[] = [
    {
      t: 500,
      endMs: 600,
      layer: 'guitar',
      label: 'riff',
      detail: 'curated',
      intensity: 0.8,
      cueType: 'guitar_strum',
    },
  ];
  const score = buildSensoryScore({
    lines: [line(0, 'a'), line(2000, 'b')],
    durationMs: 4000,
    stemAnalysis: {
      source: 'lalal-local',
      durationMs: 4000,
      bpm: 96,
      frames: [
        { t: 0, bass: 0.1, drums: 0.1 },
        { t: 500, bass: 0.95, drums: 0.2 },
        { t: 1000, bass: 0.1, drums: 0.1 },
      ],
    },
    authored,
  });

  const near = score.events.filter((e) => Math.abs(e.t - 500) <= 180);
  assert.ok(near.some((e) => e.type === 'guitar_strum'), 'authored guitar_strum must survive');
  assert.equal(
    near.some((e) => e.type === 'bass_pulse'),
    false,
    'lower-priority bass_pulse should be coalesced away',
  );
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSensoryScore,
  computeDurationMs,
  detectChoruses,
  generateBeats,
  getCurrentLineIndex,
  nearestChorusIn,
  normalizeLyric,
} from './sensory-score.ts';
import type { SyncedLine } from './types.ts';

function line(startMs: number, text: string, endMs?: number): SyncedLine {
  return { startMs, text, endMs };
}

function fixYouExcerpt(): SyncedLine[] {
  return [
    line(0, 'When you try your best, but you don\'t succeed'),
    line(4000, 'When you get what you want, but not what you need'),
    line(8000, 'When you feel so tired, but you can\'t sleep'),
    line(12000, 'Stuck in reverse'),
    line(20000, 'And the tears come streaming down your face'),
    line(23500, 'When you lose something you can\'t replace'),
    line(27000, 'When you love someone, but it goes to waste'),
    line(31000, 'Could it be worse?'),
    line(40000, 'Lights will guide you home'),
    line(43000, 'And ignite your bones'),
    line(46000, 'And I will try to fix you'),
    line(60000, 'Lights will guide you home'),
    line(63000, 'And ignite your bones'),
    line(66000, 'And I will try to fix you'),
  ];
}

test('normalizeLyric strips punctuation and lowercases', () => {
  assert.equal(normalizeLyric("Couldn't be, worse?!"), 'couldnt be worse');
  assert.equal(normalizeLyric('   '), '');
});

test('computeDurationMs uses hint when provided', () => {
  assert.equal(computeDurationMs([line(0, 'a')], 99999), 99999);
});

test('computeDurationMs falls back to last line end', () => {
  assert.equal(computeDurationMs([line(0, 'a'), line(2000, 'b', 5000)]), 5000);
});

test('generateBeats respects bpm and duration', () => {
  const beats = generateBeats([line(0, 'a')], 120, 60000);
  assert.ok(beats.length >= 119 && beats.length <= 121, `got ${beats.length}`);
  assert.equal(beats[0], 0);
  assert.ok(beats[1] >= 490 && beats[1] <= 510);
});

test('detectChoruses finds the repeated "Lights will guide you home" block', () => {
  const regions = detectChoruses(fixYouExcerpt());
  assert.ok(regions.length >= 1, 'expected at least one chorus region');
  const first = regions[0];
  assert.ok(first.startMs >= 38000 && first.startMs <= 46000, `first chorus at ${first.startMs}`);
  assert.ok(regions.some((r) => r.startMs >= 58000 && r.startMs <= 60000), 'expected second occurrence');
});

test('detectChoruses returns empty for too-few lines', () => {
  assert.deepEqual(detectChoruses([line(0, 'only'), line(1000, 'two')]), []);
});

test('buildSensoryScore emits line_start per line', () => {
  const score = buildSensoryScore({ lines: fixYouExcerpt() });
  const lineStarts = score.events.filter((e) => e.type === 'line_start');
  assert.equal(lineStarts.length, fixYouExcerpt().length);
});

test('buildSensoryScore emits chorus_warning 8s before each chorus', () => {
  const score = buildSensoryScore({ lines: fixYouExcerpt() });
  const warnings = score.events.filter((e) => e.type === 'chorus_warning');
  assert.ok(warnings.length >= 1);
  const choruses = score.events.filter((e) => e.type === 'chorus');
  assert.ok(choruses.length >= 1);
  for (const w of warnings) {
    const matched = choruses.some((c) => Math.abs(c.t - (w.t + 8000)) < 1);
    assert.ok(matched, `warning at ${w.t} should match a chorus 8s later`);
  }
});

test('buildSensoryScore emits sustain for long lines', () => {
  const longLine = [line(0, 'a long held emotional phrase that lasts', 5000)];
  const score = buildSensoryScore({ lines: longLine, durationMs: 6000 });
  const sustains = score.events.filter((e) => e.type === 'sustain');
  assert.ok(sustains.length >= 1, 'expected a sustain event for the long line');
});

test('buildSensoryScore emits pause for big gaps between lines', () => {
  const lines = [line(0, 'first'), line(6000, 'second')];
  const score = buildSensoryScore({ lines, durationMs: 10000 });
  const pauses = score.events.filter((e) => e.type === 'pause');
  assert.ok(pauses.length >= 1, 'expected a pause event for the 6s gap');
});

test('buildSensoryScore events are sorted by time', () => {
  const score = buildSensoryScore({ lines: fixYouExcerpt() });
  for (let i = 1; i < score.events.length; i++) {
    assert.ok(
      score.events[i].t >= score.events[i - 1].t,
      `event ${i} out of order`,
    );
  }
});

test('buildSensoryScore includes beats grid and energy', () => {
  const score = buildSensoryScore({ lines: fixYouExcerpt() });
  assert.ok(score.beats.length > 50, 'expected a populated beats grid');
  assert.ok(score.energy.length > 0);
  assert.ok(score.sections.length > 0);
});

test('nearestChorusIn returns ms until next chorus', () => {
  const result = nearestChorusIn([40000, 60000], 33000);
  assert.equal(result, 7000);
  assert.equal(nearestChorusIn([40000], 50000), null);
});

test('getCurrentLineIndex returns last line already started', () => {
  const lines = [line(0, 'a'), line(4000, 'b'), line(8000, 'c')];
  assert.equal(getCurrentLineIndex(lines, 5000), 1);
  assert.equal(getCurrentLineIndex(lines, 100), 0);
  assert.equal(getCurrentLineIndex(lines, 9000), 2);
});

test('buildSensoryScore uses provided energy when supplied', () => {
  const score = buildSensoryScore({
    lines: fixYouExcerpt(),
    energy: [{ t: 0, value: 0.2 }, { t: 100000, value: 0.2 }],
  });
  assert.equal(score.energy.length, 2);
});

test('buildSensoryScore adds bass pulses in high-energy chorus sections', () => {
  const score = buildSensoryScore({ lines: fixYouExcerpt() });
  const bassPulses = score.events.filter((e) => e.type === 'bass_pulse');

  assert.ok(bassPulses.length >= 2, 'expected body-level bass pulses');
  assert.ok(
    bassPulses.some((e) => e.t >= 40000 && e.t <= 50000),
    'expected bass pulses around the first chorus',
  );
});

test('buildSensoryScore adds a drum fill before chorus impact', () => {
  const score = buildSensoryScore({ lines: fixYouExcerpt() });
  const fills = score.events.filter((e) => e.type === 'drum_fill');
  const choruses = score.events.filter((e) => e.type === 'chorus');

  assert.ok(fills.length >= 1, 'expected at least one drum fill');
  assert.ok(
    fills.some((fill) => choruses.some((chorus) => chorus.t - fill.t > 0 && chorus.t - fill.t <= 2400)),
    'expected fill shortly before a chorus',
  );
});

test('buildSensoryScore exposes readable sensory moments', () => {
  const score = buildSensoryScore({
    lines: [
      line(0, 'I feel the tears come down'),
      line(4000, 'Waiting in the dark'),
      line(8000, 'Lights will guide you home'),
      line(11000, 'And ignite your bones'),
      line(14000, 'And I will try to fix you'),
      line(22000, 'Lights will guide you home'),
      line(25000, 'And ignite your bones'),
      line(28000, 'And I will try to fix you'),
    ],
  });

  assert.ok(score.moments.length > 0, 'expected sensory moment labels');
  assert.ok(score.moments.some((m) => m.layer === 'emotion' && m.mood === 'melancholic'));
  assert.ok(score.moments.some((m) => m.layer === 'structure' && m.label === 'Chorus opens'));
});

test('guitar_riff wins collisions with generic guitar and drum cues, but not chorus', () => {
  const score = buildSensoryScore({
    lines: [line(0, 'intro'), line(2000, 'next')],
    durationMs: 6000,
    stemAnalysis: {
      source: 'lalal-local',
      durationMs: 6000,
      bpm: 96,
      frames: [
        { t: 0, bass: 0.1, drums: 0.1, guitar: 0.1 },
        { t: 1000, drums: 0.9, guitar: 0.9, onsetDrums: 0.9, onsetGuitar: 0.9 },
        { t: 3000, drums: 0.1, guitar: 0.1 },
        { t: 5000, drums: 0.1, guitar: 0.1 },
      ],
    },
    authored: [
      {
        t: 1000,
        endMs: 1400,
        layer: 'guitar',
        label: 'riff',
        detail: 'curated',
        intensity: 0.8,
        cueType: 'guitar_riff',
      },
      {
        t: 1020,
        endMs: 1800,
        layer: 'structure',
        label: 'chorus',
        detail: 'curated',
        intensity: 1,
        cueType: 'chorus',
      },
    ],
  });

  const near = score.events.filter((e) => Math.abs(e.t - 1000) <= 180);
  assert.ok(near.some((e) => e.type === 'chorus'), 'chorus should remain highest priority');
  assert.equal(near.some((e) => e.type === 'guitar_riff'), false, 'chorus should coalesce nearby riff');

  const riffOnly = buildSensoryScore({
    lines: [line(0, 'intro'), line(2000, 'next')],
    durationMs: 6000,
    stemAnalysis: {
      source: 'lalal-local',
      durationMs: 6000,
      bpm: 96,
      frames: [
        { t: 0, bass: 0.1, drums: 0.1, guitar: 0.1 },
        { t: 1000, drums: 0.9, guitar: 0.9, onsetDrums: 0.9, onsetGuitar: 0.9 },
        { t: 3000, drums: 0.1, guitar: 0.1 },
      ],
    },
    authored: [
      {
        t: 1000,
        endMs: 1400,
        layer: 'guitar',
        label: 'riff',
        detail: 'curated',
        intensity: 0.8,
        cueType: 'guitar_riff',
      },
    ],
  });

  const riffNear = riffOnly.events.filter((e) => Math.abs(e.t - 1000) <= 180);
  assert.ok(riffNear.some((e) => e.type === 'guitar_riff'));
  assert.equal(riffNear.some((e) => e.type === 'drum_fill' || e.type === 'guitar_strum'), false);
});
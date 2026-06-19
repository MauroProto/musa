import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSensoryScore } from './sensory-score.ts';
import {
  energyFromStemAnalysis,
  grooveBeatsFromStemAnalysis,
  hapticEventsFromStemAnalysis,
  momentsFromStemAnalysis,
  vocalEnergyFromStemAnalysis,
} from './stem-sensory.ts';
import type { StemAnalysis, SyncedLine } from './types.ts';

function stem(frames: StemAnalysis['frames']): StemAnalysis {
  return {
    source: 'lalal-local',
    durationMs: 10000,
    bpm: 96,
    frames,
  };
}

function line(startMs: number, text: string): SyncedLine {
  return { startMs, text };
}

test('energyFromStemAnalysis weights bass and drums into a normalized energy curve', () => {
  const energy = energyFromStemAnalysis(stem([
    { t: 0, bass: 0.1, drums: 0.1, guitar: 0.1, vocals: 0.1 },
    { t: 500, bass: 0.9, drums: 0.7, guitar: 0.3, vocals: 0.2 },
    { t: 1000, bass: 0.2, drums: 0.1, guitar: 0.9, vocals: 0.1 },
  ]));

  assert.equal(energy.length, 3);
  assert.ok(energy[1].value > energy[0].value, 'bass/drum hit should lift energy');
  assert.ok(energy[1].value > energy[2].value, 'low-end and drums should carry more tactile weight than guitar alone');
  assert.ok(energy.every((p) => p.value >= 0 && p.value <= 1));
});

test('vocalEnergyFromStemAnalysis tracks the voice and stays inside 0..1', () => {
  const vocal = vocalEnergyFromStemAnalysis(stem([
    { t: 0, vocals: 0.0 },
    { t: 250, vocals: 0.9, onsetVocals: 0.95 },
    { t: 500, vocals: 0.85 },
    { t: 750, vocals: 0.05 },
    { t: 1000, vocals: 0.0 },
  ]));

  assert.equal(vocal.length, 5);
  assert.ok(vocal.every((p) => p.value >= 0 && p.value <= 1));
  assert.ok(vocal[2].value > vocal[0].value, 'envelope should rise while the voice is present');
  assert.ok(vocal[4].value < vocal[2].value, 'envelope should decay after the voice stops');
});

test('vocalEnergyFromStemAnalysis reacts to a sharp onset even with modest RMS', () => {
  const vocal = vocalEnergyFromStemAnalysis(stem([
    { t: 0, vocals: 0.1, onsetVocals: 0.1 },
    { t: 250, vocals: 0.2, onsetVocals: 0.9 },
  ]));
  assert.ok(vocal[1].value > vocal[0].value, 'a vocal transient should lift the envelope');
});

test('buildSensoryScore attaches a vocal envelope for stem-backed tracks only', () => {
  const stemScore = buildSensoryScore({
    lines: [line(0, 'a'), line(2000, 'b')],
    stemAnalysis: stem([
      { t: 0, vocals: 0.1 },
      { t: 500, vocals: 0.8, onsetVocals: 0.7 },
      { t: 1000, vocals: 0.2 },
    ]),
  });
  assert.ok(stemScore.vocalEnergy && stemScore.vocalEnergy.length === 3);

  const semanticScore = buildSensoryScore({ lines: [line(0, 'a'), line(2000, 'b')] });
  assert.equal(semanticScore.vocalEnergy, undefined);
});

test('grooveBeatsFromStemAnalysis locks the beat grid to the strongest drum phase', () => {
  const analysis = stem([
    { t: 0, drums: 0.08, bass: 0.1 },
    { t: 125, drums: 0.92, bass: 0.2 },
    { t: 500, drums: 0.1, bass: 0.08 },
    { t: 625, drums: 0.96, bass: 0.25 },
    { t: 1000, drums: 0.12, bass: 0.1 },
    { t: 1125, drums: 0.86, bass: 0.3 },
  ]);
  analysis.bpm = 120;
  const beats = grooveBeatsFromStemAnalysis(analysis);

  assert.ok(beats.length >= 3);
  assert.ok(beats[0] >= 90 && beats[0] <= 160, `first beat should lock near the drum phase, got ${beats[0]}`);
  assert.ok(beats[1] - beats[0] >= 480 && beats[1] - beats[0] <= 520);
});

test('hapticEventsFromStemAnalysis emits bass pulses and drum fills from real stem peaks', () => {
  const events = hapticEventsFromStemAnalysis(stem([
    { t: 0, bass: 0.1, drums: 0.1 },
    { t: 500, bass: 0.84, drums: 0.2 },
    { t: 1000, bass: 0.2, drums: 0.78 },
    { t: 1250, bass: 0.25, drums: 0.86 },
    { t: 1500, bass: 0.3, drums: 0.9 },
    { t: 2500, bass: 0.9, drums: 0.25 },
  ]));

  assert.ok(events.some((e) => e.type === 'bass_pulse' && e.t === 500));
  assert.ok(events.some((e) => e.type === 'drum_fill' && e.t === 1000));
});

test('hapticEventsFromStemAnalysis emits guitar strums for prominent guitar attacks', () => {
  const events = hapticEventsFromStemAnalysis(stem([
    { t: 0, guitar: 0.12, drums: 0.2, bass: 0.1 },
    { t: 500, guitar: 0.88, drums: 0.25, bass: 0.15 },
    { t: 1000, guitar: 0.22, drums: 0.22, bass: 0.12 },
    { t: 1500, guitar: 0.84, drums: 0.3, bass: 0.2 },
    { t: 2500, guitar: 0.18, drums: 0.18, bass: 0.15 },
  ]));

  assert.ok(events.some((e) => e.type === 'guitar_strum' && e.t === 500));
});

test('hapticEventsFromStemAnalysis emits sparse drum fills for isolated strong attacks', () => {
  const events = hapticEventsFromStemAnalysis(stem([
    { t: 0, drums: 0.12 },
    { t: 500, drums: 0.88 },
    { t: 1000, drums: 0.22 },
    { t: 1500, drums: 0.86 },
    { t: 2500, drums: 0.18 },
    { t: 3200, drums: 0.92 },
  ]));
  const fills = events.filter((e) => e.type === 'drum_fill');

  assert.deepEqual(fills.map((e) => e.t), [500, 3200]);
});

test('hapticEventsFromStemAnalysis prefers onset (transient) over RMS to catch quiet-but-sharp attacks', () => {
  // Same frame has moderate RMS guitar (0.45) but a sharp attack (onset 0.86).
  // Old RMS-only path (threshold 0.70) would miss this; onset path must catch it.
  const events = hapticEventsFromStemAnalysis(stem([
    { t: 0, guitar: 0.1, onsetGuitar: 0.2 },
    { t: 500, guitar: 0.45, onsetGuitar: 0.86 },
    { t: 1000, guitar: 0.2, onsetGuitar: 0.25 },
  ]));

  assert.ok(
    events.some((e) => e.type === 'guitar_strum' && e.t === 500),
    'a sharp transient with low RMS should still emit a guitar_strum via onset',
  );
});

test('hapticEventsFromStemAnalysis ignores transient noise below the onset threshold', () => {
  const events = hapticEventsFromStemAnalysis(stem([
    { t: 0, guitar: 0.1, onsetGuitar: 0.4 },
    { t: 500, guitar: 0.45, onsetGuitar: 0.5 },
    { t: 1000, guitar: 0.2, onsetGuitar: 0.42 },
  ]));

  assert.equal(
    events.some((e) => e.type === 'guitar_strum'),
    false,
    'onset below threshold should not over-trigger',
  );
});

test('momentsFromStemAnalysis explains bass, drums, and guitar layers', () => {
  const moments = momentsFromStemAnalysis(stem([
    { t: 0, bass: 0.1, drums: 0.1, guitar: 0.1, vocals: 0.2 },
    { t: 500, bass: 0.86, drums: 0.2, guitar: 0.2, vocals: 0.2 },
    { t: 1500, bass: 0.2, drums: 0.9, guitar: 0.3, vocals: 0.2 },
    { t: 2500, bass: 0.25, drums: 0.2, guitar: 0.88, vocals: 0.2 },
  ]));

  assert.ok(moments.some((m) => m.layer === 'bass' && m.label === 'Bass locks in'));
  assert.ok(moments.some((m) => m.layer === 'drums' && m.label === 'Drum attack'));
  assert.ok(moments.some((m) => m.layer === 'guitar' && m.label === 'Guitar texture opens'));
});

test('buildSensoryScore can use LALAL stem analysis as its tactile source', () => {
  const lines = [
    line(0, 'First phrase'),
    line(2000, 'Second phrase'),
    line(4000, 'Third phrase'),
  ];
  const score = buildSensoryScore({
    lines,
    stemAnalysis: stem([
      { t: 0, bass: 0.1, drums: 0.1, guitar: 0.1, vocals: 0.2 },
      { t: 500, bass: 0.9, drums: 0.2, guitar: 0.1, vocals: 0.2 },
      { t: 1000, bass: 0.2, drums: 0.83, guitar: 0.2, vocals: 0.2 },
      { t: 1250, bass: 0.2, drums: 0.9, guitar: 0.2, vocals: 0.2 },
      { t: 1500, bass: 0.2, drums: 0.88, guitar: 0.2, vocals: 0.2 },
    ]),
  });

  assert.equal(score.source, 'lalal-local');
  assert.equal(score.bpm, 96);
  assert.ok(score.events.some((e) => e.type === 'bass_pulse' && e.t === 500));
  assert.ok(score.events.some((e) => e.type === 'drum_fill' && e.t === 1000));
  assert.ok(score.moments.some((m) => m.label === 'Bass locks in'));
});

test('buildSensoryScore uses stem groove beats before the first lyric starts', () => {
  const score = buildSensoryScore({
    lines: [
      line(3000, 'First vocal phrase'),
      line(5000, 'Second vocal phrase'),
    ],
    stemAnalysis: stem([
      { t: 0, drums: 0.1, bass: 0.1 },
      { t: 125, drums: 0.9, bass: 0.2 },
      { t: 625, drums: 0.94, bass: 0.25 },
      { t: 1125, drums: 0.85, bass: 0.3 },
      { t: 1625, drums: 0.88, bass: 0.35 },
    ]),
  });

  assert.ok(score.beats[0] < 500, `stem groove should start before vocals, got ${score.beats[0]}`);
});

test('buildSensoryScore prioritizes stem haptics over lyric taps when they collide', () => {
  const score = buildSensoryScore({
    lines: [
      line(500, 'First vocal phrase'),
      line(2500, 'Second vocal phrase'),
    ],
    stemAnalysis: stem([
      { t: 0, bass: 0.1, drums: 0.1 },
      { t: 500, bass: 0.9, drums: 0.2 },
      { t: 1000, bass: 0.1, drums: 0.1 },
    ]),
  });

  const collision = score.events.filter((event) => Math.abs(event.t - 500) < 180);
  assert.ok(collision.some((event) => event.type === 'bass_pulse'));
  assert.equal(collision.some((event) => event.type === 'line_start'), false);
});

/**
 * MUSA — Authored "tactile screenplay" for the Dani California demo.
 *
 * Why this exists: amplitude-based auto-detection (RMS/onset) cannot recover
 * musical MEANING. Dani California's iconic intro riff plays at guitar RMS
 * ~0.4–0.5 while later choruses reach 1.0, so any amplitude threshold either
 * misses the riff or over-triggers everywhere else. The riff is the song's
 * defining feature, so it must be AUTHORED, not detected.
 *
 * These curated moments override auto-detected moments of the same layer in
 * their time window, and their cues are injected into the haptic stream with
 * type-priority so they win collisions.
 *
 * Timings are based on the real song structure and MUST be verified by ear
 * against the stems during the Expo Go smoke test (see HANDOFF / Phase 5).
 */
import type { AuthoredMoment } from './types';
import { DANI_CALIFORNIA_TRACK_ID } from './demo-score-tracks.ts';

export const DANI_CALIFORNIA_SCREENPLAY: AuthoredMoment[] = [
  {
    t: 0,
    endMs: 7500,
    layer: 'drums',
    label: 'Drums count us in',
    detail: 'Chad Smith’s snare-heavy intro sets the tempo before anything else.',
    intensity: 0.6,
    mood: 'driving',
    cueType: 'drum_fill',
  },
  {
    t: 7500,
    endMs: 15500,
    layer: 'guitar',
    label: 'The signature riff',
    detail: 'Frusciante’s choppy funk guitar — the part that defines the whole song.',
    intensity: 0.8,
    mood: 'driving',
    cueType: 'guitar_strum',
    repeatEveryMs: 760,
  },
  {
    t: 15580,
    endMs: 45000,
    layer: 'bass',
    label: 'Bass walks under the vocal',
    detail: 'Verse 1: "Gettin’ born in the state of Mississippi…". Flea’s bass carries the body.',
    intensity: 0.6,
    mood: 'driving',
    cueType: 'bass_pulse',
    repeatEveryMs: 1500,
  },
  {
    t: 45000,
    endMs: 56000,
    layer: 'structure',
    label: 'Tension climbs to the hook',
    detail: 'Pre-chorus build — "Lookin’ down the barrel…" pushes toward the chorus.',
    intensity: 0.6,
    mood: 'tense',
    cueType: 'energy_rise',
  },
  {
    t: 56460,
    endMs: 76500,
    layer: 'structure',
    label: 'First chorus — full band hit',
    detail: 'The payoff: "California, rest in peace". Every layer lands together.',
    intensity: 1,
    mood: 'euphoric',
    cueType: 'chorus',
  },
  {
    t: 137120,
    endMs: 156000,
    layer: 'emotion',
    label: 'Bridge — "Who knew"',
    detail: 'The song turns inward; the arrangement thins and the mood shifts.',
    intensity: 0.6,
    mood: 'melancholic',
    cueType: 'mood_shift',
  },
  {
    t: 190000,
    endMs: 230000,
    layer: 'guitar',
    label: 'Guitar solo opens up',
    detail: 'Frusciante breaks free — sustained, singing lead lines over the groove.',
    intensity: 0.8,
    mood: 'euphoric',
    cueType: 'guitar_strum',
    repeatEveryMs: 520,
  },
];

export const AUTHORED_SCREENPLAYS: Record<number, AuthoredMoment[]> = {
  [DANI_CALIFORNIA_TRACK_ID]: DANI_CALIFORNIA_SCREENPLAY,
};

export function getAuthoredScreenplay(trackId: number): AuthoredMoment[] | undefined {
  return AUTHORED_SCREENPLAYS[trackId];
}

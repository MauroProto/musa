import type { SyncedLine, Track } from './types';

export const DEMO_TRACKS: Track[] = [
  {
    trackId: 9001,
    title: 'Slow Light',
    artist: 'MUSA Demo',
    album: 'Sensory Score Vol. 1',
    hasSubtitles: true,
    instrumental: false,
    durationMs: 78000,
  },
  {
    trackId: 9002,
    title: 'Underwater',
    artist: 'MUSA Demo',
    album: 'Sensory Score Vol. 1',
    hasSubtitles: true,
    instrumental: false,
    durationMs: 92000,
  },
];

const SLOW_LIGHT: SyncedLine[] = [
  { startMs: 0, text: 'The room goes quiet when you walk in' },
  { startMs: 3600, text: 'I feel the floor begin to hum' },
  { startMs: 7200, text: 'A slow light climbing up your spine' },
  { startMs: 10800, text: 'And I am already gone' },
  { startMs: 15000, text: 'Hold the line, hold it slow' },
  { startMs: 18000, text: 'Let the glow, let it grow' },
  { startMs: 21000, text: 'We are light, we are low' },
  { startMs: 24000, text: 'Watch it overflow' },
  { startMs: 33000, text: 'You move like weather I can almost hear' },
  { startMs: 36600, text: 'A long, long breath across the year' },
  { startMs: 42000, text: 'And I keep counting every shade' },
  { startMs: 45600, text: 'Of the quiet you made' },
  { startMs: 54000, text: 'Hold the line, hold it slow' },
  { startMs: 57000, text: 'Let the glow, let it grow' },
  { startMs: 60000, text: 'We are light, we are low' },
  { startMs: 63000, text: 'Watch it overflow' },
  { startMs: 72000, text: 'Slow light, slow light, letting go' },
];

const UNDERWATER: SyncedLine[] = [
  { startMs: 0, text: 'Below the surface everything is blue' },
  { startMs: 4000, text: 'Below the surface I can almost hear you' },
  { startMs: 8000, text: 'The bass is heavy and the air is thin' },
  { startMs: 12000, text: 'I learn the shape of the dark by touch' },
  { startMs: 22000, text: 'Pull me under, pull me down' },
  { startMs: 25000, text: 'Turn the silence into sound' },
  { startMs: 28000, text: 'We are heavier than the sea' },
  { startMs: 31000, text: 'Sinking slowly, staying free' },
  { startMs: 42000, text: 'A long blue note that never finds the floor' },
  { startMs: 49000, text: 'And I would follow it for evermore' },
  { startMs: 56000, text: 'Pull me under, pull me down' },
  { startMs: 59000, text: 'Turn the silence into sound' },
  { startMs: 62000, text: 'We are heavier than the sea' },
  { startMs: 65000, text: 'Sinking slowly, staying free' },
  { startMs: 78000, text: 'Underwater, underwater, still' },
];

export const DEMO_LYRICS: Record<number, SyncedLine[]> = {
  9001: SLOW_LIGHT,
  9002: UNDERWATER,
};

export function isDemoTrack(trackId: number): boolean {
  return trackId >= 9000 && DEMO_LYRICS[trackId] !== undefined;
}

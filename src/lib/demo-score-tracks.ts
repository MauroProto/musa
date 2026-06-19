export const DANI_CALIFORNIA_TRACK_ID = 95574135;
export const ORDINARY_TRACK_ID = 324489197;

export const STEM_DEMO_TRACK_IDS = new Set([
  DANI_CALIFORNIA_TRACK_ID,
  ORDINARY_TRACK_ID,
]);

export function isStemDemoTrack(trackId: number): boolean {
  return STEM_DEMO_TRACK_IDS.has(trackId);
}

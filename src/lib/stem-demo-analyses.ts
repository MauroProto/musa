import type { StemAnalysis } from './types';
import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID, STEM_DEMO_TRACK_IDS } from './demo-score-tracks.ts';
import { DANI_CALIFORNIA_STEM_ANALYSIS } from './generated/dani-california-stem-analysis.ts';
import { ORDINARY_STEM_ANALYSIS } from './generated/ordinary-stem-analysis.ts';

const STEM_DEMO_ANALYSES: Record<number, StemAnalysis> = {
  [DANI_CALIFORNIA_TRACK_ID]: DANI_CALIFORNIA_STEM_ANALYSIS,
  [ORDINARY_TRACK_ID]: ORDINARY_STEM_ANALYSIS,
};

export { STEM_DEMO_TRACK_IDS };

export function getStemDemoAnalysis(trackId: number): StemAnalysis | undefined {
  return STEM_DEMO_ANALYSES[trackId];
}

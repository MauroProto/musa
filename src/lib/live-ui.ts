export const LIVE_DISCOVER_COPY = {
  title: 'Live',
  subtitle: 'A concert companion for your pocket. Feel the setlist in sync while the music plays in the room.',
  nowSectionTitle: 'On air now',
  nowSectionKicker: 'Virtual show',
  howTitle: 'How it feels',
  howBody: 'MUSA runs the same sensory engine as the player, tuned stronger for in-pocket haptics. Your phone stays silent.',
} as const;

export function liveSectionGap(width: number): number {
  return width < 420 ? 26 : 32;
}

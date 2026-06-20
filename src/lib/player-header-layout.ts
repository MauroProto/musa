export function playerHeaderRailWidth({
  buttonSize,
  actionCount,
  gap,
}: {
  buttonSize: number;
  actionCount: number;
  gap: number;
}): number {
  if (actionCount <= 0) return 0;
  return buttonSize * actionCount + gap * Math.max(0, actionCount - 1);
}

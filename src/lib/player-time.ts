export function seekByDeltaMs(currentMs: number, durationMs: number, deltaMs: number): number {
  return clampMs(currentMs + deltaMs, durationMs);
}

export function seekRatioToMs(ratio: number, durationMs: number): number {
  return clampMs(Math.round(durationMs * ratio), durationMs);
}

export function seekToMs(targetMs: number, durationMs: number): number {
  return clampMs(targetMs, durationMs);
}

function clampMs(value: number, durationMs: number): number {
  return Math.max(0, Math.min(Math.max(0, durationMs), value));
}

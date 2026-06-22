const MOMENT_NAV_GRACE_MS = 750;

type MomentStart = { t: number };

export function seekByDeltaMs(currentMs: number, durationMs: number, deltaMs: number): number {
  return clampMs(currentMs + deltaMs, durationMs);
}

export function seekRatioToMs(ratio: number, durationMs: number): number {
  return clampMs(Math.round(durationMs * ratio), durationMs);
}

export function seekToMs(targetMs: number, durationMs: number): number {
  return clampMs(targetMs, durationMs);
}

export function previousMomentMs(currentMs: number, moments: MomentStart[]): number {
  const starts = momentStarts(moments);
  const cutoff = Math.max(0, currentMs - MOMENT_NAV_GRACE_MS);
  for (let i = starts.length - 1; i >= 0; i -= 1) {
    if (starts[i] < cutoff) return starts[i];
  }
  return 0;
}

export function nextMomentMs(currentMs: number, moments: MomentStart[], durationMs: number): number {
  const starts = momentStarts(moments);
  const cutoff = currentMs + MOMENT_NAV_GRACE_MS;
  const target = starts.find((t) => t > cutoff);
  return target === undefined ? clampMs(currentMs, durationMs) : clampMs(target, durationMs);
}

export function replayMomentMs(currentMs: number, moments: MomentStart[]): number {
  const starts = momentStarts(moments);
  const cutoff = currentMs + MOMENT_NAV_GRACE_MS;
  for (let i = starts.length - 1; i >= 0; i -= 1) {
    if (starts[i] <= cutoff) return starts[i];
  }
  return 0;
}

function clampMs(value: number, durationMs: number): number {
  return Math.max(0, Math.min(Math.max(0, durationMs), value));
}

function momentStarts(moments: MomentStart[]): number[] {
  const starts = moments
    .map((m) => Math.round(m.t))
    .filter((t) => Number.isFinite(t) && t >= 0)
    .sort((a, b) => a - b);
  return starts.filter((t, index) => index === 0 || t !== starts[index - 1]);
}

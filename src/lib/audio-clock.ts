export type AudioClockSnapshot = {
  isLoaded: boolean;
  currentTime: number;
  playing: boolean;
  playbackRequested: boolean;
  seekPending?: boolean;
  lastAcceptedMs?: number;
  maxBackwardJumpMs?: number;
};

export function audioClockMs(snapshot: AudioClockSnapshot): number | null {
  if (!snapshot.isLoaded) return null;
  if (snapshot.seekPending) return null;
  if (!snapshot.playing && !snapshot.playbackRequested) return null;
  if (!Number.isFinite(snapshot.currentTime) || snapshot.currentTime < 0) return null;
  const nextMs = snapshot.currentTime * 1000;
  const lastAcceptedMs = snapshot.lastAcceptedMs;
  if (
    lastAcceptedMs !== undefined &&
    Number.isFinite(lastAcceptedMs) &&
    lastAcceptedMs > 0 &&
    nextMs + (snapshot.maxBackwardJumpMs ?? 0) < lastAcceptedMs
  ) {
    return null;
  }
  return nextMs;
}

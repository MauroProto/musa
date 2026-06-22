export type AudioClockSnapshot = {
  isLoaded: boolean;
  currentTime: number;
  playing: boolean;
  playbackRequested: boolean;
  seekPending?: boolean;
};

export function audioClockMs(snapshot: AudioClockSnapshot): number | null {
  if (!snapshot.isLoaded) return null;
  if (snapshot.seekPending) return null;
  if (!snapshot.playing && !snapshot.playbackRequested) return null;
  if (!Number.isFinite(snapshot.currentTime) || snapshot.currentTime < 0) return null;
  return snapshot.currentTime * 1000;
}

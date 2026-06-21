import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from './demo-score-tracks.ts';

export type AlbumArtMeta = {
  fileName: string;
  sourceUrl: string;
  sourceName: string;
};

export const DEMO_ALBUM_ART: Record<number, AlbumArtMeta> = {
  [DANI_CALIFORNIA_TRACK_ID]: {
    fileName: 'dani-california-stadium-arcadium.jpg',
    sourceName: 'Apple Music / iTunes Search API',
    sourceUrl: 'https://music.apple.com/us/album/dani-california/945562992?i=945568998',
  },
  [ORDINARY_TRACK_ID]: {
    fileName: 'ordinary-alex-warren.jpg',
    sourceName: 'Apple Music / iTunes Search API',
    sourceUrl: 'https://music.apple.com/us/album/ordinary/1793663382?i=1793663645',
  },
};

export function albumArtForTrack(trackId: number): AlbumArtMeta | null {
  return DEMO_ALBUM_ART[trackId] ?? null;
}

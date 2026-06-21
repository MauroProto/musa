import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Icon } from '../Icon';
import { Theme } from '../../constants/theme';
import { DANI_CALIFORNIA_TRACK_ID, ORDINARY_TRACK_ID } from '../../lib/demo-score-tracks';
import type { Track } from '../../lib/types';

const LOCAL_ALBUM_ART: Record<number, ImageSourcePropType> = {
  [DANI_CALIFORNIA_TRACK_ID]: require('../../../assets/images/albums/dani-california-stadium-arcadium.jpg'),
  [ORDINARY_TRACK_ID]: require('../../../assets/images/albums/ordinary-alex-warren.jpg'),
};

export function albumArtworkSourceForTrack(track: Pick<Track, 'trackId' | 'artworkUrl'>): ImageSourcePropType | null {
  return LOCAL_ALBUM_ART[track.trackId] ?? (track.artworkUrl ? { uri: track.artworkUrl } : null);
}

export function AlbumArtwork({
  track,
  size = 58,
  radius = 8,
}: {
  track: Pick<Track, 'trackId' | 'artworkUrl' | 'title'>;
  size?: number;
  radius?: number;
}) {
  const source = albumArtworkSourceForTrack(track);
  const style = { width: size, height: size, borderRadius: radius };

  if (!source) {
    return (
      <View style={[styles.fallback, style]} accessibilityLabel={`${track.title} artwork`}>
        <Icon name="music" size={Math.round(size * 0.38)} color={Theme.textDim} />
      </View>
    );
  }

  return <Image source={source} style={style} resizeMode="cover" accessibilityLabel={`${track.title} artwork`} />;
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
  },
});

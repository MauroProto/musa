import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Touch } from '../ui';
import { AlbumArtwork } from './AlbumArtwork';
import { Theme } from '../../constants/theme';
import type { Track } from '../../lib/types';

export function DemoTrackShelf({
  tracks,
  onTrackPress,
}: {
  tracks: Track[];
  onTrackPress: (track: Track) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text variant="heading">Made for MUSA</Text>
        <Text variant="label" color={Theme.textFaint}>Stems</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroller}>
        {tracks.map((track) => (
          <Touch
            key={track.trackId}
            onPress={() => onTrackPress(track)}
            style={styles.card}
            scaleTo={0.98}
            accessibilityLabel={`Play ${track.title} by ${track.artist}`}
          >
            <AlbumArtwork track={track} size={132} radius={8} />
            <View style={styles.cardCopy}>
              <Text variant="caption" weight="800" numberOfLines={1}>{track.title}</Text>
              <Text variant="label" color={Theme.textFaint} numberOfLines={1}>{track.artist}</Text>
            </View>
          </Touch>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  scroller: {
    gap: 14,
    paddingRight: 4,
  },
  card: {
    width: 132,
    gap: 9,
  },
  cardCopy: {
    gap: 2,
    minWidth: 0,
  },
});

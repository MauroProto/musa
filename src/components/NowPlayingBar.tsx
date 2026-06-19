import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon } from './Icon';
import { Text } from './ui';
import { GlassSurface } from './Glass';
import { Theme, RADIUS } from '../constants/theme';
import { usePreferences } from '../store/preferences';

/**
 * "Now playing" bar — a quick way back to the song you were just in. Sits above
 * the tab bar on the main screens; tap it to reopen the player for that track.
 */
export function NowPlayingBar() {
  const np = usePreferences((s) => s.nowPlaying);
  if (!np) return null;

  return (
    <GlassSurface
      onPress={() =>
        router.push({
          pathname: '/player',
          params: {
            trackId: String(np.trackId),
            title: np.title,
            artist: np.artist,
            durationMs: String(np.durationMs ?? ''),
          },
        })
      }
      radius={RADIUS.pill}
      elevation="bar"
      scaleTo={0.99}
      accessibilityLabel={`Back to player: ${np.title} by ${np.artist}`}
      style={styles.bar}
    >
      <View style={styles.iconWrap}>
        <Icon name="play" size={14} weight="fill" color={Theme.accentText} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="caption" weight="700" numberOfLines={1}>{np.title}</Text>
        <Text variant="label" color={Theme.textFaint} numberOfLines={1} style={{ letterSpacing: 0 }}>
          {np.artist}
        </Text>
      </View>
      <Icon name="chevronRight" size={16} color={Theme.textDim} />
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.accent,
  },
});

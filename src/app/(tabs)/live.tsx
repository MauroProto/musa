import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen, Text } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { ShowCard } from '../../components/live/ShowCard';
import { LiveBadge } from '../../components/live/LiveBadge';
import { GlassSurface } from '../../components/Glass';
import { Theme, RADIUS } from '../../constants/theme';
import { liveShows, upcomingShows, type Concert } from '../../lib/live-shows';

/**
 * MUSA Live — Discover. Find a show that's on air (or coming up) and join to feel
 * it. Tapping a show opens its lobby.
 */
export default function LiveDiscoverScreen() {
  const live = liveShows();
  const upcoming = upcomingShows();

  function openShow(show: Concert) {
    router.push({ pathname: '/live/[showId]', params: { showId: show.id } });
  }

  return (
    <Screen scroll bottomBarSpace pad={20}>
      <View style={{ gap: 8 }}>
        <View style={styles.titleRow}>
          <Text variant="largeTitle">Live</Text>
          {live.length > 0 ? <LiveBadge label={`${live.length} ON AIR`} /> : null}
        </View>
        <Text dim>
          Feel a concert in real time. Keep your phone in your pocket — the show plays through your skin while you watch the stage.
        </Text>
      </View>

      {live.length > 0 ? (
        <View style={{ gap: 12 }}>
          <Text variant="heading">Happening now</Text>
          {live.map((show) => (
            <ShowCard key={show.id} show={show} onPress={() => openShow(show)} />
          ))}
        </View>
      ) : null}

      {upcoming.length > 0 ? (
        <View style={{ gap: 12 }}>
          <Text variant="heading">Coming up</Text>
          {upcoming.map((show) => (
            <ShowCard key={show.id} show={show} onPress={() => openShow(show)} />
          ))}
        </View>
      ) : null}

      <GlassSurface radius={RADIUS.card} elevation="none" style={styles.howCard}>
        <View style={styles.howRow}>
          <View style={styles.howIcon}><Icon name="vibrate" size={17} color={Theme.text} /></View>
          <Text variant="caption" dim style={{ flex: 1 }}>
            Haptics fire from the same sensory engine as the player — tuned stronger for in-pocket feel. No audio plays on your phone; the music is in the room.
          </Text>
        </View>
      </GlassSurface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  howCard: { padding: 16 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  howIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
  },
});

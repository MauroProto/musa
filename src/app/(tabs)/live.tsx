import { router } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Screen, Text } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { ShowCard } from '../../components/live/ShowCard';
import { LiveBadge } from '../../components/live/LiveBadge';
import { GlassSurface } from '../../components/Glass';
import { Theme, RADIUS } from '../../constants/theme';
import { liveShows, upcomingShows, type Concert } from '../../lib/live-shows';
import { LIVE_DISCOVER_COPY, liveSectionGap } from '../../lib/live-ui';

/**
 * MUSA Live — Discover. Find a show that's on air (or coming up) and join to feel
 * it. Tapping a show opens its lobby.
 */
export default function LiveDiscoverScreen() {
  const { width } = useWindowDimensions();
  const live = liveShows();
  const upcoming = upcomingShows();
  const sectionGap = liveSectionGap(width);
  const maxContentWidth = width < 700 ? 350 : 520;
  const contentWidth = Math.max(280, Math.min(width - 40, maxContentWidth));

  function openShow(show: Concert) {
    router.push({ pathname: '/live/[showId]', params: { showId: show.id } });
  }

  return (
    <Screen scroll bottomBarSpace pad={0}>
      <View style={[styles.header, styles.contentFrame, { width: contentWidth }]}>
        <View style={styles.titleRow}>
          <Text variant="largeTitle">{LIVE_DISCOVER_COPY.title}</Text>
          {live.length > 0 ? <LiveBadge label={`${live.length} ON AIR`} /> : null}
        </View>
        <Text dim style={styles.subtitle}>{LIVE_DISCOVER_COPY.subtitle}</Text>
      </View>

      {live.length > 0 ? (
        <View style={[styles.contentFrame, { width: contentWidth, gap: 12, marginTop: sectionGap - 20 }]}>
          <SectionHeader title={LIVE_DISCOVER_COPY.nowSectionTitle} kicker={LIVE_DISCOVER_COPY.nowSectionKicker} />
          {live.map((show) => (
            <ShowCard key={show.id} show={show} onPress={() => openShow(show)} />
          ))}
        </View>
      ) : null}

      {upcoming.length > 0 ? (
        <View style={[styles.contentFrame, { width: contentWidth, gap: 12, marginTop: sectionGap - 20 }]}>
          <SectionHeader title="Coming up" kicker={`${upcoming.length} scheduled`} />
          {upcoming.map((show) => (
            <ShowCard key={show.id} show={show} onPress={() => openShow(show)} />
          ))}
        </View>
      ) : null}

      <GlassSurface radius={RADIUS.card} elevation="none" style={[styles.howCard, { width: contentWidth, marginLeft: 20, marginTop: sectionGap - 18 }]}>
        <View style={styles.howRow}>
          <View style={styles.howIcon}><Icon name="vibrate" size={17} color={Theme.text} /></View>
          <View style={styles.howCopy}>
            <Text variant="label" color={Theme.textFaint} style={styles.kicker}>{LIVE_DISCOVER_COPY.howTitle}</Text>
            <Text variant="caption" dim>{LIVE_DISCOVER_COPY.howBody}</Text>
          </View>
        </View>
      </GlassSurface>
    </Screen>
  );
}

function SectionHeader({ title, kicker }: { title: string; kicker: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionRule} />
      <View style={styles.sectionText}>
        <Text variant="label" color={Theme.textFaint} style={styles.kicker}>{kicker}</Text>
        <Text variant="heading">{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentFrame: { alignSelf: 'flex-start', marginLeft: 20 },
  header: { gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subtitle: {
    maxWidth: 460,
  },
  sectionHeader: {
    gap: 10,
  },
  sectionRule: {
    width: 44,
    height: 2,
    borderRadius: 1,
    backgroundColor: Theme.text,
  },
  sectionText: {
    gap: 2,
  },
  kicker: {
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  howCard: { padding: 14, backgroundColor: Theme.cardWhisper },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  howCopy: { flex: 1, gap: 3 },
  howIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
  },
});

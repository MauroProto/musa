import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Text, Button, Touch } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { GlassSurface, GlassIconButton } from '../../components/Glass';
import { LiveBadge } from '../../components/live/LiveBadge';
import { SetlistList } from '../../components/live/SetlistList';
import { Theme, RADIUS } from '../../constants/theme';
import { featuredLiveEntryIndex, getShowById } from '../../lib/live-shows';
import { useLive } from '../../store/live';

/**
 * Lobby — you've tapped a show. Confirm you're connected, see the setlist, and
 * choose how to experience it: pocket mode (attendee) or the mocked stage
 * console (artist).
 */
export default function LiveLobbyScreen() {
  const { showId } = useLocalSearchParams<{ showId: string }>();
  const insets = useSafeAreaInsets();
  const show = getShowById(showId ?? '');
  const join = useLive((s) => s.join);
  const startEntry = useLive((s) => s.hostStartEntry);

  // Pre-join in auto mode so the connection reads as established.
  useEffect(() => {
    if (show) join(show, 'auto');
  }, [show, join]);

  if (!show) {
    return (
      <Screen scroll pad={20}>
        <View style={{ paddingTop: insets.top, gap: 12 }}>
          <Text variant="largeTitle">Show not found</Text>
          <Button label="Back to Live" variant="secondary" onPress={() => router.replace('/live')} />
        </View>
      </Screen>
    );
  }

  const isLive = show.status === 'live';
  const featuredEntry = show.setlist[featuredLiveEntryIndex(show)] ?? show.setlist[0] ?? null;

  function enterPocket() {
    join(show!, 'auto');
    startEntry(featuredLiveEntryIndex(show!));
    router.push({ pathname: '/live/[showId]/pocket', params: { showId: show!.id } });
  }
  function openHost() {
    router.push({ pathname: '/live/[showId]/host', params: { showId: show!.id } });
  }

  return (
    <View style={styles.root}>
      <Screen scroll pad={20} bottomBarSpace>
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <GlassIconButton size={42} onPress={() => router.back()} accessibilityLabel="Back">
            <Icon name="back" size={22} color={Theme.text} />
          </GlassIconButton>
          {isLive ? <LiveBadge /> : null}
        </View>

        <View style={{ gap: 6 }}>
          <Text variant="label" color={Theme.textFaint} style={{ letterSpacing: 1 }}>{show.subtitle.toUpperCase()}</Text>
          <Text variant="largeTitle">{show.name}</Text>
          <View style={styles.metaRow}>
            <Icon name="navigation" size={14} color={Theme.textFaint} />
            <Text variant="caption" dim>{show.venue} · {show.city}</Text>
          </View>
        </View>

        <GlassSurface radius={RADIUS.card} elevation="none" style={styles.connectCard}>
          <View style={styles.connectRow}>
            <View style={styles.checkWrap}>
              <Icon name="vibrate" size={18} color={Theme.accentText} weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="700">{isLive ? "You're connected" : 'Reminder set'}</Text>
              <Text variant="caption" dim>
                {isLive
                  ? "Jump into the strongest haptic moment: Ordinary, already tuned with real stems."
                  : "We'll notify you when doors open. Browse the setlist below."}
              </Text>
            </View>
          </View>
        </GlassSurface>

        <View style={{ gap: 12 }}>
          <Text variant="heading">Setlist</Text>
          <SetlistList show={show} />
        </View>

        <View style={{ gap: 10 }}>
          {!isLive ? <Button label="Doors not open yet" variant="secondary" disabled onPress={() => {}} /> : null}
          <Button label="Open stage console (artist)" variant="ghost" onPress={openHost} />
        </View>
      </Screen>

      {isLive && featuredEntry ? (
        <View style={[styles.floatingCtaWrap, { paddingBottom: insets.bottom + 10 }]}>
          <Touch onPress={enterPocket} style={styles.floatingCta} accessibilityLabel={`Enter show at ${featuredEntry.title}`}>
            <Icon name="vibrate" size={16} color={Theme.accentText} weight="fill" />
            <Text variant="caption" weight="700" color={Theme.accentText} numberOfLines={1}>
              Enter show at {featuredEntry.title}
            </Text>
          </Touch>
        </View>
      ) : null}
      </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2 },
  connectCard: { padding: 16 },
  connectRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.accent,
  },
  floatingCtaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  floatingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 330,
    minHeight: 50,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    backgroundColor: Theme.accent,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
  },
});

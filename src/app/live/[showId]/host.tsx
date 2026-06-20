import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Text, Button, Touch } from '../../../components/ui';
import { Icon } from '../../../components/Icon';
import { GlassSurface, GlassIconButton } from '../../../components/Glass';
import { LiveBadge } from '../../../components/live/LiveBadge';
import { SetlistList } from '../../../components/live/SetlistList';
import { Theme, RADIUS } from '../../../constants/theme';
import { getShowById } from '../../../lib/live-shows';
import { activeEntry, nextEntry, progressLabel } from '../../../lib/live-session';
import { useLive } from '../../../store/live';

/**
 * Stage console (mocked artist side). Drives the same concert clock the
 * attendees feel: start the show, jump to any song, advance, or end it. In a
 * real deployment this would broadcast over a realtime channel; here it shares
 * the in-app session store, so a pocket view open on the same device follows
 * along live.
 */
export default function LiveHostScreen() {
  const { showId } = useLocalSearchParams<{ showId: string }>();
  const insets = useSafeAreaInsets();
  const show = getShowById(showId ?? '');

  const session = useLive((s) => s.session);
  const join = useLive((s) => s.join);
  const begin = useLive((s) => s.begin);
  const advance = useLive((s) => s.advance);
  const finish = useLive((s) => s.finish);
  const hostStartEntry = useLive((s) => s.hostStartEntry);

  // Take over as the host (manual drive).
  useEffect(() => {
    if (show) join(show, 'host');
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

  const status = session?.status ?? 'lobby';
  const current = session ? activeEntry(session, show) : null;
  const upNext = session ? nextEntry(session, show) : show.setlist[0] ?? null;
  const progress = session ? progressLabel(session, show) : `0 / ${show.setlist.length}`;
  const ended = status === 'ended';

  const statusText =
    status === 'lobby' ? 'Doors open · ready to start'
      : status === 'live' && current ? `On stage · ${current.title}`
        : status === 'intermission' ? `Intermission · next is ${upNext?.title ?? '—'}`
          : 'Show ended';

  return (
    <Screen scroll pad={20} bottomBarSpace>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <GlassIconButton size={42} onPress={() => router.back()} accessibilityLabel="Back">
          <Icon name="back" size={22} color={Theme.text} />
        </GlassIconButton>
        <View style={styles.consoleTag}>
          <Icon name="faders" size={13} color={Theme.textFaint} />
          <Text variant="label" color={Theme.textFaint} style={{ letterSpacing: 1 }}>STAGE CONSOLE</Text>
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text variant="largeTitle">{show.name}</Text>
        <Text variant="caption" dim>{show.venue} · {show.city}</Text>
      </View>

      <GlassSurface radius={RADIUS.card} elevation="none" style={styles.statusCard}>
        <View style={styles.statusRow}>
          {status === 'live' ? <LiveBadge /> : <View style={[styles.idleDot, ended && { backgroundColor: Theme.textGhost }]} />}
          <Text variant="body" weight="700" style={{ flex: 1 }}>{statusText}</Text>
          <Text variant="mono" color={Theme.textFaint}>{progress}</Text>
        </View>
      </GlassSurface>

      <View style={{ gap: 12 }}>
        <Text variant="heading">Setlist · tap to start a song</Text>
        <SetlistList show={show} session={session} onSelectEntry={ended ? undefined : hostStartEntry} />
      </View>

      <View style={{ gap: 10 }}>
        {status === 'lobby' ? (
          <PrimaryAction icon="play" label="Start show" onPress={begin} />
        ) : status === 'intermission' ? (
          <PrimaryAction icon="skipForward" label={`Start ${upNext?.title ?? 'next song'}`} onPress={advance} />
        ) : status === 'live' ? (
          <PrimaryAction icon="skipForward" label="Next song" onPress={advance} />
        ) : (
          <PrimaryAction icon="forward" label="Reset show" onPress={() => join(show, 'host')} />
        )}
        {!ended ? <Button label="End show" variant="ghost" onPress={finish} /> : null}
      </View>
    </Screen>
  );
}

function PrimaryAction({ icon, label, onPress }: { icon: Parameters<typeof Icon>[0]['name']; label: string; onPress: () => void }) {
  return (
    <Touch onPress={onPress} style={styles.primary} accessibilityLabel={label}>
      <Icon name={icon} size={18} weight="fill" color={Theme.accentText} />
      <Text variant="body" weight="700" color={Theme.accentText}>{label}</Text>
    </Touch>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  consoleTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusCard: { padding: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  idleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.text },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: Theme.accent,
  },
});

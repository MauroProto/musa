import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Text, Button, Touch } from '../../../components/ui';
import { Icon } from '../../../components/Icon';
import { GlassIconButton } from '../../../components/Glass';
import { LiveBadge } from '../../../components/live/LiveBadge';
import { LiveSensoryRunner } from '../../../components/live/LiveSensoryRunner';
import { Theme } from '../../../constants/theme';
import { getShowById } from '../../../lib/live-shows';
import { activeEntry, nextEntry } from '../../../lib/live-session';
import { useLive } from '../../../store/live';

/**
 * Pocket player — the attendee experience. Full-screen, glanceable, tactile.
 * While a song is live the real haptic score fires through {@link LiveSensoryRunner};
 * between songs it rests in an intermission; pocket-dim hides the screen while the
 * haptics keep going.
 */
export default function LivePocketScreen() {
  const { showId } = useLocalSearchParams<{ showId: string }>();
  const insets = useSafeAreaInsets();
  const show = getShowById(showId ?? '');

  // Keep the screen awake so haptics keep firing while the phone is pocketed.
  // (A production build would need native background execution to survive a lock.)
  useKeepAwake();

  const session = useLive((s) => s.session);
  const join = useLive((s) => s.join);
  const begin = useLive((s) => s.begin);
  const reportSongEnded = useLive((s) => s.reportSongEnded);
  const pocketDim = useLive((s) => s.pocketDim);
  const setPocketDim = useLive((s) => s.setPocketDim);

  // Deep-link safety: make sure we're joined to this show.
  useEffect(() => {
    if (show && (!session || session.showId !== show.id)) join(show, 'auto');
  }, [show, session, join]);

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

  return (
    <View style={[styles.fill, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 14 }]}>
      <View style={styles.topBar}>
        <GlassIconButton size={40} onPress={() => router.back()} accessibilityLabel="Leave pocket mode">
          <Icon name="back" size={20} color={Theme.text} />
        </GlassIconButton>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text variant="label" color={Theme.textFaint} numberOfLines={1} style={{ letterSpacing: 1 }}>
            {show.name.toUpperCase()}
          </Text>
        </View>
        {status === 'live' ? (
          <Touch onPress={() => setPocketDim(true)} style={styles.dimBtn} accessibilityLabel="Pocket mode — dim screen">
            <Icon name="display" size={18} color={Theme.text} />
          </Touch>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <View style={styles.body}>
        {status === 'lobby' ? (
          <LobbyState onStart={begin} firstTitle={upNext?.title ?? ''} />
        ) : status === 'live' && current ? (
          <LiveSensoryRunner
            key={`${session?.entryIndex}-${current.trackId}`}
            entry={current}
            onSongEnded={reportSongEnded}
          />
        ) : status === 'intermission' ? (
          <IntermissionState nextTitle={upNext?.title} nextArtist={upNext?.artist} hostDriven={session?.mode === 'host'} />
        ) : (
          <EndedState onExit={() => router.replace('/live')} />
        )}
      </View>

      {pocketDim ? <PocketDimOverlay onWake={() => setPocketDim(false)} /> : null}
    </View>
  );
}

function LobbyState({ onStart, firstTitle }: { onStart: () => void; firstTitle: string }) {
  return (
    <View style={styles.centered}>
      <View style={styles.bigIcon}><Icon name="vibrate" size={34} color={Theme.text} /></View>
      <Text variant="title" align="center">Ready when you are</Text>
      <Text dim align="center" style={{ maxWidth: 300 }}>
        Put your phone where you&apos;ll feel it — pocket, hand, or against you. Press start and watch the stage.
      </Text>
      {firstTitle ? (
        <Text variant="caption" color={Theme.textFaint} align="center">First up · {firstTitle}</Text>
      ) : null}
      <Touch onPress={onStart} style={styles.startBtn} accessibilityLabel="Start feeling the show">
        <Icon name="play" size={18} weight="fill" color={Theme.accentText} />
        <Text variant="body" weight="700" color={Theme.accentText}>Start feeling the show</Text>
      </Touch>
    </View>
  );
}

function IntermissionState({
  nextTitle,
  nextArtist,
  hostDriven,
}: {
  nextTitle?: string;
  nextArtist?: string;
  hostDriven: boolean;
}) {
  return (
    <View style={styles.centered}>
      <View style={styles.bigIcon}><Icon name="wind" size={32} color={Theme.text} /></View>
      <Text variant="label" color={Theme.textFaint} style={{ letterSpacing: 2 }}>BETWEEN SONGS</Text>
      {nextTitle ? (
        <>
          <Text variant="title" align="center">Next · {nextTitle}</Text>
          <Text dim align="center">{nextArtist}</Text>
        </>
      ) : (
        <Text variant="title" align="center">Take a breath</Text>
      )}
      <Text variant="caption" color={Theme.textFaint} align="center" style={{ maxWidth: 280 }}>
        {hostDriven ? 'Waiting for the artist to start the next song.' : "We'll buzz you the moment it kicks back in."}
      </Text>
    </View>
  );
}

function EndedState({ onExit }: { onExit: () => void }) {
  return (
    <View style={styles.centered}>
      <View style={styles.bigIcon}><Icon name="emotion" size={32} color={Theme.text} /></View>
      <Text variant="title" align="center">That&apos;s a wrap</Text>
      <Text dim align="center" style={{ maxWidth: 300 }}>
        You felt the whole set. Hope the room moved through you.
      </Text>
      <Touch onPress={onExit} style={styles.startBtn} accessibilityLabel="Back to Live">
        <Text variant="body" weight="700" color={Theme.accentText}>Back to Live</Text>
      </Touch>
    </View>
  );
}

function PocketDimOverlay({ onWake }: { onWake: () => void }) {
  return (
    <Pressable style={styles.dimOverlay} onPress={onWake} accessibilityLabel="Tap to wake the screen">
      <LiveBadge label="FEELING THE SHOW" />
      <Text variant="caption" color="rgba(255,255,255,0.5)" style={{ marginTop: 14 }}>Tap to wake</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: Theme.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  dimBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
  },
  body: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 28 },
  bigIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.cardStrong,
    marginBottom: 4,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 26,
    borderRadius: 999,
    backgroundColor: Theme.accent,
    marginTop: 10,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050507',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

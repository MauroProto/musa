import { useEffect } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Backdrop } from '../components/Backdrop';
import { Text, Touch, useResponsive, useFontScale } from '../components/ui';
import { Theme } from '../constants/theme';
import { useSensoryPlayer, type SensoryPlayer } from '../hooks/useSensoryPlayer';
import { energyValueAt } from '../lib/sensory-score';
import { PulseLine } from '../components/player/PulseLine';
import { ChorusCountdown } from '../components/player/ChorusCountdown';
import { LyricDisplay } from '../components/player/LyricDisplay';

export default function PlayerScreen() {
  const { isWide } = useResponsive();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    trackId: string;
    title?: string;
    artist?: string;
    durationMs?: string;
    guided?: string;
  }>();
  const trackId = Number(params.trackId ?? 0);

  const player = useSensoryPlayer(trackId, {
    durationMs: params.durationMs ? Number(params.durationMs) : undefined,
  });
  const togglePlayer = player.toggle;
  const seekPlayerBy = player.seekBy;

  // Web: teclado (espacio = play/pausa, flechas = seek)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayer();
      } else if (e.code === 'ArrowLeft') {
        seekPlayerBy(-10000);
      } else if (e.code === 'ArrowRight') {
        seekPlayerBy(10000);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlayer, seekPlayerBy]);

  const progress = player.durationMs > 0 ? player.currentMs / player.durationMs : 0;
  const title = params.title ?? 'Track';
  const artist = params.artist ?? 'Unknown artist';

  if (player.status === 'loading') {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <Backdrop lift={0.07} />
        <View style={styles.centerAll}>
          <ActivityIndicator size="small" color={Theme.text} />
          <Text dim variant="caption" style={{ marginTop: 14 }}>Building the sensory score…</Text>
        </View>
      </View>
    );
  }

  if (player.status === 'error' || !trackId) {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <Backdrop lift={0.05} />
        <View style={styles.centerAll}>
          <Text variant="largeTitle">Couldn’t load</Text>
          <Text dim style={{ marginTop: 8 }}>{player.errorMessage ?? 'Missing track id'}</Text>
          <Touch onPress={() => router.replace('/search')} style={{ marginTop: 20 }}>
            <Text color={Theme.text}>‹ Back to search</Text>
          </Touch>
        </View>
      </View>
    );
  }

  return isWide ? (
    <WebPlayer player={player} title={title} artist={artist} progress={progress} insets={insets} />
  ) : (
    <MobilePlayer player={player} title={title} artist={artist} progress={progress} insets={insets} />
  );
}

type LayoutProps = {
  player: SensoryPlayer;
  title: string;
  artist: string;
  progress: number;
  insets: { top: number; bottom: number; left: number; right: number };
};

/* ----------------------------- MÓVIL (app) ----------------------------- */

function MobilePlayer({ player, title, artist, progress, insets }: LayoutProps) {
  const f = useFontScale();
  const energy = player.score ? energyValueAt(player.score.energy, player.currentMs) : 0.5;
  return (
    <View style={[styles.fill, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 14 }]}>
      <Backdrop lift={0.07} />
      <View style={styles.mobilePad}>
        <View style={styles.topBar}>
          <Touch onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={Theme.textDim} />
          </Touch>
          <View style={{ flex: 1 }}>
            <Text variant="caption" weight="600" numberOfLines={1} align="center">{title}</Text>
            <Text variant="label" color={Theme.textFaint} numberOfLines={1} align="center" style={{ letterSpacing: 0, marginTop: 2 }}>
              {artist.toUpperCase()}
            </Text>
          </View>
          <Link href="/calibrate" asChild>
            <Touch hitSlop={12} style={styles.iconBtn}>
              <Ionicons name="options-outline" size={22} color={Theme.textDim} />
            </Touch>
          </Link>
        </View>

        <Pressable style={styles.lyricArea} onPress={player.toggle}>
          <LyricDisplay lines={player.lines} currentLineIndex={player.currentLineIndex} cue={player.cue} currentSize={30} contextSize={16} />
          <View style={{ height: 20 }} />
          <ChorusCountdown msAway={player.nextChorusInMs !== null && player.nextChorusInMs <= 12000 ? player.nextChorusInMs : null} />
          <TactileMeter energy={energy} source={player.energySource} section={player.currentSection?.kind} />
        </Pressable>

        <View style={{ gap: 14 }}>
          <PulseLine progress={progress} beatPulse={player.beatPulse} active={player.isPlaying} />
          <View style={styles.timeRow}>
            <Text variant="mono" color={Theme.textFaint} style={{ fontSize: Math.round(11.5 * f) }}>{fmt(player.currentMs)}</Text>
            <Text variant="mono" color={Theme.textGhost} style={{ fontSize: Math.round(10.5 * f), letterSpacing: 0 }}>
              {player.energySource === 'lalal' ? 'LALAL' : 'SEMANTIC'}
            </Text>
            <Text variant="mono" color={Theme.textFaint} style={{ fontSize: Math.round(11.5 * f) }}>−{fmt(player.durationMs - player.currentMs)}</Text>
          </View>
          <Transport player={player} />
          <View style={styles.footer}>
            <Touch onPress={player.restart} hitSlop={8}><Text variant="caption" color={Theme.textFaint}>Restart</Text></Touch>
            <Link href="/legend" asChild><Touch hitSlop={8}><Text variant="caption" color={Theme.textFaint}>Legend</Text></Touch></Link>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------ WEB (desktop) ------------------------------ */

function WebPlayer({ player, title, artist, progress, insets }: LayoutProps) {
  const energy = player.score ? energyValueAt(player.score.energy, player.currentMs) : 0.5;
  return (
    <View style={[styles.fill, { paddingTop: insets.top }]}>
      <Backdrop lift={0.06} />

      <View style={styles.webTopBar}>
        <Touch onPress={() => router.back()} hitSlop={10} style={styles.webBack}>
          <Ionicons name="chevron-back" size={20} color={Theme.textDim} />
          <Text variant="caption" color={Theme.textDim} weight="600">Back</Text>
        </Touch>
        <Text variant="caption" color={Theme.textDim} numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
          {title}  ·  {artist}
        </Text>
        <Link href="/calibrate" asChild>
          <Touch hitSlop={10} style={styles.webPill}>
            <Ionicons name="options-outline" size={21} color={Theme.textDim} />
          </Touch>
        </Link>
      </View>

      <Pressable style={styles.webStage} onPress={player.toggle}>
        <View style={{ width: '100%', maxWidth: 1040 }}>
          <LyricDisplay lines={player.lines} currentLineIndex={player.currentLineIndex} cue={player.cue} currentSize={62} contextSize={24} />
          <View style={{ height: 28 }} />
          <ChorusCountdown msAway={player.nextChorusInMs !== null && player.nextChorusInMs <= 12000 ? player.nextChorusInMs : null} />
          <TactileMeter energy={energy} source={player.energySource} section={player.currentSection?.kind} />
        </View>
      </Pressable>

      <View style={[styles.webDock, { paddingBottom: insets.bottom + 28 }]}>
        <View style={{ width: '100%', maxWidth: 920, gap: 16 }}>
          <PulseLine progress={progress} beatPulse={player.beatPulse} active={player.isPlaying} />
          <View style={styles.webDockRow}>
            <Text variant="mono" color={Theme.textFaint} style={{ width: 64 }}>{fmt(player.currentMs)}</Text>
            <Transport player={player} />
            <Text variant="mono" color={Theme.textFaint} style={{ width: 64, textAlign: 'right' }}>−{fmt(player.durationMs - player.currentMs)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------ Compartido ------------------------------ */

function Transport({ player }: { player: SensoryPlayer }) {
  return (
    <View style={styles.controls}>
      <Touch onPress={() => player.seekBy(-10000)} hitSlop={10} style={styles.sideBtn} accessibilityLabel="Seek back 10 seconds">
        <Ionicons name="play-back-outline" size={21} color={Theme.textDim} />
      </Touch>
      <Touch onPress={player.toggle} style={styles.playBtn} scaleTo={0.94} accessibilityLabel={player.isPlaying ? 'Pause' : 'Play'}>
        <Ionicons name={player.isPlaying ? 'pause' : 'play'} size={28} color={Theme.bg} style={player.isPlaying ? undefined : { marginLeft: 3 }} />
      </Touch>
      <Touch onPress={() => player.seekBy(10000)} hitSlop={10} style={styles.sideBtn} accessibilityLabel="Seek forward 10 seconds">
        <Ionicons name="play-forward-outline" size={21} color={Theme.textDim} />
      </Touch>
    </View>
  );
}

function TactileMeter({ energy, source, section }: { energy: number; source: string; section?: string }) {
  const level = Math.max(0, Math.min(1, energy));
  const bars = [0.18, 0.34, 0.5, 0.66, 0.82, 1];
  const label = `${section ?? 'score'} / ${source === 'lalal' ? 'lalal' : 'semantic'}`;

  return (
    <View style={styles.meterWrap}>
      <View style={styles.meterBars}>
        {bars.map((threshold, index) => {
          const active = level >= threshold;
          return (
            <View
              key={threshold}
              style={[
                styles.meterBar,
                {
                  height: 12 + index * 5,
                  opacity: active ? 0.86 : 0.16,
                },
              ]}
            />
          );
        })}
      </View>
      <Text variant="label" color={Theme.textGhost} align="center" style={{ letterSpacing: 0 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: Theme.bg },
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

  // móvil
  mobilePad: { flex: 1, paddingHorizontal: 22, gap: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  lyricArea: { flex: 1, justifyContent: 'center' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },

  // web
  webTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
    paddingVertical: 22,
  },
  webBack: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 120 },
  webPill: {
    width: 120,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  webStage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  webDock: { alignItems: 'center', paddingHorizontal: 40, paddingTop: 16 },
  webDockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // transporte
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 26 },
  sideBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.text,
  },
  meterWrap: {
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  meterBars: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  meterBar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: Theme.text,
  },
});

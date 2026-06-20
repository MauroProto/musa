import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { GlassSurface, GlassIconButton } from '../components/Glass';
import { Text, Touch, useResponsive, useFontScale } from '../components/ui';
import { Theme, RADIUS } from '../constants/theme';
import { useSensoryPlayer, type SensoryPlayer } from '../hooks/useSensoryPlayer';
import { useStemAudio } from '../hooks/useStemAudio';
import { AudioModeControl } from '../components/player/AudioModeControl';
import { energyValueAt } from '../lib/sensory-score';
import { isStemDemoTrack } from '../lib/demo-score-tracks';
import { usePreferences } from '../store/preferences';
import { SeekBar } from '../components/player/SeekBar';
import { ChorusCountdown } from '../components/player/ChorusCountdown';
import { LyricDisplay } from '../components/player/LyricDisplay';
import { SensoryPanel } from '../components/player/SensoryPanel';
import { LayerMixer } from '../components/player/LayerMixer';
import { GuidedDemoChip } from '../components/player/GuidedDemoChip';
import { CueCheatsheet } from '../components/player/CueCheatsheet';
import { PlayerReactiveBg } from '../components/player/PlayerReactiveBg';
import { TactileStatusBar } from '../components/player/TactileStatusBar';
import { currentGuidedStep } from '../lib/demo-guided';
import { playerHeaderRailWidth } from '../lib/player-header-layout';

const MOBILE_HEADER_RAIL_WIDTH = playerHeaderRailWidth({ buttonSize: 42, actionCount: 2, gap: 10 });
const WEB_HEADER_RAIL_WIDTH = playerHeaderRailWidth({ buttonSize: 44, actionCount: 2, gap: 16 });

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
  const audioMode = usePreferences((s) => s.audioMode);
  const isolateStem = usePreferences((s) => s.isolateStem);
  const layerGains = usePreferences((s) => s.layerGains);
  const setNowPlaying = usePreferences((s) => s.setNowPlaying);

  const audio = useStemAudio(trackId, audioMode, isolateStem, layerGains);
  const player = useSensoryPlayer(
    trackId,
    {
      durationMs: params.durationMs ? Number(params.durationMs) : undefined,
    },
    audio,
  );
  const togglePlayer = player.toggle;
  const seekPlayerBy = player.seekBy;

  const showAudio = isStemDemoTrack(trackId);
  const guided = params.guided === '1';

  // Web: keyboard (space = play/pause, arrows = seek)
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

  // Remember this as the "now playing" track so the user can return to it.
  useEffect(() => {
    if (!trackId) return;
    setNowPlaying({ trackId, title, artist, durationMs: params.durationMs ? Number(params.durationMs) : undefined });
  }, [trackId, title, artist, params.durationMs, setNowPlaying]);

  if (player.status === 'loading') {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
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
        <View style={styles.centerAll}>
          <Text variant="largeTitle" align="center">Couldn’t load</Text>
          <Text dim align="center" style={{ marginTop: 8 }}>{player.errorMessage ?? 'Missing track id'}</Text>
          <View style={{ marginTop: 22, width: 220 }}>
            <GlassSurface onPress={() => router.replace('/search')} radius={RADIUS.pill} elevation="none" chroma style={styles.errorBtn}>
              <Icon name="back" size={16} color={Theme.text} />
              <Text color={Theme.text} weight="600">Back to search</Text>
            </GlassSurface>
          </View>
        </View>
      </View>
    );
  }

  return isWide ? (
    <WebPlayer player={player} title={title} artist={artist} progress={progress} insets={insets} showAudio={showAudio} trackId={trackId} guided={guided} />
  ) : (
    <MobilePlayer player={player} title={title} artist={artist} progress={progress} insets={insets} showAudio={showAudio} trackId={trackId} guided={guided} />
  );
}

type LayoutProps = {
  player: SensoryPlayer;
  title: string;
  artist: string;
  progress: number;
  insets: { top: number; bottom: number; left: number; right: number };
  showAudio: boolean;
  trackId: number;
  guided: boolean;
};

/** Live energy signal (currently used for the tactile status bar). */
function useEnergy(player: SensoryPlayer) {
  return player.score ? energyValueAt(player.score.energy, player.currentMs) : 0.4;
}

/** Live vocal envelope (0–1) for the reactive background. */
function vocalLevel(player: SensoryPlayer): number {
  if (player.score?.vocalEnergy && player.score.vocalEnergy.length > 0) {
    return energyValueAt(player.score.vocalEnergy, player.currentMs);
  }
  let v = player.activeMoments.find((m) => m.layer === 'voice')?.intensity ?? 0;
  if (player.currentLineIndex >= 0) {
    const line = player.lines[player.currentLineIndex];
    if (line) {
      const end = line.endMs ?? line.startMs + 3000;
      if (player.currentMs >= line.startMs && player.currentMs <= end) v = Math.max(v, 0.5);
    }
  }
  return v;
}

/* ----------------------------- MOBILE (app) ----------------------------- */

function MobilePlayer({ player, title, artist, progress, insets, showAudio, trackId, guided }: LayoutProps) {
  const f = useFontScale();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cheatOpen, setCheatOpen] = useState(false);
  const energy = useEnergy(player);
  const vocal = vocalLevel(player);
  const guidedStep = guided ? currentGuidedStep(trackId, player.currentMs) : null;
  return (
    <View style={[styles.fill, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 14 }]}>
      <PlayerReactiveBg vocal={vocal} energy={energy} beat={player.beatPulse} playing={player.isPlaying} cueType={player.cue?.type} cueId={player.cue?.id} />
      <CueCheatsheet visible={cheatOpen} onClose={() => setCheatOpen(false)} activeCueType={player.cue?.type} />
      <View style={styles.mobilePad}>
        <View style={styles.topBar}>
          <View style={styles.mobileHeaderSide}>
            <GlassIconButton size={42} onPress={() => router.back()} accessibilityLabel="Back">
              <Icon name="back" size={22} color={Theme.text} />
            </GlassIconButton>
          </View>
          <View style={styles.trackTitleBlock}>
            <Text variant="caption" weight="700" numberOfLines={1} align="center">{title}</Text>
            <Text variant="label" color={Theme.textFaint} numberOfLines={1} align="center" style={{ letterSpacing: 0, marginTop: 2 }}>
              {artist.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.mobileHeaderSide, styles.mobileHeaderActions]}>
            <GlassIconButton size={42} onPress={() => setCheatOpen(true)} accessibilityLabel="What am I feeling? Touch cheatsheet">
              <Icon name="help" size={20} color={Theme.text} />
            </GlassIconButton>
            <GlassIconButton size={42} onPress={() => router.push('/calibrate')} accessibilityLabel="Settings">
              <Icon name="settings" size={20} color={Theme.text} />
            </GlassIconButton>
          </View>
        </View>

        <Pressable style={styles.lyricArea} onPress={player.toggle} accessibilityLabel={player.isPlaying ? 'Pause' : 'Play'}>
          <LyricDisplay lines={player.lines} currentLineIndex={player.currentLineIndex} isPlaying={player.isPlaying} currentMs={player.currentMs} activeMoments={player.activeMoments} guidedStep={guidedStep} currentSize={26} contextSize={15} />
          <View style={{ height: 14 }} />
          <ChorusCountdown msAway={player.nextChorusInMs !== null && player.nextChorusInMs <= 12000 ? player.nextChorusInMs : null} />
          {guided ? <GuidedDemoChip trackId={trackId} currentMs={player.currentMs} /> : null}
        </Pressable>

        <View style={{ gap: 12 }}>
          <TactileStatusBar
            moments={player.activeMoments}
            cue={player.cue?.type}
            cueId={player.cue?.id}
            energy={energy}
            section={player.currentSection?.kind}
            isPlaying={player.isPlaying}
            focus={player.activeTactileFocus}
            detailsOpen={detailsOpen}
            onToggleDetails={() => setDetailsOpen((value) => !value)}
          />
          {detailsOpen ? (
            <>
              <SensoryPanel
                moments={player.activeMoments}
                cue={player.cue?.type}
                cueId={player.cue?.id}
                energy={energy}
                source={player.energySource}
                section={player.currentSection?.kind}
                isPlaying={player.isPlaying}
              />
              <LayerMixer />
            </>
          ) : null}

          <GlassSurface radius={RADIUS.card} elevation="bar" style={styles.dock}>
            <SeekBar
              progress={progress}
              beatPulse={player.beatPulse}
              active={player.isPlaying}
              durationMs={player.durationMs}
              seekTo={player.seekTo}
            />
            <View style={styles.timeRow}>
              <Text variant="mono" color={Theme.textFaint} style={{ fontSize: Math.round(11.5 * f) }}>{fmt(player.currentMs)}</Text>
              <Text variant="mono" color={Theme.textFaint} style={{ fontSize: Math.round(11.5 * f) }}>−{fmt(player.durationMs - player.currentMs)}</Text>
            </View>
            <Transport player={player} />
            {showAudio ? <AudioModeControl /> : null}
          </GlassSurface>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------ WEB (desktop) ------------------------------ */

function WebPlayer({ player, title, artist, progress, insets, showAudio, trackId, guided }: LayoutProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cheatOpen, setCheatOpen] = useState(false);
  const energy = useEnergy(player);
  const vocal = vocalLevel(player);
  const guidedStep = guided ? currentGuidedStep(trackId, player.currentMs) : null;
  return (
    <View style={[styles.fill, { paddingTop: insets.top }]}>
      <PlayerReactiveBg vocal={vocal} energy={energy} beat={player.beatPulse} playing={player.isPlaying} cueType={player.cue?.type} cueId={player.cue?.id} />
      <CueCheatsheet visible={cheatOpen} onClose={() => setCheatOpen(false)} activeCueType={player.cue?.type} />

      <View style={styles.webTopBar}>
        <View style={styles.webHeaderSide}>
          <GlassIconButton size={44} onPress={() => router.back()} accessibilityLabel="Back">
            <Icon name="back" size={20} color={Theme.text} />
          </GlassIconButton>
        </View>
        <View style={styles.trackTitleBlock}>
          <Text variant="caption" color={Theme.textDim} numberOfLines={1} align="center">
            {title}  ·  {artist}
          </Text>
        </View>
        <View style={[styles.webHeaderSide, styles.webHeaderActions]}>
          <GlassIconButton size={44} onPress={() => setCheatOpen(true)} accessibilityLabel="What am I feeling? Touch cheatsheet">
            <Icon name="help" size={20} color={Theme.text} />
          </GlassIconButton>
          <GlassIconButton size={44} onPress={() => router.push('/calibrate')} accessibilityLabel="Settings">
            <Icon name="settings" size={20} color={Theme.text} />
          </GlassIconButton>
        </View>
      </View>

      <Pressable style={styles.webStage} onPress={player.toggle} accessibilityLabel={player.isPlaying ? 'Pause' : 'Play'}>
        <View style={{ width: '100%', maxWidth: 1040 }}>
          <LyricDisplay lines={player.lines} currentLineIndex={player.currentLineIndex} isPlaying={player.isPlaying} currentMs={player.currentMs} activeMoments={player.activeMoments} guidedStep={guidedStep} currentSize={62} contextSize={24} />
          <View style={{ height: 28 }} />
          <ChorusCountdown msAway={player.nextChorusInMs !== null && player.nextChorusInMs <= 12000 ? player.nextChorusInMs : null} />
          {guided ? <GuidedDemoChip trackId={trackId} currentMs={player.currentMs} /> : null}
        </View>
      </Pressable>

      <View style={[styles.webDock, { paddingBottom: insets.bottom + 28 }]}>
        <View style={{ width: '100%', maxWidth: 920, gap: 14 }}>
          <TactileStatusBar
            moments={player.activeMoments}
            cue={player.cue?.type}
            cueId={player.cue?.id}
            energy={energy}
            section={player.currentSection?.kind}
            isPlaying={player.isPlaying}
            focus={player.activeTactileFocus}
            detailsOpen={detailsOpen}
            onToggleDetails={() => setDetailsOpen((value) => !value)}
          />
          {detailsOpen ? (
            <>
              <SensoryPanel
                moments={player.activeMoments}
                cue={player.cue?.type}
                cueId={player.cue?.id}
                energy={energy}
                source={player.energySource}
                section={player.currentSection?.kind}
                isPlaying={player.isPlaying}
              />
              <LayerMixer />
            </>
          ) : null}
          <GlassSurface radius={30} elevation="bar" chroma chromaStrength={0.6} intensity={46} style={styles.webDockGlass}>
            <SeekBar
              progress={progress}
              beatPulse={player.beatPulse}
              active={player.isPlaying}
              durationMs={player.durationMs}
              seekTo={player.seekTo}
            />
            <View style={styles.webDockRow}>
              <Text variant="mono" color={Theme.textFaint} style={{ width: 64 }}>{fmt(player.currentMs)}</Text>
              <Transport player={player} />
              <Text variant="mono" color={Theme.textFaint} style={{ width: 64, textAlign: 'right' }}>−{fmt(player.durationMs - player.currentMs)}</Text>
            </View>
            {showAudio ? <AudioModeControl /> : null}
          </GlassSurface>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------ Shared ------------------------------ */

function Transport({ player }: { player: SensoryPlayer }) {
  return (
    <View style={styles.controls}>
      <GlassIconButton size={44} onPress={() => player.seekBy(-10000)} accessibilityLabel="Seek back 10 seconds">
        <Icon name="rewind" size={18} color={Theme.text} />
      </GlassIconButton>
      <Touch onPress={player.toggle} style={styles.playBtn} scaleTo={0.94} accessibilityLabel={player.isPlaying ? 'Pause' : 'Play'}>
        <Icon name={player.isPlaying ? 'pause' : 'play'} size={24} weight="fill" color={Theme.bg} />
      </Touch>
      <GlassIconButton size={44} onPress={() => player.seekBy(10000)} accessibilityLabel="Seek forward 10 seconds">
        <Icon name="forward" size={18} color={Theme.text} />
      </GlassIconButton>
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
  errorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },

  // mobile
  mobilePad: { flex: 1, paddingHorizontal: 18, gap: 12 },
  topBar: { flexDirection: 'row', alignItems: 'center' },
  mobileHeaderSide: { width: MOBILE_HEADER_RAIL_WIDTH, flexDirection: 'row', alignItems: 'center' },
  mobileHeaderActions: { justifyContent: 'flex-end', gap: 10 },
  trackTitleBlock: { flex: 1, minWidth: 0, alignItems: 'center' },
  lyricArea: { flex: 1, justifyContent: 'center' },
  dock: { padding: 14, gap: 10 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // web
  webTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  webHeaderSide: { width: WEB_HEADER_RAIL_WIDTH, flexDirection: 'row', alignItems: 'center' },
  webHeaderActions: { justifyContent: 'flex-end', gap: 16 },
  webStage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  webDock: { alignItems: 'center', paddingHorizontal: 40, paddingTop: 16 },
  webDockGlass: { padding: 18, gap: 14 },
  webDockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // transport
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22 },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.text,
  },
});

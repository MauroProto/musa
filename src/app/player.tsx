import { useEffect, useState } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Screen, Text, useFontScale } from '../components/ui';
import { Theme } from '../constants/theme';
import { useSensoryPlayer } from '../hooks/useSensoryPlayer';
import { energyValueAt } from '../lib/sensory-score';
import { Pulse } from '../components/player/Pulse';
import { EnergyBar } from '../components/player/EnergyBar';
import { ChorusCountdown } from '../components/player/ChorusCountdown';
import { LyricDisplay } from '../components/player/LyricDisplay';
import { usePreferences } from '../store/preferences';

export default function PlayerScreen() {
  const f = useFontScale();
  const params = useLocalSearchParams<{
    trackId: string;
    title?: string;
    artist?: string;
    durationMs?: string;
    guided?: string;
  }>();
  const trackId = Number(params.trackId ?? 0);
  const visualOnly = usePreferences((s) => s.visualOnly);

  const player = useSensoryPlayer(trackId, {
    durationMs: params.durationMs ? Number(params.durationMs) : undefined,
  });

  const [chorusFlash, setChorusFlash] = useState(false);
  useEffect(() => {
    if (player.cue?.type === 'chorus') {
      setChorusFlash(true);
      const t = setTimeout(() => setChorusFlash(false), 900);
      return () => clearTimeout(t);
    }
  }, [player.cue]);

  const energyNow = player.score ? energyValueAt(player.score.energy, player.currentMs) : 0.3;
  const energyBefore = player.score ? energyValueAt(player.score.energy, Math.max(0, player.currentMs - 3000)) : 0.3;
  const rising = energyNow > energyBefore + 0.04;
  const inChorus = player.currentSection?.kind === 'chorus';
  const guided = params.guided === '1';
  const accentColor = inChorus ? Theme.chorus : Theme.pulse;

  if (player.status === 'loading') {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <ActivityIndicator size="large" color={Theme.accent} />
          <Text dim>Building the sensory score…</Text>
        </View>
      </Screen>
    );
  }

  if (player.status === 'error' || !trackId) {
    return (
      <Screen>
        <Text variant="largeTitle">Couldn’t load</Text>
        <Text dim>{player.errorMessage ?? 'Missing track id'}</Text>
        <Pressable onPress={() => router.replace('/search')} style={{ marginTop: 8 }}>
          <Text color={Theme.accent}>Back to search</Text>
        </Pressable>
      </Screen>
    );
  }

  const progress = player.durationMs > 0 ? player.currentMs / player.durationMs : 0;

  return (
    <Screen scroll={false} pad={22}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text variant="heading" color={Theme.textDim}>‹</Text>
        </Pressable>
        <Link href="/calibrate" asChild>
          <Pressable hitSlop={12}>
            <Text variant="caption" color={Theme.textDim}>Calibrate</Text>
          </Pressable>
        </Link>
      </View>

      <View style={{ gap: 2 }}>
        <Text variant="title" numberOfLines={1} align="center">{params.title ?? 'Track'}</Text>
        <Text dim variant="caption" numberOfLines={1} align="center">{params.artist ?? 'Unknown artist'}</Text>
      </View>

      <View style={styles.pulseArea}>
        <Pulse beatPulse={player.beatPulse} intensity={energyNow} bloom={chorusFlash} color={accentColor} />
      </View>

      <ChorusCountdown msAway={player.nextChorusInMs !== null && player.nextChorusInMs <= 12000 ? player.nextChorusInMs : null} />

      <View style={styles.lyricArea}>
        <LyricDisplay lines={player.lines} currentLineIndex={player.currentLineIndex} cue={player.cue} />
      </View>

      {guided ? <GuidedCaption cue={player.cue} playing={player.isPlaying} accentColor={accentColor} /> : null}

      <View style={{ gap: 8 }}>
        <EnergyBar value={energyNow} rising={rising} sectionKind={player.currentSection?.kind} />
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: accentColor }]} />
        </View>
        <View style={styles.timeRow}>
          <Text variant="mono" color={Theme.textFaint} style={{ fontSize: Math.round(12 * f) }}>{fmt(player.currentMs)}</Text>
          <Text variant="mono" color={Theme.textFaint} style={{ fontSize: Math.round(12 * f) }}>
            {visualOnly ? 'VISUAL ONLY' : player.energySource === 'lalal' ? 'LALAL' : 'SEMANTIC'}
          </Text>
          <Text variant="mono" color={Theme.textFaint} style={{ fontSize: Math.round(12 * f) }}>−{fmt(player.durationMs - player.currentMs)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={() => player.seekBy(-10000)} hitSlop={12} style={styles.sideBtn}>
          <Text variant="caption" color={Theme.textDim}>−10s</Text>
        </Pressable>
        <Pressable onPress={player.toggle} style={[styles.playBtn, { backgroundColor: Theme.text }]}>
          <Text variant="heading" color="#000000" style={{ fontSize: Math.round(18 * f) }}>
            {player.isPlaying ? 'Pause' : 'Play'}
          </Text>
        </Pressable>
        <Pressable onPress={() => player.seekBy(10000)} hitSlop={12} style={styles.sideBtn}>
          <Text variant="caption" color={Theme.textDim}>+10s</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={player.restart}><Text variant="caption" color={Theme.textFaint}>Restart</Text></Pressable>
        <Link href="/legend" asChild><Pressable><Text variant="caption" color={Theme.textFaint}>Legend</Text></Pressable></Link>
      </View>
    </Screen>
  );
}

const CUE_COPY: Record<string, { text: string }> = {
  line_start: { text: 'New lyric line' },
  sustain: { text: 'Emotional sustain' },
  chorus_warning: { text: 'Chorus coming' },
  chorus: { text: 'Chorus hit' },
  pause: { text: 'Vocal pause' },
  section_end: { text: 'Section end' },
};

function GuidedCaption({ cue, playing, accentColor }: { cue: { type: string } | null; playing: boolean; accentColor: string }) {
  const copy = cue ? CUE_COPY[cue.type] : null;
  return (
    <View style={styles.caption}>
      <View style={[styles.captionDot, { backgroundColor: copy ? accentColor : Theme.textFaint }]} />
      <Text style={{ color: Theme.textDim, fontSize: 13, fontWeight: '500' }}>
        {playing ? (copy?.text ?? 'Following…') : 'Paused'}
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pulseArea: { alignItems: 'center', paddingVertical: 6 },
  lyricArea: { flex: 1, justifyContent: 'center', paddingVertical: 4 },
  caption: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 4 },
  captionDot: { width: 6, height: 6, borderRadius: 3 },
  progressTrack: { height: 3, borderRadius: 2, backgroundColor: Theme.fill, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, paddingVertical: 6 },
  sideBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  playBtn: { paddingVertical: 18, paddingHorizontal: 46, borderRadius: 999 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

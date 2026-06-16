import { useEffect, useState } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Screen, Text, Button, Stack, useFontScale } from '../components/ui';
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
        <Text variant="title">Couldn’t load this track</Text>
        <Text dim>{player.errorMessage ?? 'Missing track id'}</Text>
        <Button label="Back to search" onPress={() => router.replace('/search')} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} pad={18}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text variant="caption" color={Theme.textDim}>
            ‹ Search
          </Text>
        </Pressable>
        <Link href="/calibrate" asChild>
          <Pressable hitSlop={12}>
            <Text variant="caption" color={Theme.accent}>
              Calibrate
            </Text>
          </Pressable>
        </Link>
      </View>

      <View style={{ gap: 2 }}>
        <Text variant="heading" numberOfLines={1}>
          {params.title ?? 'Track'}
        </Text>
        <Text dim variant="caption" numberOfLines={1}>
          {params.artist ?? 'Unknown artist'}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Badge label={inChorus ? 'CHORUS' : (player.currentSection?.kind ?? 'verse').toUpperCase()} color={inChorus ? Theme.chorus : Theme.accent} />
        <Text variant="mono" color={Theme.textDim} style={{ fontSize: Math.round(13 * f) }}>
          {fmt(player.currentMs)} / {fmt(player.durationMs)}
        </Text>
        <Badge label={visualOnly ? 'VISUAL ONLY' : player.energySource === 'lalal' ? 'LALAL STEMS' : 'SEMANTIC'} color={Theme.textDim} />
      </View>

      <ChorusCountdown msAway={player.nextChorusInMs !== null && player.nextChorusInMs <= 12000 ? player.nextChorusInMs : null} />

      {guided ? <GuidedCaption cue={player.cue} playing={player.isPlaying} /> : null}

      <View style={styles.center}>
        <LyricDisplay lines={player.lines} currentLineIndex={player.currentLineIndex} cue={player.cue} />
      </View>

      <View style={styles.pulseRow}>
        <Pulse beatPulse={player.beatPulse} intensity={energyNow} bloom={chorusFlash} color={inChorus ? Theme.chorus : Theme.pulse} />
        <View style={{ flex: 1, gap: 8 }}>
          <StatusChip label="Voice" value={player.currentLineIndex >= 0 ? 'Active' : 'Rest'} color={player.currentLineIndex >= 0 ? Theme.accent : Theme.textFaint} />
          <StatusChip label="Energy" value={rising ? 'Rising' : energyNow > 0.66 ? 'High' : energyNow > 0.4 ? 'Medium' : 'Low'} color={Theme.energy} />
          <StatusChip label="Pulse" value={player.isPlaying ? 'Live' : 'Paused'} color={player.isPlaying ? Theme.pulse : Theme.textDim} />
        </View>
      </View>

      <EnergyBar value={energyNow} rising={rising} sectionKind={player.currentSection?.kind} />

      <View style={styles.progressWrap}>
        <View style={[styles.progressTrack, { borderColor: Theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${player.durationMs > 0 ? (player.currentMs / player.durationMs) * 100 : 0}%`,
                backgroundColor: inChorus ? Theme.chorus : Theme.accent,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.sideBtn} onPress={() => player.seekBy(-10000)} hitSlop={10}>
          <Text variant="caption" color={Theme.textDim}>−10s</Text>
        </Pressable>
        <Pressable onPress={player.toggle} style={[styles.playBtn, { backgroundColor: inChorus ? Theme.chorus : Theme.accent }]}>
          <Text variant="heading" color="#03121A">
            {player.isPlaying ? 'Pause' : 'Play'}
          </Text>
        </Pressable>
        <Pressable style={styles.sideBtn} onPress={() => player.seekBy(10000)} hitSlop={10}>
          <Text variant="caption" color={Theme.textDim}>+10s</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={player.restart}>
          <Text variant="caption" color={Theme.textDim}>Restart</Text>
        </Pressable>
        <Link href="/legend" asChild>
          <Pressable>
            <Text variant="caption" color={Theme.accent}>Haptic legend</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

const CUE_COPY: Record<string, { text: string; color: string }> = {
  line_start: { text: 'New lyric line — double tap', color: Theme.accent },
  sustain: { text: 'Emotional sustain — long vibration', color: Theme.accentAlt },
  chorus_warning: { text: 'Chorus coming — three rising taps', color: Theme.warning },
  chorus: { text: 'Chorus hit — strong impact', color: Theme.chorus },
  pause: { text: 'Vocal pause — haptic silence', color: Theme.textFaint },
  section_end: { text: 'Section end', color: Theme.textDim },
  beat: { text: 'Main pulse', color: Theme.pulse },
};

function GuidedCaption({ cue, playing }: { cue: { type: string } | null; playing: boolean }) {
  const copy = cue ? CUE_COPY[cue.type] ?? { text: 'Following…', color: Theme.textDim } : null;
  return (
    <View style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Theme.surface, borderWidth: 1, borderColor: copy?.color ?? Theme.border }}>
      <Text style={{ color: Theme.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
        {playing ? 'NOW' : 'PAUSED'}
      </Text>
      <Text style={{ color: copy?.color ?? Theme.text, fontSize: 15, fontWeight: '700' }}>
        {copy?.text ?? 'Hold the phone — patterns start on play'}
      </Text>
    </View>
  );
}

function Badge({ label, color }: { label: string; color: string }) {  return (
    <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1.5, borderColor: color, backgroundColor: `${color}14` }}>
      <Text style={{ color, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }}>{label}</Text>
    </View>
  );
}

function StatusChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Theme.surface, borderWidth: 1, borderColor: Theme.border }}>
      <Text style={{ color: Theme.textDim, fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>{label}</Text>
      <Text style={{ color, fontSize: 14, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  center: { flex: 1, justifyContent: 'center', paddingVertical: 6 },
  pulseRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  progressWrap: { marginTop: 4 },
  progressTrack: { height: 6, borderRadius: 3, borderWidth: 1, backgroundColor: Theme.surface, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22 },
  sideBtn: { padding: 12 },
  playBtn: { paddingVertical: 16, paddingHorizontal: 38, borderRadius: 999 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
});

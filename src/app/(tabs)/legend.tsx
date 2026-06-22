import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { Screen, Text, Button, Stack } from '../../components/ui';
import { GlassSurface } from '../../components/Glass';
import { Theme, RADIUS } from '../../constants/theme';
import {
  HAPTIC_CATEGORY_LABELS,
  HAPTIC_LEGEND,
  type HapticLegendCategory,
} from '../../constants/haptic-patterns';
import { PRIMARY_GUIDED_TRACK } from '../../lib/fixtures';
import { previewHaptic } from '../../lib/haptics';
import { usePreferences } from '../../store/preferences';
import type { HapticEventType } from '../../lib/types';

const CATEGORY_ORDER: HapticLegendCategory[] = ['body', 'rhythm', 'texture', 'structure', 'emotion', 'voice'];

const LEGEND_ICON: Record<HapticEventType, IconName> = {
  bass_pulse: 'bass',
  drum_fill: 'drums',
  guitar_riff: 'guitar',
  guitar_strum: 'guitar',
  chorus: 'flash',
  mood_shift: 'emotion',
  line_start: 'voice',
  beat: 'pulse',
  energy_rise: 'trendUp',
  sustain: 'wind',
  chorus_warning: 'trendUp',
  pause: 'pause',
  section_end: 'flow',
};

export default function LegendScreen() {
  const strength = usePreferences((s) => s.strength);
  const pulseOn = usePreferences((s) => s.pulseOn);
  const visualOnly = usePreferences((s) => s.visualOnly);
  const layerGains = usePreferences((s) => s.layerGains);

  function openGuidedTrack() {
    router.push({
      pathname: '/player',
      params: {
        trackId: String(PRIMARY_GUIDED_TRACK.trackId),
        title: PRIMARY_GUIDED_TRACK.title,
        artist: PRIMARY_GUIDED_TRACK.artist,
        durationMs: String(PRIMARY_GUIDED_TRACK.durationMs ?? ''),
        guided: '1',
      },
    });
  }

  return (
    <Screen scroll bottomBarSpace>
      <View style={{ gap: 8 }}>
        <Text variant="label" color={Theme.textFaint}>THE TOUCH LANGUAGE</Text>
        <Text variant="largeTitle">Every cue means something</Text>
        <Text dim>
          Tap any card to feel it. These are the building blocks MUSA uses to turn a song into touch.
        </Text>
      </View>

      <Stack gap={16}>
        {CATEGORY_ORDER.map((category) => {
          const items = HAPTIC_LEGEND.filter((item) => item.category === category);
          if (items.length === 0) return null;
          return (
            <View key={category} style={{ gap: 9 }}>
              <Text variant="label" color={Theme.textFaint} style={styles.categoryLabel}>
                {HAPTIC_CATEGORY_LABELS[category].toUpperCase()}
              </Text>
              {items.map((item) => (
                <GlassSurface
                  key={item.type}
                  onPress={() => previewHaptic(item.type, strength, item.intensity, { visualOnly, pulseOn, layerGains })}
                  radius={RADIUS.lg}
                  elevation="none"
                  chroma={false}
                  intensity={18}
                  scaleTo={0.99}
                  accessibilityLabel={`Preview ${item.label}: ${item.role}`}
                  style={styles.card}
                >
                  <View style={styles.cardHead}>
                    <View style={styles.iconWrap}>
                      <Icon name={LEGEND_ICON[item.type]} size={18} color={Theme.teal} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="heading">{item.label}</Text>
                      <Text variant="caption" dim>{item.role}</Text>
                    </View>
                    <Icon name="flash" size={13} color={Theme.textGhost} />
                  </View>
                  <Text dim style={{ marginTop: 2 }}>
                    {item.haptic} — {item.why}
                  </Text>
                </GlassSurface>
              ))}
            </View>
          );
        })}
      </Stack>

      <GlassSurface radius={RADIUS.card} elevation="card" intensity={22} style={styles.note}>
        <Text variant="heading">Meaningful, not just motion</Text>
        <Text dim style={{ marginTop: 4 }}>
          Other apps vibrate because there is sound. MUSA vibrates because a riff is leading, the drums are turning,
          the chorus is landing, or the feeling of the lyric has changed.
        </Text>
      </GlassSurface>

      <Stack gap={10}>
        <Button label="Tune your strength" variant="secondary" onPress={() => router.push('/calibrate')} />
        <Button label="Try a guided listen" variant="ghost" onPress={openGuidedTrack} />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  categoryLabel: { letterSpacing: 0, marginLeft: 2 },
  card: { gap: 6, padding: 17 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,12,14,0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  note: { padding: 20 },
});

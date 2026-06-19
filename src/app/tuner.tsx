import { useMemo, useState } from 'react';
import { StyleSheet, Text as NativeText, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Button, Stack, Card, Touch } from '../components/ui';
import { Theme } from '../constants/theme';
import { useSensoryPlayer } from '../hooks/useSensoryPlayer';
import { DANI_CALIFORNIA_SCREENPLAY } from '../lib/authored-screenplay';
import { DANI_CALIFORNIA_TRACK_ID } from '../lib/demo-score-tracks';
import {
  applyDemoTuning,
  tuningSnippetForMoments,
  type DemoMomentOverride,
} from '../lib/demo-tuning';
import { previewHaptic } from '../lib/haptics';
import type { Intensity } from '../lib/types';
import { usePreferences } from '../store/preferences';

const INTENSITIES: Intensity[] = [0.2, 0.4, 0.6, 0.8, 1];

function keyForLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function TunerScreen() {
  const overrides = usePreferences((s) => s.demoTuningOverrides);
  const setOverrides = usePreferences((s) => s.setDemoTuningOverrides);
  const strength = usePreferences((s) => s.strength);
  const [selectedKey, setSelectedKey] = useState(() => keyForLabel(DANI_CALIFORNIA_SCREENPLAY[1]?.label ?? ''));

  const tuned = useMemo(
    () => applyDemoTuning(DANI_CALIFORNIA_SCREENPLAY, overrides),
    [overrides],
  );
  const player = useSensoryPlayer(
    DANI_CALIFORNIA_TRACK_ID,
    { durationMs: 281000 },
    null,
    { authoredMoments: tuned },
  );
  const selectedBase = DANI_CALIFORNIA_SCREENPLAY.find((moment) => keyForLabel(moment.label) === selectedKey)
    ?? DANI_CALIFORNIA_SCREENPLAY[0];
  const selectedOverride = overrides[selectedKey] ?? {};
  const selectedTuned = tuned.find((moment) => keyForLabel(moment.label) === selectedKey);
  const snippet = useMemo(() => tuningSnippetForMoments(tuned), [tuned]);

  function patchSelected(patch: DemoMomentOverride) {
    setOverrides({
      ...overrides,
      [selectedKey]: {
        ...selectedOverride,
        ...patch,
      },
    });
  }

  function nudge(field: 'startOffsetMs' | 'endOffsetMs', delta: number) {
    patchSelected({ [field]: (selectedOverride[field] ?? 0) + delta });
  }

  function nudgeRepeat(delta: number) {
    const base = selectedOverride.repeatEveryMs ?? selectedBase.repeatEveryMs ?? 0;
    patchSelected({ repeatEveryMs: Math.max(80, base + delta) });
  }

  function cycleIntensity() {
    const current = selectedOverride.intensity ?? selectedBase.intensity;
    const index = INTENSITIES.indexOf(current);
    patchSelected({ intensity: INTENSITIES[(index + 1) % INTENSITIES.length] });
  }

  function jumpAndPlay() {
    const target = selectedTuned?.t ?? selectedBase.t;
    player.seekTo(target);
    player.play();
  }

  return (
    <Screen scroll maxWidth={720}>
      <Text variant="label" color={Theme.textFaint}>INTERNAL</Text>
      <Text variant="largeTitle">Dani haptic tuner</Text>
      <Text dim>
        Local-only overrides for phone testing. Apply final values manually to the authored screenplay.
      </Text>

      <Stack gap={8}>
        {DANI_CALIFORNIA_SCREENPLAY.map((moment) => {
          const key = keyForLabel(moment.label);
          const active = key === selectedKey;
          const disabled = overrides[key]?.enabled === false;
          return (
            <Touch
              key={key}
              onPress={() => setSelectedKey(key)}
              style={active ? [styles.momentRow, styles.momentRowActive] : styles.momentRow}
            >
              <View style={{ flex: 1 }}>
                <Text variant="caption" weight="700" color={active ? Theme.text : Theme.textDim}>
                  {moment.label}
                </Text>
                <Text variant="label" color={Theme.textFaint}>
                  {Math.round(moment.t / 1000)}s - {moment.cueType}{disabled ? ' - disabled' : ''}
                </Text>
              </View>
            </Touch>
          );
        })}
      </Stack>

      <Card>
        <Text variant="heading">{selectedBase.label}</Text>
        <Text dim>{selectedBase.detail}</Text>
        <View style={styles.metricsGrid}>
          <Metric label="start" value={`${selectedTuned?.t ?? selectedBase.t} ms`} />
          <Metric label="end" value={`${selectedTuned?.endMs ?? selectedBase.endMs} ms`} />
          <Metric label="repeat" value={`${selectedTuned?.repeatEveryMs ?? selectedBase.repeatEveryMs ?? 0} ms`} />
          <Metric label="intensity" value={`${selectedTuned?.intensity ?? selectedBase.intensity}`} />
        </View>
        <View style={styles.controlGrid}>
          <Button label="Start -100" variant="secondary" onPress={() => nudge('startOffsetMs', -100)} full={false} />
          <Button label="Start +100" variant="secondary" onPress={() => nudge('startOffsetMs', 100)} full={false} />
          <Button label="End -100" variant="secondary" onPress={() => nudge('endOffsetMs', -100)} full={false} />
          <Button label="End +100" variant="secondary" onPress={() => nudge('endOffsetMs', 100)} full={false} />
          <Button label="Repeat -20" variant="secondary" onPress={() => nudgeRepeat(-20)} full={false} />
          <Button label="Repeat +20" variant="secondary" onPress={() => nudgeRepeat(20)} full={false} />
          <Button label="Intensity" variant="secondary" onPress={cycleIntensity} full={false} />
          <Button
            label={selectedOverride.enabled === false ? 'Enable' : 'Disable'}
            variant="secondary"
            onPress={() => patchSelected({ enabled: selectedOverride.enabled === false })}
            full={false}
          />
        </View>
        <View style={styles.actionRow}>
          <Button label="Jump + play" onPress={jumpAndPlay} full={false} />
          <Button
            label="Preview cue"
            variant="secondary"
            onPress={() => previewHaptic(selectedBase.cueType, strength, selectedOverride.intensity ?? selectedBase.intensity)}
            full={false}
          />
          <Button label="Back" variant="ghost" onPress={() => router.back()} full={false} />
        </View>
      </Card>

      <Card>
        <Text variant="heading">Authored snippet</Text>
        <NativeText selectable style={styles.snippet}>{snippet}</NativeText>
      </Card>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text variant="label" color={Theme.textFaint}>{label.toUpperCase()}</Text>
      <Text variant="mono" color={Theme.text}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  momentRow: {
    padding: 13,
    borderRadius: 8,
    backgroundColor: Theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  momentRowActive: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: Theme.borderStrong,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metric: {
    minWidth: 120,
    gap: 3,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Theme.surfaceStrong,
  },
  controlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  snippet: {
    color: Theme.textDim,
    fontFamily: 'Menlo',
    fontSize: 12,
    lineHeight: 18,
  },
});
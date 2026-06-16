import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Text, Button, Stack, Card } from '../components/ui';
import { Theme } from '../constants/theme';
import { usePreferences } from '../store/preferences';
import { previewHaptic } from '../lib/haptics';
import type { HapticStrength } from '../lib/types';

const STRENGTHS: { id: HapticStrength; label: string; desc: string }[] = [
  { id: 'soft', label: 'Soft', desc: 'Gentle, discreet taps' },
  { id: 'medium', label: 'Medium', desc: 'Balanced — recommended' },
  { id: 'strong', label: 'Strong', desc: 'Clear, hard to miss' },
];

export default function CalibrateScreen() {
  const strength = usePreferences((s) => s.strength);
  const setStrength = usePreferences((s) => s.setStrength);
  const pulseOn = usePreferences((s) => s.pulseOn);
  const setPulseOn = usePreferences((s) => s.setPulseOn);
  const visualOnly = usePreferences((s) => s.visualOnly);
  const setVisualOnly = usePreferences((s) => s.setVisualOnly);
  const fontScale = usePreferences((s) => s.fontScale);
  const setFontScale = usePreferences((s) => s.setFontScale);

  return (
    <Screen scroll>
      <Text variant="label" color={Theme.textDim} style={{ letterSpacing: 3 }}>
        STEP 2 OF 2
      </Text>
      <Text variant="largeTitle">Haptic strength</Text>
      <Text dim style={{ marginBottom: 4 }}>
        Test each pattern. Pick the level that feels clear without being overwhelming.
      </Text>

      <Stack gap={8}>
        {STRENGTHS.map((s) => {
          const active = strength === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setStrength(s.id)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: active ? `${Theme.accent}26` : Theme.surface,
                  borderColor: active ? `${Theme.accent}99` : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text variant="heading">{s.label}</Text>
                <Text variant="caption" dim>{s.desc}</Text>
              </View>
              <View style={[styles.radio, { borderColor: active ? Theme.accent : Theme.textFaint, backgroundColor: active ? Theme.accent : 'transparent' }]} />
            </Pressable>
          );
        })}
      </Stack>

      <Card>
        <Text variant="heading">Test the patterns</Text>
        <View style={styles.testRow}>
          <TestButton label="Line change" color={Theme.accent} onPress={() => previewHaptic('line_start', strength, 0.6)} />
          <TestButton label="Sustain" color={Theme.accentAlt} onPress={() => previewHaptic('sustain', strength, 0.6)} />
          <TestButton label="Chorus coming" color={Theme.warning} onPress={() => previewHaptic('chorus_warning', strength, 0.6)} />
          <TestButton label="Chorus hit" color={Theme.chorus} onPress={() => previewHaptic('chorus', strength, 1)} />
        </View>
      </Card>

      <Card>
        <Toggle label="Beat pulse haptics" desc="Constant taps to keep timing" value={pulseOn} onToggle={() => setPulseOn(!pulseOn)} />
        <View style={styles.sep} />
        <Toggle label="Visual only" desc="Follow with no vibration" value={visualOnly} onToggle={() => setVisualOnly(!visualOnly)} />
        <View style={styles.sep} />
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="body">Text size</Text>
            <Text dim variant="caption">Larger text for readability</Text>
          </View>
          <View style={styles.segRow}>
            {(['comfortable', 'large', 'xl'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFontScale(s)}
                style={[styles.seg, { backgroundColor: fontScale === s ? Theme.accent : Theme.surfaceAlt }]}
              >
                <Text variant="caption" color={fontScale === s ? Theme.accentText : Theme.textDim} weight="600">
                  {s === 'comfortable' ? 'A' : s === 'large' ? 'A+' : 'A++'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>

      <Button label="Done" onPress={() => router.replace('/search')} />
    </Screen>
  );
}

function TestButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.testBtn, { opacity: pressed ? 0.6 : 1 }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" weight="600">{label}</Text>
    </Pressable>
  );
}

function Toggle({ label, desc, value, onToggle }: { label: string; desc?: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="body">{label}</Text>
        {desc ? <Text dim variant="caption">{desc}</Text> : null}
      </View>
      <Pressable onPress={onToggle} style={[styles.switch, { backgroundColor: value ? Theme.accent : Theme.surfaceAlt }]}>
        <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 18, borderWidth: 1.5 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  testRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  testBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 999, backgroundColor: Theme.surfaceAlt },
  dot: { width: 9, height: 9, borderRadius: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: Theme.separator, marginVertical: 6 },
  switch: { width: 50, height: 30, borderRadius: 15, padding: 2, justifyContent: 'center' },
  knob: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF' },
  segRow: { flexDirection: 'row', gap: 6 },
  seg: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
});

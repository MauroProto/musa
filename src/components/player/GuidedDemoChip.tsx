import { StyleSheet, View } from 'react-native';
import { Text } from '../ui';
import { Theme } from '../../constants/theme';
import { currentGuidedStep, guidedStepsForTrack, nextGuidedStep } from '../../lib/demo-guided';

/**
 * Guided-demo caption — clean and passive. No skip controls: the demo plays
 * itself. It just names the sensation you're feeling right now and shows where
 * you are in the walkthrough.
 */
export function GuidedDemoChip({ trackId, currentMs }: { trackId: number; currentMs: number }) {
  const steps = guidedStepsForTrack(trackId);
  const active = currentGuidedStep(trackId, currentMs) ?? nextGuidedStep(trackId, currentMs);
  if (!active || steps.length === 0) return null;
  const index = Math.max(0, steps.findIndex((s) => s.id === active.id));

  return (
    <View style={styles.wrap}>
      <Text variant="label" color={Theme.textFaint} style={styles.eyebrow}>
        GUIDED · {index + 1} / {steps.length}
      </Text>
      <Text variant="heading" align="center" weight="700">{active.label}</Text>
      <Text variant="caption" dim align="center" style={styles.detail} numberOfLines={2}>
        {active.detail}
      </Text>
      <View style={styles.dots}>
        {steps.map((s, i) => (
          <View key={s.id} style={[styles.dot, i === index ? styles.dotActive : null]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6, paddingHorizontal: 24, maxWidth: 460, alignSelf: 'center' },
  eyebrow: { letterSpacing: 1.5 },
  detail: { maxWidth: 360, lineHeight: 19 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.textGhost },
  dotActive: { backgroundColor: Theme.text, width: 18 },
});

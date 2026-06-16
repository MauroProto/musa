import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../../constants/theme';
import { useFontScale } from '../ui';

export function EnergyBar({
  value,
  rising,
  sectionKind,
}: {
  value: number;
  rising: boolean;
  sectionKind?: 'verse' | 'chorus' | 'intro' | 'outro' | 'bridge' | undefined;
}) {
  const pct = Math.max(0.02, Math.min(1, value));
  const inChorus = sectionKind === 'chorus';
  const color = inChorus ? Theme.chorus : Theme.pulse;

  return (
    <View style={styles.wrap}>
      <View style={[styles.track]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Theme.fill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
});

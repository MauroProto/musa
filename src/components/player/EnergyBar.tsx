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
  const f = useFontScale();
  const pct = Math.max(0.04, Math.min(1, value));
  const inChorus = sectionKind === 'chorus';
  const color = inChorus ? Theme.chorus : Theme.energy;
  const labelSize = Math.round(12 * f);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Tag label="ENERGY" color={Theme.textDim} size={labelSize} />
        <Tag label={rising ? 'RISING' : 'STEADY'} color={rising ? Theme.energy : Theme.textDim} size={labelSize} />
      </View>
      <View style={[styles.track, { borderColor: Theme.border }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct * 100}%`,
              backgroundColor: color,
              shadowColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function Tag({ label, color, size }: { label: string; color: string; size: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text style={{ color, fontSize: size, fontWeight: '700', letterSpacing: 1.5 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: {
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    backgroundColor: Theme.surface,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../../constants/theme';
import { useFontScale } from '../ui';

export function ChorusCountdown({ msAway }: { msAway: number | null }) {
  const f = useFontScale();
  if (msAway === null) return null;
  const secs = Math.max(0, Math.round(msAway / 1000));
  const urgent = secs <= 3;

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: urgent ? Theme.chorus : Theme.warning,
          backgroundColor: urgent ? `${Theme.chorus}1A` : `${Theme.warning}14`,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[styles.dot, { backgroundColor: urgent ? Theme.chorus : Theme.warning }]} />
        <Text style={{ color: Theme.textDim, fontSize: Math.round(12 * f), fontWeight: '700', letterSpacing: 1.5 }}>
          CHORUS IN
        </Text>
      </View>
      <Text
        style={{
          color: urgent ? Theme.chorus : Theme.warning,
          fontSize: Math.round(30 * f),
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
        }}
      >
        {secs}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});

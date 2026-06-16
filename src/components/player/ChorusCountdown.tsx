import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../../constants/theme';
import { useFontScale } from '../ui';

export function ChorusCountdown({ msAway }: { msAway: number | null }) {
  const f = useFontScale();
  if (msAway === null) return null;
  const secs = Math.max(0, Math.round(msAway / 1000));

  return (
    <View style={[styles.wrap, { backgroundColor: `${Theme.chorus}1F` }]}>
      <View style={[styles.dot, { backgroundColor: Theme.chorus }]} />
      <Text style={{ color: Theme.chorus, fontSize: Math.round(13 * f), fontWeight: '600' }}>
        Chorus in {secs}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});

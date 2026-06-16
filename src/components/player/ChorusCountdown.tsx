import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Theme } from '../../constants/theme';
import { Text, useFontScale } from '../ui';

const SINE = Easing.inOut(Easing.sin);

export function ChorusCountdown({ msAway }: { msAway: number | null }) {
  const f = useFontScale();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650, easing: SINE }),
        withTiming(0.4, { duration: 650, easing: SINE }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  if (msAway === null) return null;
  const secs = Math.max(0, Math.round(msAway / 1000));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.dot, dotStyle]} />
      <Text variant="caption" weight="600" color={Theme.textDim} style={{ fontSize: Math.round(12.5 * f), letterSpacing: 0 }}>
        Chorus · {secs}s
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
    backgroundColor: Theme.surface,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.text },
});

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Theme } from '../../constants/theme';
import { Text } from '../ui';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const SINE = Easing.inOut(Easing.sin);

/**
 * The one chromatic accent in MUSA: a bright-red "LIVE" marker. The dot breathes
 * while a show is on air (steady under reduced motion).
 */
export function LiveBadge({
  label = 'LIVE',
  size = 7,
  on = true,
}: {
  label?: string;
  size?: number;
  on?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!on || reduceMotion) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 720, easing: SINE }),
        withTiming(1, { duration: 720, easing: SINE }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [on, reduceMotion, pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.row} accessibilityLabel={on ? 'Live now' : label}>
      <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: Theme.rec }, dotStyle]} />
      <Text variant="label" weight="800" color={Theme.rec} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { letterSpacing: 1.2 },
});

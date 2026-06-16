import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';
import { Theme } from '../../constants/theme';

export function Pulse({
  beatPulse,
  intensity,
  bloom,
  color = Theme.pulse,
}: {
  beatPulse: number;
  intensity: number;
  bloom: boolean;
  color?: string;
}) {
  const scale = useSharedValue(1);
  const bloomSv = useSharedValue(0);

  useEffect(() => {
    if (beatPulse <= 0) return;
    scale.value = withSequence(
      withTiming(1 + 0.35 * intensity, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 140 }),
    );
  }, [beatPulse, intensity, scale]);

  useEffect(() => {
    if (bloom) {
      bloomSv.value = 0;
      bloomSv.value = withSequence(
        withTiming(1, { duration: 220 }),
        withTiming(0.4, { duration: 700 }),
      );
    }
  }, [bloom, bloomSv]);

  useEffect(() => {
    return () => {
      cancelAnimation(scale);
      cancelAnimation(bloomSv);
    };
  }, [scale, bloomSv]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [1, 1.35], [0.9, 0.35]),
  }));

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bloomSv.value, [0, 1], [0, 0.55]),
    transform: [{ scale: interpolate(bloomSv.value, [0, 1], [1, 2.2]) }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View
        pointerEvents="none"
        style={[styles.bloom, { backgroundColor: color }, bloomStyle]}
      />
      <Animated.View style={[styles.ring, { borderColor: color }, ringStyle]} />
      <View style={[styles.core, { backgroundColor: color, opacity: 0.4 + 0.6 * intensity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  ring: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
  },
  bloom: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
  },
});

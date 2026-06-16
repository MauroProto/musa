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
  const glow = useSharedValue(0.35);
  const bloomSv = useSharedValue(0);

  useEffect(() => {
    if (beatPulse <= 0) return;
    scale.value = withSequence(
      withTiming(1 + 0.22 * intensity, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 220 }),
    );
    glow.value = withSequence(
      withTiming(0.55 + 0.35 * intensity, { duration: 80 }),
      withTiming(0.35, { duration: 380 }),
    );
  }, [beatPulse, intensity, scale, glow]);

  useEffect(() => {
    if (bloom) {
      bloomSv.value = 0;
      bloomSv.value = withSequence(
        withTiming(1, { duration: 260 }),
        withTiming(0, { duration: 900 }),
      );
    }
  }, [bloom, bloomSv]);

  useEffect(() => {
    return () => {
      cancelAnimation(scale);
      cancelAnimation(glow);
      cancelAnimation(bloomSv);
    };
  }, [scale, glow, bloomSv]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(glow.value, [0.2, 0.8], [0.15, 0.5]),
  }));

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bloomSv.value, [0, 1], [0, 0.5]),
    transform: [{ scale: interpolate(bloomSv.value, [0, 1], [1, 2.1]) }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View pointerEvents="none" style={[styles.bloom, { backgroundColor: color }, bloomStyle]} />
      <Animated.View style={[styles.ring, { borderColor: color }, ringStyle]} />
      <View style={[styles.core, { backgroundColor: color, opacity: 0.5 + 0.5 * intensity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  core: { width: 14, height: 14, borderRadius: 7 },
  ring: { position: 'absolute', width: 78, height: 78, borderRadius: 39, borderWidth: 1.5 },
  bloom: { position: 'absolute', width: 120, height: 120, borderRadius: 60 },
});

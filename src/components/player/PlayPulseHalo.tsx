import { memo, useEffect } from 'react';
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
import { Theme, MOTION } from '../../constants/theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

/**
 * Soft red halo behind the play button. While playing, it breathes at a calm
 * ambient pace and twitches slightly with every beat pulse. No literal REC dot —
 * just a slow, warm glow that says "live" without screaming.
 *
 * No React state. Shared values only.
 */
export const PlayPulseHalo = memo(function PlayPulseHalo({
  size = 60,
  playing,
  beat = 0,
}: {
  size?: number;
  playing: boolean;
  beat?: number;
}) {
  const reduceMotion = useReducedMotion();
  const breathe = useSharedValue(0);
  const kick = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!playing || reduceMotion) {
      cancelAnimation(breathe);
      cancelAnimation(kick);
      opacity.value = withTiming(0, { duration: MOTION.dur.slow, easing: EASE_OUT });
      breathe.value = 0;
      kick.value = 0;
      return;
    }
    opacity.value = withTiming(1, { duration: MOTION.dur.base, easing: EASE_OUT });
    breathe.value = withRepeat(withTiming(1, { duration: 2400, easing: EASE_OUT }), -1, true);
    return () => {
      cancelAnimation(breathe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, reduceMotion, breathe, opacity]);

  useEffect(() => {
    if (!playing || reduceMotion || beat <= 0) return;
    kick.value = withSequence(
      withTiming(1, { duration: 90, easing: EASE_OUT }),
      withTiming(0, { duration: 380, easing: EASE_OUT }),
    );
  }, [beat, playing, reduceMotion, kick]);

  const ringStyle = useAnimatedStyle(() => {
    const b = breathe.value;
    const k = kick.value;
    const scale = 1 + b * 0.18 + k * 0.08;
    const op = 0.18 + b * 0.22 + k * 0.25;
    return { opacity: Math.min(0.55, op), transform: [{ scale }] };
  });

  const innerStyle = useAnimatedStyle(() => {
    const b = breathe.value;
    const k = kick.value;
    const scale = 0.92 + b * 0.08 + k * 0.05;
    const op = 0.35 + b * 0.25 + k * 0.3;
    return { opacity: Math.min(0.75, op), transform: [{ scale }] };
  });

  return (
    <View pointerEvents="none" style={[styles.host, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: Theme.rec,
          },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 0.78,
            height: size * 0.78,
            borderRadius: (size * 0.78) / 2,
            backgroundColor: Theme.rec,
          },
          innerStyle,
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
});
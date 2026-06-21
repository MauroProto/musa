import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Theme, MOTION } from '../../constants/theme';
import { PLAYER_PROGRESS_DOT_CHROME } from '../../lib/player-ui-chrome';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

/**
 * El pulso y el progreso en un solo elemento minimalista:
 * una línea fina; un cabezal (dot) marca la posición y late en cada beat.
 */
export function PulseLine({
  progress,
  beatPulse,
  active,
}: {
  progress: number;
  beatPulse: number;
  active: boolean;
}) {
  const beat = useSharedValue(0);
  const pct = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    if (beatPulse <= 0 || !active) return;
    beat.value = withSequence(
      withTiming(1, { duration: 90, easing: EASE_OUT }),
      withTiming(0, { duration: 420, easing: EASE_OUT }),
    );
  }, [beatPulse, beat, active]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: 0.82 + 0.18 * beat.value,
    transform: [{ scale: 1 + 0.82 * beat.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.14 + 0.26 * beat.value,
    transform: [{ scale: 0.82 + 0.46 * beat.value }],
  }));

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Animated.View style={[styles.dotWrap, { left: `${pct * 100}%` }]}>
        <Animated.View style={[styles.dotHalo, haloStyle]} />
        <Animated.View style={[styles.dot, dotStyle]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 22, justifyContent: 'center' },
  track: {
    height: 2,
    borderRadius: 2,
    backgroundColor: Theme.fill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2, backgroundColor: Theme.rec },
  dotWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: PLAYER_PROGRESS_DOT_CHROME.haloSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -PLAYER_PROGRESS_DOT_CHROME.haloSize / 2,
  },
  dotHalo: {
    position: 'absolute',
    width: PLAYER_PROGRESS_DOT_CHROME.haloSize,
    height: PLAYER_PROGRESS_DOT_CHROME.haloSize,
    borderRadius: PLAYER_PROGRESS_DOT_CHROME.haloSize / 2,
    backgroundColor: PLAYER_PROGRESS_DOT_CHROME.color,
  },
  dot: {
    width: PLAYER_PROGRESS_DOT_CHROME.size,
    height: PLAYER_PROGRESS_DOT_CHROME.size,
    borderRadius: PLAYER_PROGRESS_DOT_CHROME.size / 2,
    borderWidth: 2,
    borderColor: Theme.bg,
    backgroundColor: PLAYER_PROGRESS_DOT_CHROME.color,
  },
});

import { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Theme, MOTION } from '../../constants/theme';
import { useFontScale } from '../ui';
import type { HapticEvent, SyncedLine } from '../../lib/types';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

function LyricDisplayBase({
  lines,
  currentLineIndex,
  cue,
  currentSize = 29,
  contextSize = 16,
}: {
  lines: SyncedLine[];
  currentLineIndex: number;
  cue: { id: number; type: HapticEvent['type'] } | null;
  currentSize?: number;
  contextSize?: number;
}) {
  const f = useFontScale();
  const enter = useSharedValue(1);

  useEffect(() => {
    if (currentLineIndex < 0) return;
    enter.value = 0;
    enter.value = withTiming(1, { duration: MOTION.dur.slow, easing: EASE_OUT });
  }, [currentLineIndex, enter]);

  const cur = currentLineIndex >= 0 ? lines[currentLineIndex] : null;
  const prev = currentLineIndex > 0 ? lines[currentLineIndex - 1] : null;
  const next = currentLineIndex >= 0 && currentLineIndex < lines.length - 1 ? lines[currentLineIndex + 1] : null;

  const currentStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * enter.value,
    transform: [{ translateY: 12 * (1 - enter.value) }],
  }));

  const curFs = Math.round(currentSize * f);
  const ctxFs = Math.round(contextSize * f);

  return (
    <View style={styles.wrap}>
      {prev ? (
        <Text numberOfLines={2} style={[styles.context, { fontSize: ctxFs, lineHeight: Math.round(ctxFs * 1.4) }]}>
          {prev.text}
        </Text>
      ) : (
        <View style={{ height: 8 }} />
      )}

      {cur ? (
        <Animated.Text style={[styles.current, { fontSize: curFs, lineHeight: Math.round(curFs * 1.12) }, currentStyle]}>
          {cur.text}
        </Animated.Text>
      ) : (
        <Text style={[styles.current, { color: Theme.textDim, fontSize: Math.round(20 * f), lineHeight: Math.round(24 * f) }]}>
          {lines.length === 0 ? 'Waiting for synced lyrics…' : 'Press play'}
        </Text>
      )}

      {next ? (
        <Text numberOfLines={2} style={[styles.context, { fontSize: ctxFs, lineHeight: Math.round(ctxFs * 1.4) }]}>
          {next.text}
        </Text>
      ) : (
        <View style={{ height: 8 }} />
      )}
    </View>
  );
}

export const LyricDisplay = memo(LyricDisplayBase);

const styles = StyleSheet.create({
  wrap: { gap: 18, justifyContent: 'center' },
  current: {
    color: Theme.text,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  context: {
    color: Theme.textFaint,
    textAlign: 'center',
    fontWeight: '500',
  },
});

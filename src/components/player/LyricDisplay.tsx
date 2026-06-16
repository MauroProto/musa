import { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Theme } from '../../constants/theme';
import { useFontScale } from '../ui';
import type { HapticEvent, SyncedLine } from '../../lib/types';

function LyricDisplayBase({
  lines,
  currentLineIndex,
  cue,
}: {
  lines: SyncedLine[];
  currentLineIndex: number;
  cue: { id: number; type: HapticEvent['type'] } | null;
}) {
  const f = useFontScale();
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!cue) return;
    if (cue.type === 'line_start' || cue.type === 'chorus' || cue.type === 'sustain') {
      glow.value = 0;
      glow.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }, () => {
        runOnJS(resetGlow)();
      });
    }
    function resetGlow() {
      glow.value = withTiming(0, { duration: 600 });
    }
  }, [cue, glow]);

  const cur = currentLineIndex >= 0 ? lines[currentLineIndex] : null;
  const prev = currentLineIndex > 0 ? lines[currentLineIndex - 1] : null;
  const next = currentLineIndex >= 0 && currentLineIndex < lines.length - 1 ? lines[currentLineIndex + 1] : null;

  const currentStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + 0.3 * glow.value,
    transform: [{ scale: 1 + 0.02 * glow.value }],
  }));

  return (
    <View style={styles.wrap}>
      {prev ? (
        <Text
          numberOfLines={2}
          style={[styles.context, { color: Theme.textFaint, fontSize: Math.round(16 * f) }]}
        >
          {prev.text}
        </Text>
      ) : (
        <View style={{ height: 8 }} />
      )}

      {cur ? (
        <Animated.Text
          style={[
            styles.current,
            {
              color: Theme.text,
              fontSize: Math.round(28 * f),
              textShadowColor: Theme.accent,
              textShadowRadius: 18 * glow.value,
            },
            currentStyle,
          ]}
        >
          {cur.text}
        </Animated.Text>
      ) : (
        <Text style={[styles.current, { color: Theme.textDim, fontSize: Math.round(22 * f) }]}>
          {lines.length === 0 ? 'Waiting for synced lyrics…' : 'Get ready…'}
        </Text>
      )}

      {next ? (
        <Text
          numberOfLines={2}
          style={[styles.context, { color: Theme.textDim, fontSize: Math.round(16 * f) }]}
        >
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
  wrap: { gap: 12, minHeight: 180, justifyContent: 'center' },
  current: {
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'center',
  },
  context: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

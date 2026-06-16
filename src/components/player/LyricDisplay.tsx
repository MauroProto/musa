import { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
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
      glow.value = withSequence(
        withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 620 }),
      );
    }
  }, [cue, glow]);

  const cur = currentLineIndex >= 0 ? lines[currentLineIndex] : null;
  const prev = currentLineIndex > 0 ? lines[currentLineIndex - 1] : null;
  const next = currentLineIndex >= 0 && currentLineIndex < lines.length - 1 ? lines[currentLineIndex + 1] : null;

  const currentStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + 0.15 * glow.value,
    transform: [{ scale: 1 + 0.012 * glow.value }],
  }));

  return (
    <View style={styles.wrap}>
      {prev ? (
        <Text numberOfLines={2} style={[styles.context, { color: Theme.textFaint, fontSize: Math.round(15 * f) }]}>
          {prev.text}
        </Text>
      ) : (
        <View style={{ height: 6 }} />
      )}

      {cur ? (
        <Animated.Text
          style={[
            styles.current,
            {
              color: Theme.text,
              fontSize: Math.round(26 * f),
              textShadowColor: Theme.accent,
              textShadowRadius: 22 * glow.value,
            },
            currentStyle,
          ]}
        >
          {cur.text}
        </Animated.Text>
      ) : (
        <Text style={[styles.current, { color: Theme.textDim, fontSize: Math.round(20 * f) }]}>
          {lines.length === 0 ? 'Waiting for synced lyrics…' : 'Press play'}
        </Text>
      )}

      {next ? (
        <Text numberOfLines={2} style={[styles.context, { color: Theme.textFaint, fontSize: Math.round(15 * f) }]}>
          {next.text}
        </Text>
      ) : (
        <View style={{ height: 6 }} />
      )}
    </View>
  );
}

export const LyricDisplay = memo(LyricDisplayBase);

const styles = StyleSheet.create({
  wrap: { gap: 10, minHeight: 170, justifyContent: 'center' },
  current: { fontWeight: '700', lineHeight: 36, textAlign: 'center' },
  context: { textAlign: 'center', lineHeight: 22 },
});

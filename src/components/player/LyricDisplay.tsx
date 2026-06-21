import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Theme, MOTION } from '../../constants/theme';
import { useFontScale } from '../ui';
import { resolvePlayerDisplayState } from '../../lib/player-display';
import { LYRIC_STACK_CHROME } from '../../lib/player-visual-chrome';
import type { GuidedDemoStep } from '../../lib/demo-guided';
import type { SensoryMoment, SyncedLine } from '../../lib/types';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

function LyricDisplayBase({
  lines,
  currentLineIndex,
  isPlaying,
  currentMs,
  activeMoments,
  guidedStep,
  currentSize = 29,
  contextSize = 16,
}: {
  lines: SyncedLine[];
  currentLineIndex: number;
  isPlaying: boolean;
  currentMs: number;
  activeMoments: SensoryMoment[];
  guidedStep?: GuidedDemoStep | null;
  currentSize?: number;
  contextSize?: number;
}) {
  const f = useFontScale();
  const enter = useSharedValue(1);
  const display = useMemo(
    () => resolvePlayerDisplayState({
      lines,
      currentLineIndex,
      isPlaying,
      currentMs,
      activeMoments,
      guidedStep,
    }),
    [activeMoments, currentLineIndex, currentMs, guidedStep, isPlaying, lines],
  );

  useEffect(() => {
    enter.value = 0;
    enter.value = withTiming(1, { duration: MOTION.dur.slow, easing: EASE_OUT });
  }, [display.mode, display.primaryText, enter]);

  const currentStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * enter.value,
    transform: [{ translateY: 12 * (1 - enter.value) }],
  }));

  const curFs = Math.round(currentSize * f);
  const ctxFs = Math.round(contextSize * f);
  const quietMode = display.mode === 'idle' || display.mode === 'empty';
  const contextSlotHeight = Math.round(ctxFs * 2.9);
  const currentSlotMinHeight = quietMode ? Math.round(58 * f) : Math.round(curFs * 2.36);
  const showThreeLineStack = LYRIC_STACK_CHROME.slots.length === 3;

  return (
    <View style={styles.wrap}>
      <View style={[styles.contextSlot, showThreeLineStack ? { minHeight: contextSlotHeight } : null]}>
        {display.previousText ? (
          <Text numberOfLines={2} style={[styles.context, styles.pastLine, { fontSize: ctxFs, lineHeight: Math.round(ctxFs * 1.36) }]}>
            {display.previousText}
          </Text>
        ) : display.statusLabel ? (
          <Text numberOfLines={1} style={[styles.status, { fontSize: Math.round(ctxFs * 0.72), lineHeight: Math.round(ctxFs * 1.05) }]}>
            {display.statusLabel.toUpperCase()}
          </Text>
        ) : null}
      </View>

      <View style={[styles.currentSlot, { minHeight: currentSlotMinHeight }]}>
        <Animated.Text
          numberOfLines={3}
          style={[
            styles.current,
            quietMode ? styles.currentIdle : null,
            { fontSize: quietMode ? Math.round(20 * f) : curFs, lineHeight: quietMode ? Math.round(24 * f) : Math.round(curFs * 1.12) },
            currentStyle,
          ]}
        >
          {display.primaryText}
        </Animated.Text>
      </View>

      <View style={[styles.contextSlot, showThreeLineStack ? { minHeight: contextSlotHeight } : null]}>
        {display.nextText ? (
          <Text numberOfLines={2} style={[styles.context, styles.nextLine, { fontSize: ctxFs, lineHeight: Math.round(ctxFs * 1.36) }]}>
            {display.nextText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const LyricDisplay = memo(LyricDisplayBase);

const styles = StyleSheet.create({
  wrap: { gap: 8, justifyContent: 'center' },
  contextSlot: {
    justifyContent: 'center',
  },
  currentSlot: {
    justifyContent: 'center',
  },
  current: {
    color: Theme.text,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0,
    textShadowColor: 'rgba(255,255,255,0.72)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  currentIdle: {
    color: Theme.textDim,
  },
  context: {
    color: Theme.textFaint,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0,
  },
  pastLine: {
    opacity: 0.72,
  },
  nextLine: {
    opacity: 0.88,
  },
  status: {
    color: Theme.textGhost,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0,
  },
});

import { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { Text, Touch } from '../ui';
import { MOTION, Theme } from '../../constants/theme';
import { AUDIO_MODE_OPTIONS, ISOLATABLE_STEMS, type AudioMode, type StemKind } from '../../lib/audio-client';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { usePreferences } from '../../store/preferences';

/**
 * Audio mode — a small, subtle text carousel. Active mode centred and clear;
 * neighbours sit smaller and faded on the sides. Swipe (or tap a side) to
 * change; the labels slide like a real carousel. No box, no icons.
 */
export function AudioModeControl() {
  const audioMode = usePreferences((s) => s.audioMode);
  const setAudioMode = usePreferences((s) => s.setAudioMode);
  const isolateStem = usePreferences((s) => s.isolateStem);
  const setIsolateStem = usePreferences((s) => s.setIsolateStem);
  const reduceMotion = useReducedMotion();

  const modes = AUDIO_MODE_OPTIONS;
  const n = modes.length;
  const idx = Math.max(0, modes.findIndex((m) => m.key === audioMode));

  const [width, setWidth] = useState(0);
  const slot = width > 0 ? width * 0.25 : 88;

  const position = useSharedValue(idx);
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const slotRef = useRef(slot);
  slotRef.current = slot;
  const draggingRef = useRef(false);
  const goRef = useRef((i: number) => {});
  goRef.current = (i: number) => setAudioMode(modes[Math.max(0, Math.min(n - 1, i))].key as AudioMode);

  useEffect(() => {
    if (draggingRef.current) return;
    position.value = reduceMotion ? idx : withSpring(idx, MOTION.spring.gentle);
  }, [idx, reduceMotion, position]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        draggingRef.current = true;
      },
      onPanResponderMove: (_, g) => {
        const p = idxRef.current - g.dx / slotRef.current;
        position.value = Math.max(-0.5, Math.min(n - 0.5, p));
      },
      onPanResponderRelease: (_, g) => {
        draggingRef.current = false;
        let target = Math.round(idxRef.current - g.dx / slotRef.current);
        target = Math.max(0, Math.min(n - 1, target));
        position.value = withSpring(target, MOTION.spring.gentle);
        if (target !== idxRef.current) goRef.current(target);
      },
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      <View
        style={styles.row}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        {...pan.panHandlers}
      >
        {modes.map((m, i) => (
          <ModeLabel key={m.key} label={m.label} index={i} active={i === idx} position={position} slot={slot} onPress={() => goRef.current(i)} />
        ))}
      </View>

      {audioMode === 'isolate' ? (
        <View style={styles.stemRow}>
          {ISOLATABLE_STEMS.map((stem) => {
            const active = isolateStem === stem.key;
            return (
              <Touch key={stem.key} onPress={() => setIsolateStem(stem.key as StemKind)} hitSlop={6} style={styles.stem}>
                <Text variant="label" weight={active ? '800' : '600'} color={active ? Theme.text : Theme.textFaint} style={{ letterSpacing: 0.4 }}>
                  {stem.label}
                </Text>
              </Touch>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function ModeLabel({
  label,
  index,
  active,
  position,
  slot,
  onPress,
}: {
  label: string;
  index: number;
  active: boolean;
  position: SharedValue<number>;
  slot: number;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const dist = Math.abs(index - position.value);
    const tx = (index - position.value) * slot;
    return {
      transform: [{ translateX: tx }, { scale: interpolate(dist, [0, 1], [1, 0.74], Extrapolation.CLAMP) }],
      opacity: interpolate(dist, [0, 0.5, 1.1], [1, 0.5, 0.2], Extrapolation.CLAMP),
    };
  });
  return (
    <Animated.View style={[styles.labelWrap, style]} pointerEvents="box-none">
      <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Audio: ${label}`}>
        <Text variant="caption" weight={active ? '800' : '400'} style={styles.label}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingTop: 2 },
  row: { height: 24, justifyContent: 'center', overflow: 'hidden' },
  labelWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  label: { color: Theme.text, fontSize: 13.5, letterSpacing: 0.2 },
  stemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  stem: { paddingVertical: 2 },
});

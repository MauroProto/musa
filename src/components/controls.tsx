import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Icon, type IconName } from './Icon';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GlassSurface } from './Glass';
import { Text } from './ui';
import { MOTION, RADIUS, Theme } from '../constants/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

/** A selectable option card — depth by fill, accent by teal indicator. */
export function SelectCard({
  title,
  hint,
  active,
  onPress,
  icon,
}: {
  title: string;
  hint?: string;
  active: boolean;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <GlassSurface
      onPress={onPress}
      radius={RADIUS.lg}
      elevation="none"
      fill={active ? 'strong' : 'whisper'}
      scaleTo={0.99}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={title}
      style={styles.option}
    >
      {icon ? (
        <View style={[styles.optionIcon, active ? styles.optionIconActive : null]}>
          <Icon name={icon} size={18} color={active ? Theme.teal : Theme.textDim} weight={active ? 'bold' : 'regular'} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="heading">{title}</Text>
        {hint ? <Text variant="caption" dim>{hint}</Text> : null}
      </View>
      <View style={[styles.radio, active ? styles.radioActive : null]} />
    </GlassSurface>
  );
}

/** Glass toggle switch. */
export function Toggle({
  label,
  desc,
  value,
  onToggle,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const p = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    p.value = reduceMotion ? (value ? 1 : 0) : withTiming(value ? 1 : 0, { duration: MOTION.dur.fast, easing: EASE_OUT });
  }, [value, reduceMotion, p]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ['rgba(11,12,14,0.12)', Theme.text]),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: p.value * 20 }],
    backgroundColor: interpolateColor(p.value, [0, 1], [Theme.textDim, Theme.bg]),
  }));

  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="body">{label}</Text>
        {desc ? <Text dim variant="caption">{desc}</Text> : null}
      </View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        accessibilityLabel={label}
        hitSlop={8}
      >
        <Animated.View style={[styles.switch, trackStyle]}>
          <Animated.View style={[styles.knob, knobStyle]} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

export type SegmentOption = { key: string; label: string; icon?: IconName };

/** Glass segmented control with a sliding active indicator. */
export function SegmentedControl({
  options,
  value,
  onChange,
  style,
}: {
  options: SegmentOption[];
  value: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
}) {
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const pad = 4;
  const itemWidth = width > 0 ? (width - pad * 2) / options.length : 0;
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const x = useSharedValue(index);

  useEffect(() => {
    x.value = reduceMotion ? index : withTiming(index, { duration: MOTION.dur.base, easing: EASE_OUT });
  }, [index, reduceMotion, x]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: Math.max(0, itemWidth),
    transform: [{ translateX: pad + x.value * itemWidth }],
  }));

  return (
    <GlassSurface radius={RADIUS.pill} elevation="none" fill="whisper" style={[styles.segWrap, style]}>
      <View style={styles.segRow} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {itemWidth > 0 ? <Animated.View style={[styles.segIndicator, indicatorStyle, { pointerEvents: 'none' }]} /> : null}
        {options.map((opt) => {
          const active = opt.key === value;
          return (
            <Pressable
              key={opt.key}
              style={styles.seg}
              onPress={() => onChange(opt.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={opt.label}
            >
              {opt.icon ? <Icon name={opt.icon} size={14} color={active ? Theme.bg : Theme.textDim} /> : null}
              <Text variant="label" weight="700" color={active ? Theme.bg : Theme.textDim} style={{ letterSpacing: 0 }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
}

/** Wizard progress dots/segments. */
export function WizardSteps({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.steps} accessibilityLabel={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.step, i < current ? styles.stepActive : null]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16 },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,12,14,0.05)',
  },
  optionIconActive: { backgroundColor: 'rgba(79,208,221,0.14)' },
  radio: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(11,12,14,0.18)' },
  radioActive: { backgroundColor: Theme.teal },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  switch: { width: 50, height: 30, borderRadius: 15, padding: 2, justifyContent: 'center' },
  knob: { width: 26, height: 26, borderRadius: 13 },
  segWrap: { padding: 4 },
  segRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  segIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: RADIUS.pill,
    backgroundColor: Theme.text,
  },
  seg: { flex: 1, minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  steps: { flexDirection: 'row', gap: 6 },
  step: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(11,12,14,0.14)' },
  stepActive: { backgroundColor: Theme.text },
});

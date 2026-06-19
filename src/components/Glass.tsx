import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ELEVATION, MOTION, RADIUS, Theme } from '../constants/theme';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Elevation = keyof typeof ELEVATION | 'none';
type SurfaceFill = 'regular' | 'strong' | 'whisper';

export type GlassSurfaceProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** @deprecated ignored — kept for API compatibility. */
  intensity?: number;
  fill?: SurfaceFill;
  /** @deprecated ignored — kept for API compatibility. */
  chroma?: boolean;
  /** @deprecated ignored — kept for API compatibility. */
  chromaStrength?: number;
  /** @deprecated ignored — kept for API compatibility. */
  highlight?: boolean;
  elevation?: Elevation;
  onPress?: () => void;
  onPressIn?: () => void;
  scaleTo?: number;
  disabled?: boolean;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
} & Pick<PressableProps, 'accessibilityLabel' | 'accessibilityRole' | 'accessibilityState' | 'accessibilityHint' | 'hitSlop'>;

/**
 * Minimalist flat surface (modern dark UI). Solid elevated background,
 * hairline border, optional soft shadow. No blur, no gradients, no fringe.
 * (Keeps the old "Glass" prop names so existing call sites keep working.)
 */
function surfaceColor(fill: SurfaceFill): string {
  if (fill === 'strong') return Theme.cardStrong;
  if (fill === 'whisper') return Theme.cardWhisper;
  return Theme.card;
}

export function GlassSurface({
  children,
  style,
  radius = RADIUS.card,
  intensity,
  fill = 'regular',
  chroma,
  chromaStrength,
  highlight,
  elevation = 'card',
  onPress,
  onPressIn,
  scaleTo = MOTION.press,
  disabled,
  pointerEvents,
  ...a11y
}: GlassSurfaceProps) {
  void intensity;
  void chroma;
  void chromaStrength;
  void highlight;
  const shadow = elevation === 'none' ? null : ELEVATION[elevation];
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const base: ViewStyle = {
    borderRadius: radius,
    backgroundColor: surfaceColor(fill),
  };

  if (onPress) {
    return (
      <AnimatedPressable
        {...a11y}
        accessibilityRole={a11y.accessibilityRole ?? 'button'}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(scaleTo, { duration: MOTION.dur.press, easing: EASE_OUT });
          onPressIn?.();
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: MOTION.dur.fast, easing: EASE_OUT });
        }}
        style={[base, shadow as ViewStyle, aStyle, style, disabled ? { opacity: 0.4 } : null]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[base, shadow as ViewStyle, style, pointerEvents ? { pointerEvents } : null]} {...a11y}>
      {children}
    </View>
  );
}

export function GlassCard({ children, style, onPress, radius = RADIUS.card, ...rest }: GlassSurfaceProps) {
  return (
    <GlassSurface radius={radius} onPress={onPress} style={[styles.card, style]} {...rest}>
      {children}
    </GlassSurface>
  );
}

export function GlassPill({
  children,
  style,
  onPress,
  active = false,
  ...rest
}: GlassSurfaceProps & { active?: boolean }) {
  return (
    <GlassSurface
      radius={RADIUS.pill}
      elevation="none"
      fill={active ? 'strong' : 'whisper'}
      onPress={onPress}
      scaleTo={MOTION.pressDeep}
      style={[styles.pill, style]}
      {...rest}
    >
      {children}
    </GlassSurface>
  );
}

export function GlassIconButton({
  children,
  size = 46,
  style,
  onPress,
  ...rest
}: GlassSurfaceProps & { size?: number }) {
  return (
    <GlassSurface
      radius={size / 2}
      elevation="none"
      fill="regular"
      onPress={onPress}
      scaleTo={MOTION.pressDeep}
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
      {...rest}
    >
      {children}
    </GlassSurface>
  );
}

/** Clean MUSA wordmark — tight tracking, high contrast. */
export function Wordmark({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <RNText style={[styles.wordmark, style]}>{children}</RNText>;
}

const styles = StyleSheet.create({
  card: { padding: 18, gap: 10 },
  pill: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
  },
  wordmark: {
    color: Theme.text,
    fontWeight: '800',
    letterSpacing: -1,
  },
});

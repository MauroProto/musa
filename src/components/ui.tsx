import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text as StyledText,
  useWindowDimensions,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme, FONT_SCALE_MULTIPLIER, RADIUS, MOTION } from '../constants/theme';
import { usePreferences, type FontScale } from '../store/preferences';
import { GlassSurface } from './Glass';

const WEB_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", system-ui, "Helvetica Neue", sans-serif';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Vertical clearance so content never hides behind the floating tab bar. */
export const TAB_BAR_CLEARANCE = 108;

export function useFontScale(): number {
  const scale = usePreferences((s) => s.fontScale) as FontScale;
  return FONT_SCALE_MULTIPLIER[scale] ?? 1;
}

/** Single breakpoint: wide web uses the "desktop" layout; everything else, mobile. */
export const WIDE_BREAKPOINT = 860;
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  return { width, height, isWeb, isWide: isWeb && width >= WIDE_BREAKPOINT };
}

function fontFamily(): string | undefined {
  return Platform.OS === 'web' ? WEB_FONT : undefined;
}

/** Pressable with a soft scale feedback (ease-out) — the detail that makes things feel alive. */
export function Touch({
  children,
  style,
  scaleTo = MOTION.press,
  disabled,
  ...rest
}: PressableProps & { children: ReactNode; style?: ViewStyle | ViewStyle[]; scaleTo?: number }) {
  const s = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPress={(e) => {
        blurFocusedWebElement();
        rest.onPress?.(e);
      }}
      onPressIn={(e) => {
        s.value = withTiming(scaleTo, { duration: MOTION.dur.press, easing: EASE_OUT });
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withTiming(1, { duration: MOTION.dur.fast, easing: EASE_OUT });
        rest.onPressOut?.(e);
      }}
      style={[style as ViewStyle, aStyle, disabled ? { opacity: 0.35 } : null]}
    >
      {children}
    </AnimatedPressable>
  );
}

function blurFocusedWebElement() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
}

type TextVariant = 'hero' | 'largeTitle' | 'title' | 'heading' | 'body' | 'caption' | 'mono' | 'label';

const BASE_SIZE: Record<TextVariant, number> = {
  hero: 46,
  largeTitle: 32,
  title: 25,
  heading: 18,
  body: 16,
  caption: 13.5,
  mono: 12.5,
  label: 11.5,
};

const TRACKING: Partial<Record<TextVariant, number>> = {
  hero: 0,
  largeTitle: 0,
  title: 0,
  heading: 0,
  body: 0,
  label: 0,
};

export function Text({
  children,
  variant = 'body',
  color = Theme.text,
  align = 'left',
  weight,
  style,
  dim,
  numberOfLines,
}: {
  children: ReactNode;
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: TextStyle['fontWeight'];
  style?: TextStyle;
  dim?: boolean;
  numberOfLines?: number;
}) {
  const f = useFontScale();
  const size = Math.round(BASE_SIZE[variant] * f);
  const resolvedColor = dim ? Theme.textDim : color;
  const lh =
    variant === 'hero' || variant === 'largeTitle'
      ? 1.08
      : variant === 'title'
        ? 1.16
        : variant === 'body'
          ? 1.45
          : 1.3;
  return (
    <StyledText
      style={{
        color: resolvedColor,
        fontSize: size,
        lineHeight: Math.round(size * lh),
        textAlign: align,
        fontWeight: weight ?? defaultWeight(variant),
        letterSpacing: TRACKING[variant] ?? 0,
        fontFamily: variant === 'mono' ? monoFamily() : fontFamily(),
        ...style,
      }}
      numberOfLines={numberOfLines}
    >
      {children}
    </StyledText>
  );
}

function defaultWeight(variant: TextVariant): TextStyle['fontWeight'] {
  if (variant === 'hero') return '800';
  if (variant === 'largeTitle') return '700';
  if (variant === 'title') return '700';
  if (variant === 'heading') return '600';
  if (variant === 'label') return '600';
  return '400';
}

function monoFamily(): string {
  return Platform.OS === 'web'
    ? 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace'
    : 'Menlo';
}

export function Screen({
  children,
  scroll = true,
  pad = 24,
  style,
  maxWidth = 560,
  center = false,
  bottomBarSpace = false,
  backdrop,
}: {
  children: ReactNode;
  scroll?: boolean;
  pad?: number;
  style?: ViewStyle;
  maxWidth?: number | null;
  center?: boolean;
  /** Add clearance for the floating tab bar. */
  bottomBarSpace?: boolean;
  /** Replace the default plain background entirely. */
  backdrop?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const extraBottom = bottomBarSpace ? TAB_BAR_CLEARANCE : 0;
  const containerStyle: ViewStyle = {
    flex: 1,
    paddingTop: insets.top + 8,
    paddingBottom: insets.bottom + 10,
  };
  const column: ViewStyle = {
    width: '100%',
    maxWidth: maxWidth ?? undefined,
    alignSelf: 'center',
  };
  const inner = (
    <View style={[{ paddingHorizontal: pad, gap: 20, paddingBottom: 48 + extraBottom }, column]}>{children}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: Theme.bg }}>
      {backdrop ?? null}
      {scroll ? (
        <View style={containerStyle}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: center ? 'center' : 'flex-start', paddingBottom: extraBottom, ...style }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {inner}
          </ScrollView>
        </View>
      ) : (
        <View style={[containerStyle, style]}>
          <View style={[{ paddingHorizontal: pad, flex: 1, gap: 20, paddingBottom: extraBottom }, column]}>{children}</View>
        </View>
      )}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  full = true,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  full?: boolean;
}) {
  const f = useFontScale();
  const labelNode = (color: string) => (
    <StyledText
      style={{
        color,
        fontSize: Math.round(16.5 * f),
        fontWeight: '600',
        letterSpacing: 0,
        textAlign: 'center',
        fontFamily: fontFamily(),
      }}
    >
      {label}
    </StyledText>
  );

  // Secondary → soft grey surface.
  if (variant === 'secondary') {
    return (
      <GlassSurface
        onPress={onPress}
        disabled={disabled}
        radius={RADIUS.pill}
        elevation="none"
        fill="regular"
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.button, { width: full ? '100%' : undefined }, style as ViewStyle]}
      >
        <View style={styles.buttonInner}>
          {icon}
          {labelNode(Theme.text)}
        </View>
      </GlassSurface>
    );
  }

  const palette =
    variant === 'ghost'
      ? { bg: 'transparent' as string, fg: Theme.textDim }
      : { bg: Theme.accent, fg: Theme.accentText };

  return (
    <Touch
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles.buttonInner,
        { backgroundColor: palette.bg, width: full ? '100%' : undefined },
        style as ViewStyle,
      ]}
    >
      {icon}
      {labelNode(palette.fg)}
    </Touch>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  return (
    <GlassSurface
      onPress={onPress}
      radius={RADIUS.card}
      elevation="card"
      fill="regular"
      style={[styles.card, style as ViewStyle]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {children}
    </GlassSurface>
  );
}

export function Stack({ children, gap = 14, style }: { children: ReactNode; gap?: number; style?: ViewStyle }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.pill,
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    paddingHorizontal: 22,
  },
  card: {
    padding: 20,
    gap: 10,
  },
});

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
import { Backdrop } from './Backdrop';

const WEB_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", system-ui, "Helvetica Neue", sans-serif';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function useFontScale(): number {
  const scale = usePreferences((s) => s.fontScale) as FontScale;
  return FONT_SCALE_MULTIPLIER[scale] ?? 1;
}

/** Breakpoint único: en web ancho usamos la interfaz "desktop"; el resto, la móvil. */
export const WIDE_BREAKPOINT = 860;
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  return { width, height, isWeb, isWide: isWeb && width >= WIDE_BREAKPOINT };
}

function fontFamily(): string | undefined {
  return Platform.OS === 'web' ? WEB_FONT : undefined;
}

/** Presionable con feedback de escala suave (ease-out) — el detalle que hace todo "vivo". */
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
  lift = 0.05,
  maxWidth = 560,
  center = false,
}: {
  children: ReactNode;
  scroll?: boolean;
  pad?: number;
  style?: ViewStyle;
  lift?: number;
  maxWidth?: number | null;
  center?: boolean;
}) {
  const insets = useSafeAreaInsets();
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
    <View style={[{ paddingHorizontal: pad, gap: 20, paddingBottom: 48 }, column]}>{children}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: Theme.bg }}>
      <Backdrop lift={lift} />
      {scroll ? (
        <View style={containerStyle}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: center ? 'center' : 'flex-start', ...style }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {inner}
          </ScrollView>
        </View>
      ) : (
        <View style={[containerStyle, style]}>
          <View style={[{ paddingHorizontal: pad, flex: 1, gap: 20 }, column]}>{children}</View>
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
  const palette = {
    primary: { bg: Theme.accent, fg: Theme.accentText, border: 'transparent' as string },
    secondary: { bg: Theme.surfaceStrong, fg: Theme.text, border: Theme.border },
    ghost: { bg: 'transparent' as string, fg: Theme.textDim, border: 'transparent' as string },
  }[variant];
  return (
    <Touch
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          width: full ? '100%' : undefined,
        },
        style as ViewStyle,
      ]}
    >
      {icon}
      <StyledText
        style={{
          color: palette.fg,
          fontSize: Math.round(16.5 * f),
          fontWeight: '600',
          letterSpacing: 0,
          textAlign: 'center',
          fontFamily: fontFamily(),
        }}
      >
        {label}
      </StyledText>
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
  if (onPress) {
    return (
      <Touch onPress={onPress} style={[styles.card, style as ViewStyle]}>
        {children}
      </Touch>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Stack({ children, gap = 14, style }: { children: ReactNode; gap?: number; style?: ViewStyle }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    paddingHorizontal: 22,
    borderRadius: RADIUS.pill,
    minHeight: 56,
  },
  card: {
    backgroundColor: Theme.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
});

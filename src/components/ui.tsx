import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, Text as StyledText, type ViewStyle, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme, FONT_SCALE_MULTIPLIER } from '../constants/theme';
import { usePreferences, type FontScale } from '../store/preferences';

const WEB_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", system-ui, "Helvetica Neue", sans-serif';

export function useFontScale(): number {
  const scale = usePreferences((s) => s.fontScale) as FontScale;
  return FONT_SCALE_MULTIPLIER[scale] ?? 1;
}

function fontFamily(): string | undefined {
  return Platform.OS === 'web' ? WEB_FONT : undefined;
}

type TextVariant = 'hero' | 'largeTitle' | 'title' | 'heading' | 'body' | 'caption' | 'mono' | 'label';

const BASE_SIZE: Record<TextVariant, number> = {
  hero: 40,
  largeTitle: 34,
  title: 27,
  heading: 20,
  body: 17,
  caption: 14,
  mono: 14,
  label: 12,
};

const TRACKING: Partial<Record<TextVariant, number>> = {
  hero: -1.2,
  largeTitle: -0.8,
  title: -0.5,
  heading: -0.2,
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
  return (
    <StyledText
      style={{
        color: resolvedColor,
        fontSize: size,
        lineHeight: Math.round(size * (variant === 'hero' || variant === 'largeTitle' ? 1.12 : variant === 'title' ? 1.18 : 1.32)),
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
  if (variant === 'hero' || variant === 'largeTitle' || variant === 'title') return '700';
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
  bg = Theme.bg,
}: {
  children: ReactNode;
  scroll?: boolean;
  pad?: number;
  style?: ViewStyle;
  bg?: string;
}) {
  const insets = useSafeAreaInsets();
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: bg,
    paddingTop: insets.top + 6,
    paddingBottom: insets.bottom + 8,
  };
  const inner = (
    <View style={{ paddingHorizontal: pad, gap: 22, paddingBottom: 48 }}>{children}</View>
  );
  if (scroll) {
    return (
      <View style={containerStyle}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, ...style }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {inner}
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={[containerStyle, style]}>
      <View style={{ paddingHorizontal: pad, flex: 1, gap: 22 }}>{children}</View>
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
    primary: { bg: Theme.accent, fg: Theme.accentText },
    secondary: { bg: Theme.surfaceAlt, fg: Theme.text },
    ghost: { bg: 'transparent', fg: Theme.accent },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.bg,
          opacity: disabled ? 0.35 : pressed ? 0.7 : 1,
          width: full ? '100%' : undefined,
        },
        style,
      ]}
    >
      {icon}
      <StyledText
        style={{
          color: palette.fg,
          fontSize: Math.round(17 * f),
          fontWeight: '600',
          textAlign: 'center',
          fontFamily: fontFamily(),
        }}
      >
        {label}
      </StyledText>
    </Pressable>
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
  const inner = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

export function Stack({ children, gap = 16, style }: { children: ReactNode; gap?: number; style?: ViewStyle }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 999,
    minHeight: 54,
  },
  card: {
    backgroundColor: Theme.surface,
    borderRadius: 22,
    padding: 20,
    gap: 10,
  },
});

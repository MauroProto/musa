import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Text as StyledText, type ViewStyle, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme, FONT_SCALE_MULTIPLIER } from '../constants/theme';
import { usePreferences, type FontScale } from '../store/preferences';

export function useFontScale(): number {
  const scale = usePreferences((s) => s.fontScale) as FontScale;
  return FONT_SCALE_MULTIPLIER[scale] ?? 1;
}

type TextVariant = 'hero' | 'title' | 'heading' | 'body' | 'caption' | 'mono' | 'label';

const BASE_SIZE: Record<TextVariant, number> = {
  hero: 34,
  title: 27,
  heading: 21,
  body: 17,
  caption: 14,
  mono: 15,
  label: 13,
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
  const fontWeight =
    weight ?? (variant === 'hero' || variant === 'title' ? 'bold' : variant === 'heading' ? '600' : '400');
  return (
    <StyledText
      style={{
        color: dim ? Theme.textDim : color,
        fontSize: size,
        lineHeight: Math.round(size * 1.35),
        textAlign: align,
        fontWeight,
        fontFamily: variant === 'mono' ? 'Courier' : undefined,
        ...style,
      }}
      numberOfLines={numberOfLines}
    >
      {children}
    </StyledText>
  );
}

export function Screen({
  children,
  scroll = true,
  pad = 22,
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
    paddingTop: insets.top + 8,
    paddingBottom: insets.bottom + 8,
  };
  const inner = (
    <View style={{ paddingHorizontal: pad, gap: 18, paddingBottom: 40 }}>{children}</View>
  );
  if (scroll) {
    return (
      <View style={containerStyle}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, ...style }} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={[containerStyle, style]}>
      <View style={{ paddingHorizontal: pad, flex: 1, gap: 18 }}>{children}</View>
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
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'soft';
  icon?: ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const f = useFontScale();
  const palette = {
    primary: { bg: Theme.accent, fg: '#03121A', border: Theme.accent },
    ghost: { bg: 'transparent', fg: Theme.text, border: Theme.border },
    soft: { bg: Theme.surfaceAlt, fg: Theme.text, border: Theme.border },
    danger: { bg: 'transparent', fg: Theme.danger, border: Theme.danger },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.4 : pressed ? 0.82 : 1,
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
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.86 : 1 }]}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

export function Chip({
  label,
  color = Theme.accent,
  selected = false,
}: {
  label: string;
  color?: string;
  selected?: boolean;
}) {
  return (
    <View
      style={[
        styles.chip,
        {
          borderColor: selected ? color : Theme.border,
          backgroundColor: selected ? `${color}22` : Theme.surface,
        },
      ]}
    >
      <StyledText style={{ color: selected ? color : Theme.textDim, fontSize: 13, fontWeight: '600' }}>
        {label}
      </StyledText>
    </View>
  );
}

export function Stack({ children, gap = 12, style }: { children: ReactNode; gap?: number; style?: ViewStyle }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 56,
  },
  card: {
    backgroundColor: Theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.border,
    padding: 18,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
});

import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icon';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassSurface } from './Glass';
import { NowPlayingBar } from './NowPlayingBar';
import { Text } from './ui';
import { MOTION, Theme } from '../constants/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { previewHaptic } from '../lib/haptics';
import { usePreferences } from '../store/preferences';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

type TabMeta = { label: string; icon: IconName };

const TAB_META: Record<string, TabMeta> = {
  search: { label: 'Songs', icon: 'search' },
  demo: { label: 'Demo', icon: 'vinyl' },
  legend: { label: 'Touch', icon: 'wave' },
};

/**
 * Floating liquid-glass tab bar.
 * 3 destination tabs (Songs · Demo · Touch) + a Settings action that opens the
 * full-screen calibration/settings page. An animated capsule tracks the active
 * tab; everything is keyboard/AT-labelled and respects reduced motion.
 */
export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const strength = usePreferences((s) => s.strength);
  const [barWidth, setBarWidth] = useState(0);

  const routes = state.routes.filter((r) => TAB_META[r.name]);
  const itemCount = routes.length + 1; // + Settings
  const innerPad = 6;
  const itemWidth = barWidth > 0 ? (barWidth - innerPad * 2) / itemCount : 0;

  const indicator = useSharedValue(state.index);
  const indicatorStyle = useAnimatedStyle(() => ({
    width: Math.max(0, itemWidth),
    transform: [{ translateX: innerPad + indicator.value * itemWidth }],
  }));

  function go(routeName: string, index: number, isFocused: boolean) {
    indicator.value = reduceMotion
      ? index
      : withTiming(index, { duration: MOTION.dur.base, easing: EASE_OUT });
    previewHaptic('line_start', strength, 0.4);
    const event = navigation.emit({ type: 'tabPress', target: state.routes.find((r) => r.name === routeName)?.key ?? '', canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  }

  return (
    <View style={[styles.dock, { paddingBottom: insets.bottom + 10, pointerEvents: 'box-none' }]}>
      <NowPlayingBar />
      <GlassSurface
        radius={26}
        elevation="bar"
        fill="strong"
        style={styles.bar}
        pointerEvents="box-none"
      >
        <View style={styles.row} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
          {/* moving active capsule */}
          {itemWidth > 0 ? (
            <Animated.View style={[styles.capsule, indicatorStyle, { pointerEvents: 'none' }]} />
          ) : null}

          {routes.map((route) => {
            const meta = TAB_META[route.name];
            const index = state.routes.indexOf(route);
            const isFocused = state.index === index;
            return (
              <Pressable
                key={route.key}
                onPress={() => go(route.name, index, isFocused)}
                style={styles.item}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={meta.label}
                hitSlop={6}
              >
                <Icon
                  name={meta.icon}
                  size={22}
                  weight={isFocused ? 'fill' : 'regular'}
                  color={isFocused ? Theme.text : Theme.textFaint}
                />
                <Text
                  variant="label"
                  color={isFocused ? Theme.text : Theme.textFaint}
                  weight={isFocused ? '700' : '600'}
                  style={styles.label}
                >
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}

          {/* Settings action — opens full-screen calibration */}
          <Pressable
            onPress={() => {
              previewHaptic('line_start', strength, 0.4);
              router.push('/calibrate');
            }}
            style={styles.item}
            accessibilityRole="button"
            accessibilityLabel="Settings and haptic calibration"
            hitSlop={6}
          >
            <Icon name="settings" size={22} color={Theme.textFaint} />
            <Text variant="label" color={Theme.textFaint} weight="600" style={styles.label}>
              Settings
            </Text>
          </Pressable>
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bar: {
    width: '100%',
    maxWidth: 460,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  capsule: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 18,
    backgroundColor: Theme.card,
  },
  item: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
  },
  label: {
    letterSpacing: 0,
    fontSize: Platform.OS === 'web' ? 11 : 10.5,
  },
});

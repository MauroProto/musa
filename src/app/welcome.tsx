import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wordmark } from '../components/Glass';
import { Icon } from '../components/Icon';
import { Text, useResponsive } from '../components/ui';
import { MOTION } from '../constants/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { previewHaptic } from '../lib/haptics';
import {
  ENTER_MUSA_TARGET,
  enterMusaDelayMs,
  shouldCompleteOnboardingOnEnter,
} from '../lib/onboarding-entry';
import { usePreferences } from '../store/preferences';

const HERO = require('../../assets/images/musa-hero-background-person.png');
const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);
const EASE_SOFT = Easing.bezier(MOTION.easeSoft[0], MOTION.easeSoft[1], MOTION.easeSoft[2], MOTION.easeSoft[3]);

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { isWide, width } = useResponsive();
  const reducedMotion = useReducedMotion();
  const completeOnboarding = usePreferences((s) => s.completeOnboarding);
  const strength = usePreferences((s) => s.strength);
  const [entering, setEntering] = useState(false);

  const intro = useSharedValue(reducedMotion ? 1 : 0);
  const ambient = useSharedValue(0);
  const ring = useSharedValue(0);
  const press = useSharedValue(1);
  const exit = useSharedValue(0);

  useEffect(() => {
    intro.value = reducedMotion
      ? 1
      : withTiming(1, { duration: 760, easing: EASE_OUT });
    ambient.value = reducedMotion
      ? 0
      : withRepeat(withTiming(1, { duration: 2200, easing: EASE_SOFT }), -1, true);
    ring.value = reducedMotion
      ? 0
      : withRepeat(
          withSequence(
            withTiming(1, { duration: 1700, easing: EASE_OUT }),
            withTiming(0, { duration: 0 }),
          ),
          -1,
          false,
        );
  }, [ambient, intro, reducedMotion, ring]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(exit.value, [0, 1], [1, 0.82]),
    transform: [
      { scale: interpolate(intro.value, [0, 1], [1.06, 1]) + exit.value * 0.035 },
      { translateY: interpolate(ambient.value, [0, 1], [0, -7]) },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(intro.value, [0, 1], [0, 1]) * interpolate(exit.value, [0, 1], [1, 0]),
    transform: [
      { translateY: interpolate(intro.value, [0, 1], [22, 0]) + exit.value * -18 },
      { scale: interpolate(exit.value, [0, 1], [1, 0.985]) },
    ],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.72, 1], [0.22, 0.08, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.94, 1.18]) }],
  }));

  function enterMusa() {
    if (entering) return;
    setEntering(true);
    previewHaptic('line_start', strength, 0.6);
    press.value = withSequence(
      withTiming(0.96, { duration: 80, easing: EASE_OUT }),
      withTiming(1.025, { duration: 150, easing: EASE_OUT }),
      withTiming(1, { duration: 120, easing: EASE_OUT }),
    );
    exit.value = withTiming(1, { duration: reducedMotion ? 80 : 260, easing: EASE_OUT });

    if (shouldCompleteOnboardingOnEnter()) completeOnboarding();
    setTimeout(() => router.replace(ENTER_MUSA_TARGET), enterMusaDelayMs(reducedMotion));
  }

  return (
    <View style={styles.fill}>
      <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
        <ImageBackground source={HERO} resizeMode="cover" style={styles.heroImage}>
          <LinearGradient
            colors={['rgba(0,0,0,0.16)', 'rgba(0,0,0,0.22)', 'rgba(0,0,0,0.82)']}
            locations={[0, 0.46, 1]}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      </Animated.View>

      <View style={[styles.topBar, { paddingTop: insets.top + 18 }]}>
        <Wordmark style={styles.wordmark}>MUSA</Wordmark>
        <View style={styles.pill}>
          <Icon name="handTap" size={14} color="#FFFFFF" weight="fill" />
          <Text style={styles.pillText}>Haptic music</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            paddingBottom: insets.bottom + 34,
            paddingHorizontal: isWide ? 56 : 24,
            maxWidth: isWide ? Math.min(width - 112, 620) : 460,
          },
          contentStyle,
        ]}
      >
        <View style={styles.copy}>
          <Text style={styles.kicker}>FEEL THE SONG BEFORE IT STARTS</Text>
          <Text style={isWide ? styles.titleWide : styles.title}>Enter MUSA</Text>
          <Text style={styles.subtitle}>
            A tactile way into music: lyrics, rhythm, bass, guitar and emotion translated for your hands.
          </Text>
        </View>

        <Animated.View style={[styles.ctaWrap, buttonStyle]}>
          <Animated.View pointerEvents="none" style={[styles.ctaRing, ringStyle]} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter MUSA"
            disabled={entering}
            onPress={enterMusa}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed, entering && styles.ctaEntering]}
          >
            <View style={styles.ctaIcon}>
              <Icon name="wave" size={21} color="#0B0C0E" weight="bold" />
            </View>
            <Text style={styles.ctaText}>{entering ? 'Opening' : 'Enter MUSA'}</Text>
            <Icon name="arrowRight" size={20} color="#0B0C0E" weight="bold" />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#050506',
    overflow: 'hidden',
  },
  heroImage: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 20,
    letterSpacing: 0,
  },
  pill: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  pillText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    zIndex: 3,
    width: '100%',
    alignSelf: 'center',
    gap: 26,
  },
  copy: {
    gap: 10,
  },
  kicker: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 58,
    lineHeight: 58,
    fontWeight: '900',
    letterSpacing: 0,
  },
  titleWide: {
    color: '#FFFFFF',
    fontSize: 72,
    lineHeight: 72,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    maxWidth: 440,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '500',
  },
  ctaWrap: {
    alignSelf: 'flex-start',
  },
  ctaRing: {
    position: 'absolute',
    top: -7,
    right: -7,
    bottom: -7,
    left: -7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  cta: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  ctaPressed: {
    opacity: 0.94,
  },
  ctaEntering: {
    opacity: 0.88,
  },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,12,14,0.08)',
  },
  ctaText: {
    color: '#0B0C0E',
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
  },
});

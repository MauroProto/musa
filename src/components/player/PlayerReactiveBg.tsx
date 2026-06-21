import { memo, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { MOTION, CUE_BLOOMS } from '../../constants/theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import {
  PLAYER_BACKGROUND_BASE,
  PLAYER_BACKGROUND_BLOOMS,
  PLAYER_BACKGROUND_GRAIN,
  PLAYER_BACKGROUND_TEXTURE,
  cueBloomLayoutFor,
  type PlayerBackgroundBloom,
} from '../../lib/player-visual-chrome';
import type { HapticEventType } from '../../lib/types';

const GLOW = require('../../../assets/images/logo-glow.png');
const SINE = Easing.inOut(Easing.sin);
const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

/**
 * Each semantic cue lights the background a meaningful colour — so the pulse
 * *means* something. Sourced from CUE_BLOOMS so the palette stays consistent
 * across the app. Bass=deep blue · Drums=recording-red · Guitar=electric cyan ·
 * Voice=amber · Emotion=plum · Chorus=ember · Build=sky · Release=cool grey.
 */
export function colorForCue(type?: HapticEventType): string {
  switch (type) {
    case 'bass_pulse':
      return CUE_BLOOMS.bass;
    case 'drum_fill':
    case 'beat':
      return CUE_BLOOMS.drums;
    case 'guitar_riff':
    case 'guitar_strum':
      return CUE_BLOOMS.guitar;
    case 'line_start':
    case 'sustain':
      return CUE_BLOOMS.voice;
    case 'mood_shift':
      return CUE_BLOOMS.emotion;
    case 'chorus':
      return CUE_BLOOMS.chorus;
    case 'chorus_warning':
    case 'energy_rise':
      return CUE_BLOOMS.build;
    case 'section_end':
      return CUE_BLOOMS.release;
    default:
      return CUE_BLOOMS.neutral;
  }
}

/**
 * Player background — a calm field that reacts to the music. A soft monochrome
 * glow breathes with the vocal envelope, and every semantic cue blooms a short,
 * meaningful colour pulse on top. Subtle on the light canvas; still under
 * reduced motion.
 */
export const PlayerReactiveBg = memo(function PlayerReactiveBg({
  vocal = 0,
  energy = 0.35,
  beat = 0,
  playing = false,
  cueType,
  cueId = 0,
}: {
  vocal?: number;
  energy?: number;
  beat?: number;
  playing?: boolean;
  cueType?: HapticEventType;
  cueId?: number;
}) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  const breathe = useSharedValue(0);
  const voice = useSharedValue(0);
  const live = useSharedValue(0.2);
  const punch = useSharedValue(0);
  const cueBloom = useSharedValue(0);
  const [cueColor, setCueColor] = useState('#7A7F8A');
  const [cueLayout, setCueLayout] = useState(cueBloomLayoutFor());

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(breathe);
      breathe.value = 0.4;
      return;
    }
    breathe.value = withRepeat(withTiming(1, { duration: MOTION.dur.ambient, easing: SINE }), -1, true);
    return () => cancelAnimation(breathe);
  }, [reduceMotion, breathe]);

  useEffect(() => {
    voice.value = withTiming(vocal, { duration: reduceMotion ? 0 : 150, easing: EASE_OUT });
  }, [vocal, reduceMotion, voice]);

  useEffect(() => {
    live.value = withTiming(Math.max(0.12, energy), { duration: reduceMotion ? 0 : 240, easing: EASE_OUT });
  }, [energy, reduceMotion, live]);

  useEffect(() => {
    if (reduceMotion || !playing || beat <= 0) return;
    punch.value = withSequence(
      withTiming(1, { duration: 90, easing: EASE_OUT }),
      withTiming(0, { duration: 420, easing: EASE_OUT }),
    );
  }, [beat, reduceMotion, playing, punch]);

  // Coloured bloom on every semantic cue.
  useEffect(() => {
    if (!cueId || reduceMotion) return;
    setCueColor(colorForCue(cueType));
    setCueLayout(cueBloomLayoutFor(cueType));
    cueBloom.value = 0;
    cueBloom.value = withSequence(
      withTiming(1, { duration: 130, easing: EASE_OUT }),
      withTiming(0, { duration: 780, easing: EASE_OUT }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cueId]);

  const size = Math.max(width, height) * 1.25;
  const cx = width / 2;
  const cy = height * 0.48;
  const cueSize = size * cueLayout.size;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.backdrop]}>
      <LinearGradient
        colors={[...PLAYER_BACKGROUND_BASE.washColors]}
        locations={[...PLAYER_BACKGROUND_BASE.washLocations]}
        start={{ x: 0.04, y: 0.12 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {PLAYER_BACKGROUND_BLOOMS.map((bloom) => (
        <AmbientBloom
          key={bloom.key}
          bloom={bloom}
          size={size * bloom.size}
          width={width}
          height={height}
          breathe={breathe}
          live={live}
          punch={punch}
        />
      ))}
      {PLAYER_BACKGROUND_TEXTURE.enabled ? <TextureLayer size={size} width={width} height={height} breathe={breathe} live={live} /> : null}
      {PLAYER_BACKGROUND_GRAIN.enabled ? <GrainField width={width} height={height} /> : null}
      {/* monochrome base — breathes with the voice */}
      <MonoGlow size={size * 0.92} left={cx - (size * 0.92) / 2} top={cy - (size * 0.92) / 2} base={0.08} react={0.45} breathe={breathe} voice={voice} live={live} punch={punch} />
      {/* meaningful colour pulse on each cue */}
      <ColorGlow
        size={cueSize}
        left={width * cueLayout.x - cueSize / 2}
        top={height * cueLayout.y - cueSize / 2}
        color={cueColor}
        bloom={cueBloom}
        maxOpacity={cueLayout.opacity}
      />
    </View>
  );
});

function AmbientBloom({
  bloom,
  size,
  width,
  height,
  breathe,
  live,
  punch,
}: {
  bloom: PlayerBackgroundBloom;
  size: number;
  width: number;
  height: number;
  breathe: SharedValue<number>;
  live: SharedValue<number>;
  punch: SharedValue<number>;
}) {
  const left = width * bloom.x - size / 2;
  const top = height * bloom.y - size / 2;
  const style = useAnimatedStyle(() => {
    const wave = bloom.reverse ? 1 - breathe.value : breathe.value;
    const energy = live.value;
    const scale = 0.96 + wave * 0.08 + energy * 0.08 + punch.value * 0.035;
    const ty = (wave - 0.5) * bloom.drift - energy * 8;
    return {
      opacity: bloom.opacity * (0.72 + energy * 0.46 + punch.value * 0.32),
      transform: [{ translateY: ty }, { scale }],
    };
  });

  return (
    <Animated.Image
      source={GLOW}
      resizeMode="contain"
      tintColor={bloom.color}
      style={[{ position: 'absolute', left, top, width: size, height: size }, style]}
    />
  );
}

function TextureLayer({
  size,
  width,
  height,
  breathe,
  live,
}: {
  size: number;
  width: number;
  height: number;
  breathe: SharedValue<number>;
  live: SharedValue<number>;
}) {
  const textureSize = size * PLAYER_BACKGROUND_TEXTURE.scale;
  const style = useAnimatedStyle(() => ({
    opacity: PLAYER_BACKGROUND_TEXTURE.opacity * (0.72 + live.value * 0.32),
    transform: [{ translateY: (breathe.value - 0.5) * 10 }, { scale: 0.98 + breathe.value * 0.025 }],
  }));

  return (
    <Animated.Image
      source={GLOW}
      resizeMode="cover"
      tintColor={PLAYER_BACKGROUND_TEXTURE.tintColor}
      style={[
        {
          position: 'absolute',
          left: width / 2 - textureSize / 2,
          top: height / 2 - textureSize / 2,
          width: textureSize,
          height: textureSize,
        },
        style,
      ]}
    />
  );
}

function GrainField({ width, height }: { width: number; height: number }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {PLAYER_BACKGROUND_GRAIN.dots.map((dot) => {
        const size = dot.size;
        return (
          <View
            key={dot.key}
            style={{
              position: 'absolute',
              left: width * dot.x,
              top: height * dot.y,
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: dot.opacity,
              backgroundColor: PLAYER_BACKGROUND_GRAIN.color,
            }}
          />
        );
      })}
    </View>
  );
}

function MonoGlow({
  size,
  left,
  top,
  base,
  react,
  breathe,
  voice,
  live,
  punch,
}: {
  size: number;
  left: number;
  top: number;
  base: number;
  react: number;
  breathe: SharedValue<number>;
  voice: SharedValue<number>;
  live: SharedValue<number>;
  punch: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const bloom = voice.value;
    const e = live.value;
    const b = breathe.value;
    const kick = punch.value;
    const scale = 0.82 + b * 0.07 + e * 0.16 + bloom * 0.6 + kick * 0.07;
    const ty = -bloom * 24 - e * 8;
    const opacity = base * (0.55 + e * 0.5 + bloom * react + kick * 0.3);
    return { opacity: Math.min(0.4, opacity), transform: [{ translateY: ty }, { scale }] };
  });
  return (
    <Animated.Image source={GLOW} resizeMode="contain" tintColor="#0B0C0E" style={[{ position: 'absolute', left, top, width: size, height: size }, style]} />
  );
}

function ColorGlow({
  size,
  left,
  top,
  color,
  bloom,
  maxOpacity,
}: {
  size: number;
  left: number;
  top: number;
  color: string;
  bloom: SharedValue<number>;
  maxOpacity: number;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: bloom.value * maxOpacity,
    transform: [{ scale: 0.55 + bloom.value * 0.7 }],
  }));
  return (
    <Animated.Image source={GLOW} resizeMode="contain" tintColor={color} style={[{ position: 'absolute', left, top, width: size, height: size }, style]} />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    overflow: 'hidden',
    backgroundColor: PLAYER_BACKGROUND_BASE.color,
  },
});

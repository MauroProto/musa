import { memo, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MOTION, Theme } from '../../constants/theme';
import { Text } from '../ui';
import { Icon } from '../Icon';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { PlayerReactiveBg } from '../player/PlayerReactiveBg';
import { ChorusCountdown } from '../player/ChorusCountdown';
import { cueIcon, cueLabel } from '../player/sensory-panel-copy';
import type { HapticEventType } from '../../lib/types';

const SINE = Easing.inOut(Easing.sin);
const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

/**
 * The centerpiece of the pocket player: a big, glanceable tactile field.
 * A large disc breathes with the song's energy and kicks on every beat, the
 * reactive background blooms per cue, and a single line names what you're
 * feeling. Designed to be readable from arm's length, in a dark room.
 */
export const PocketStage = memo(function PocketStage({
  title,
  artist,
  note,
  vocal,
  energy,
  beat,
  cueType,
  cueId,
  chorusMsAway,
}: {
  title: string;
  artist: string;
  note?: string;
  vocal: number;
  energy: number;
  beat: number;
  cueType?: HapticEventType;
  cueId?: number;
  chorusMsAway: number | null;
}) {
  const { width } = useWindowDimensions();
  const disc = Math.min(width * 0.62, 300);

  return (
    <View style={styles.fill}>
      <PlayerReactiveBg vocal={vocal} energy={energy} beat={beat} playing cueType={cueType} cueId={cueId} />

      <View style={styles.header}>
        <Text variant="label" color={Theme.textFaint} style={styles.now}>NOW FEELING</Text>
        <Text variant="title" align="center" numberOfLines={2}>{title}</Text>
        <Text variant="caption" dim align="center" numberOfLines={1}>
          {artist}{note ? `  ·  ${note}` : ''}
        </Text>
      </View>

      <View style={styles.center}>
        <PulseDisc size={disc} energy={energy} beat={beat}>
          <Icon name={cueIcon(cueType)} size={Math.round(disc * 0.17)} color={Theme.text} weight="regular" />
          <Text variant="heading" align="center" style={{ marginTop: 10 }} numberOfLines={2}>
            {cueType ? cueLabel(cueType) : 'Feeling the room'}
          </Text>
        </PulseDisc>
      </View>

      <View style={styles.footer}>
        <ChorusCountdown msAway={chorusMsAway} />
      </View>
    </View>
  );
});

/** A large concentric disc: outer halo breathes with energy, inner kicks on beat. */
function PulseDisc({
  size,
  energy,
  beat,
  children,
}: {
  size: number;
  energy: number;
  beat: number;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const breathe = useSharedValue(0);
  const kick = useSharedValue(0);
  const live = useSharedValue(0.3);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(breathe);
      breathe.value = 0.5;
      return;
    }
    breathe.value = withRepeat(withTiming(1, { duration: 2600, easing: SINE }), -1, true);
    return () => cancelAnimation(breathe);
  }, [reduceMotion, breathe]);

  useEffect(() => {
    live.value = withTiming(Math.max(0.12, energy), { duration: reduceMotion ? 0 : 320, easing: EASE_OUT });
  }, [energy, reduceMotion, live]);

  useEffect(() => {
    if (reduceMotion || beat <= 0) return;
    kick.value = withSequence(
      withTiming(1, { duration: 90, easing: EASE_OUT }),
      withTiming(0, { duration: 440, easing: EASE_OUT }),
    );
  }, [beat, reduceMotion, kick]);

  const haloStyle = useAnimatedStyle(() => {
    const b = breathe.value;
    const e = live.value;
    const k = kick.value;
    return {
      opacity: 0.1 + b * 0.06 + e * 0.06 + k * 0.12,
      transform: [{ scale: 0.9 + b * 0.12 + e * 0.12 + k * 0.06 }],
    };
  });

  const ringStyle = useAnimatedStyle(() => {
    const b = breathe.value;
    const k = kick.value;
    return {
      opacity: 0.5 + b * 0.18 + k * 0.3,
      transform: [{ scale: 0.96 + b * 0.04 + k * 0.05 }],
    };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          styles.halo,
          { width: size, height: size, borderRadius: size / 2 },
          haloStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          { width: size * 0.74, height: size * 0.74, borderRadius: (size * 0.74) / 2 },
          ringStyle,
        ]}
      />
      <View style={[styles.core, { width: size * 0.74, height: size * 0.74, borderRadius: (size * 0.74) / 2 }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'space-between', paddingVertical: 12 },
  header: { gap: 6, alignItems: 'center', paddingHorizontal: 24 },
  now: { letterSpacing: 2, marginBottom: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  halo: { position: 'absolute', backgroundColor: Theme.text },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Theme.borderStrong,
    backgroundColor: Theme.cardWhisper,
  },
  core: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
});

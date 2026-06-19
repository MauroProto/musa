import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Theme, MOTION, RADIUS } from '../../constants/theme';
import { Text, Touch } from '../ui';
import { buildPlayerLayerStates, type PlayerLayerKey } from '../../lib/player-layer-state';
import type { TactileFocus } from '../../lib/tactile-focus';
import type { HapticEvent, SectionMark, SensoryLayer, SensoryMoment } from '../../lib/types';
import { cueIcon, cueLabel, layerIcon } from './sensory-panel-copy';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

type TactileStatusBarProps = {
  moments: SensoryMoment[];
  cue?: HapticEvent['type'];
  cueId?: number;
  energy: number;
  section?: SectionMark['kind'];
  isPlaying: boolean;
  focus: TactileFocus | null;
  detailsOpen: boolean;
  onToggleDetails: () => void;
};

export function TactileStatusBar({
  moments,
  cue,
  cueId = 0,
  energy,
  section,
  isPlaying,
  focus,
  detailsOpen,
  onToggleDetails,
}: TactileStatusBarProps) {
  const label = focus?.label ?? moments[0]?.label ?? (cue ? cueLabel(cue) : isPlaying ? 'Feeling the track' : 'Ready to feel');
  const cueType = focus?.cueType ?? cue;
  const layers = buildPlayerLayerStates({
    energy,
    cueType,
    moments,
    sectionKind: section,
    isPlaying,
  });
  const focusKey = layerKeyForFocus(focus?.layer);
  const activeLayer = layers.find((layer) => layer.key === focusKey)
    ?? layers.filter((layer) => layer.active).sort((a, b) => b.level - a.level)[0]
    ?? layers.sort((a, b) => b.level - a.level)[0];

  const enter = useSharedValue(1);
  useEffect(() => {
    enter.value = 0;
    enter.value = withTiming(1, { duration: MOTION.dur.base, easing: EASE_OUT });
  }, [cueId, label, enter]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + enter.value * 0.28,
    transform: [{ translateY: 4 * (1 - enter.value) }],
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <View style={styles.iconMark}>
        <Ionicons name={cueIcon(cueType)} size={15} color={Theme.text} />
      </View>
      <View style={styles.copy}>
        <Text variant="label" color={Theme.textGhost} numberOfLines={1} style={styles.eyebrow}>
          TACTILE FOCUS
        </Text>
        <Text variant="caption" color={Theme.text} weight="800" numberOfLines={1}>
          {label}
        </Text>
      </View>
      {activeLayer ? (
        <View style={styles.layerPill}>
          <Ionicons name={layerIcon(activeLayer.key)} size={12} color={Theme.textDim} />
          <Text variant="label" color={Theme.textDim} numberOfLines={1} style={styles.layerText}>
            {activeLayer.label}
          </Text>
        </View>
      ) : null}
      <Touch
        onPress={onToggleDetails}
        hitSlop={8}
        scaleTo={0.94}
        style={detailsOpen ? styles.detailsBtnOpen : styles.detailsBtn}
        accessibilityLabel={detailsOpen ? 'Hide tactile details' : 'Show tactile details'}
      >
        <Ionicons name={detailsOpen ? 'chevron-down' : 'layers-outline'} size={14} color={detailsOpen ? Theme.bg : Theme.text} />
      </Touch>
    </Animated.View>
  );
}

function layerKeyForFocus(layer?: SensoryLayer): PlayerLayerKey | null {
  switch (layer) {
    case 'bass':
    case 'drums':
    case 'emotion':
    case 'guitar':
    case 'structure':
    case 'voice':
      return layer;
    case 'rhythm':
      return 'drums';
    case undefined:
      return null;
  }
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  iconMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    letterSpacing: 0,
    marginBottom: 1,
  },
  layerPill: {
    maxWidth: 84,
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: Theme.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  layerText: {
    letterSpacing: 0,
    flexShrink: 1,
  },
  detailsBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  detailsBtnOpen: {
    backgroundColor: Theme.text,
    borderColor: Theme.text,
  },
});

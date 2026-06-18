import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Theme, MOTION, RADIUS } from '../../constants/theme';
import { Text, Touch } from '../ui';
import { buildPlayerLayerStates, type PlayerLayerState } from '../../lib/player-layer-state';
import { cueDetail, cueIcon, cueLabel, layerIcon } from './sensory-panel-copy';
import type { HapticEvent, SectionMark, SensoryMoment } from '../../lib/types';

const EASE_OUT = Easing.bezier(MOTION.easeOut[0], MOTION.easeOut[1], MOTION.easeOut[2], MOTION.easeOut[3]);

type SensoryPanelProps = {
  moments: SensoryMoment[];
  cue?: HapticEvent['type'];
  cueId?: number;
  energy: number;
  source: string;
  section?: SectionMark['kind'];
  isPlaying: boolean;
};

export function SensoryPanel({
  moments,
  cue,
  cueId = 0,
  energy,
  source,
  section,
  isPlaying,
}: SensoryPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const primary = moments[0];
  const label = primary?.label ?? (cue ? cueLabel(cue) : isPlaying ? 'Feeling the groove' : 'Ready to feel');
  const detail = primary?.detail ?? (cue ? cueDetail(cue) : 'Tactile layers will separate rhythm, bass, voice, and form');
  const sourceLabel = isLalalSource(source) ? 'LALAL stems' : 'Semantic score';
  const layers = buildPlayerLayerStates({
    energy,
    cueType: cue,
    moments,
    sectionKind: section,
    isPlaying,
  });
  const visibleLayers = expanded ? layers : chooseCompactLayers(layers);

  return (
    <View style={[styles.wrap, expanded ? styles.wrapExpanded : null]}>
      <View style={styles.header}>
        <View style={styles.cueMark}>
          <Ionicons name={cueIcon(cue)} size={18} color={Theme.text} />
        </View>
        <View style={styles.headerText}>
          <Text variant="label" color={Theme.textGhost} style={styles.label}>
            FEELING NOW
          </Text>
          <Text variant="heading" numberOfLines={1}>
            {label}
          </Text>
        </View>
        {expanded ? (
          <Text variant="label" color={Theme.textDim} style={styles.source}>
            {sourceLabel.toUpperCase()}
          </Text>
        ) : null}
        <Touch
          onPress={() => setExpanded((value) => !value)}
          hitSlop={8}
          scaleTo={0.94}
          style={styles.expandBtn}
          accessibilityLabel={expanded ? 'Hide full tactile layers' : 'Show full tactile layers'}
        >
          <Ionicons name={expanded ? 'chevron-up' : 'layers-outline'} size={15} color={Theme.text} />
          <Text variant="label" color={Theme.text} style={styles.expandText}>
            {expanded ? 'Hide' : 'Full'}
          </Text>
        </Touch>
      </View>

      {expanded ? (
        <Text variant="caption" color={Theme.textDim} numberOfLines={2} style={styles.detail}>
          {detail}
        </Text>
      ) : null}

      <View style={expanded ? styles.layers : styles.compactLayers}>
        {visibleLayers.map((layer) => (
          expanded ? (
            <LayerRow key={layer.key} layer={layer} cueId={cueId} />
          ) : (
            <CompactLayer key={layer.key} layer={layer} />
          )
        ))}
      </View>
    </View>
  );
}

function chooseCompactLayers(layers: PlayerLayerState[]): PlayerLayerState[] {
  const active = layers.filter((layer) => layer.active).sort((a, b) => b.level - a.level);
  if (active.length > 0) return active.slice(0, 3);
  return [...layers].sort((a, b) => b.level - a.level).slice(0, 3);
}

function CompactLayer({ layer }: { layer: PlayerLayerState }) {
  return (
    <View style={[styles.compactLayer, layer.active ? styles.compactLayerActive : null]}>
      <Ionicons name={layerIcon(layer.key)} size={12} color={layer.active ? Theme.bg : Theme.textDim} />
      <Text variant="label" color={layer.active ? Theme.bg : Theme.textDim} numberOfLines={1} style={styles.compactLayerText}>
        {layer.label}
      </Text>
    </View>
  );
}

function LayerRow({ layer, cueId }: { layer: PlayerLayerState; cueId: number }) {
  const level = useSharedValue(layer.level);
  const pulse = useSharedValue(0);

  useEffect(() => {
    level.value = withTiming(layer.level, { duration: MOTION.dur.base, easing: EASE_OUT });
  }, [layer.level, level]);

  useEffect(() => {
    if (!layer.active) return;
    pulse.value = 0;
    pulse.value = withSequence(
      withTiming(1, { duration: 110, easing: EASE_OUT }),
      withTiming(0, { duration: 260, easing: EASE_OUT }),
    );
  }, [cueId, layer.active, pulse]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: 0.52 + level.value * 0.4 + pulse.value * 0.08,
    transform: [{ translateX: pulse.value * 2 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: 0.42 + level.value * 0.5 + pulse.value * 0.08,
    transform: [{ scaleX: Math.max(0.04, level.value) }],
  }));

  return (
    <Animated.View style={[styles.layerRow, rowStyle]}>
      <View style={styles.layerLabel}>
        <Ionicons name={layerIcon(layer.key)} size={13} color={layer.active ? Theme.text : Theme.textDim} />
        <Text variant="label" color={layer.active ? Theme.text : Theme.textDim} numberOfLines={1} style={styles.layerText}>
          {layer.label}
        </Text>
      </View>
      <View style={styles.layerTrack}>
        <Animated.View style={[styles.layerFill, fillStyle]} />
        {layer.active ? <View style={styles.layerSpark} /> : null}
      </View>
    </Animated.View>
  );
}

function isLalalSource(source: string): boolean {
  return source.startsWith('lalal');
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    marginTop: 18,
    padding: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: Theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  wrapExpanded: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cueMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.borderStrong,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    letterSpacing: 0,
    marginBottom: 1,
  },
  source: {
    letterSpacing: 0,
    maxWidth: 82,
    textAlign: 'right',
  },
  expandBtn: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: Theme.surfaceStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  expandText: {
    letterSpacing: 0,
  },
  detail: {
    paddingLeft: 44,
  },
  compactLayers: {
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 40,
    flexWrap: 'wrap',
  },
  compactLayer: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: Theme.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  compactLayerActive: {
    backgroundColor: Theme.text,
    borderColor: Theme.text,
  },
  compactLayerText: {
    letterSpacing: 0,
  },
  layers: {
    gap: 8,
    paddingTop: 2,
  },
  layerRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  layerLabel: {
    width: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  layerText: {
    letterSpacing: 0,
    flex: 1,
  },
  layerTrack: {
    flex: 1,
    height: 5,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  layerFill: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    backgroundColor: Theme.text,
  },
  layerSpark: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: Theme.text,
    opacity: 0.16,
  },
});

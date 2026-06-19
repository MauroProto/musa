import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Theme, RADIUS } from '../../constants/theme';
import { Text, Touch } from '../ui';
import { currentGuidedStep, nextGuidedStep } from '../../lib/demo-guided';

export function GuidedDemoChip({
  trackId,
  currentMs,
  seekTo,
}: {
  trackId: number;
  currentMs: number;
  seekTo: (targetMs: number) => void;
}) {
  const current = currentGuidedStep(trackId, currentMs);
  const next = nextGuidedStep(trackId, currentMs);
  const active = current ?? next;
  if (!active) return null;

  const jumpTarget = current ? next : active;
  return (
    <View style={styles.wrap}>
      <View style={styles.iconMark}>
        <Ionicons name="navigate-outline" size={14} color={Theme.text} />
      </View>
      <View style={styles.copy}>
        <Text variant="label" color={Theme.textGhost} style={styles.eyebrow}>
          GUIDED DEMO
        </Text>
        <Text variant="caption" color={Theme.text} numberOfLines={1} weight="700">
          {active.label}
        </Text>
        <Text variant="label" color={Theme.textDim} numberOfLines={1} style={styles.detail}>
          {active.detail}
        </Text>
      </View>
      {jumpTarget ? (
        <Touch onPress={() => seekTo(jumpTarget.jumpMs)} hitSlop={8} style={styles.jumpBtn}>
          <Ionicons name="play-skip-forward-outline" size={14} color={Theme.bg} />
          <Text variant="label" color={Theme.bg} weight="800" style={styles.jumpText}>
            {current ? 'Next' : 'Jump'}
          </Text>
        </Touch>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  iconMark: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  },
  detail: {
    letterSpacing: 0,
    marginTop: 1,
  },
  jumpBtn: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: Theme.text,
  },
  jumpText: {
    letterSpacing: 0,
  },
});
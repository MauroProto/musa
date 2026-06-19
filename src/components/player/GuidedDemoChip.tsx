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
        <Ionicons name="navigate-outline" size={13} color={Theme.text} />
      </View>
      <View style={styles.copy}>
        <Text variant="label" color={Theme.textGhost} style={styles.eyebrow}>
          GUIDED DEMO
        </Text>
        <Text variant="caption" color={Theme.text} numberOfLines={1} weight="700">
          {active.label}
        </Text>
      </View>
      {jumpTarget ? (
        <Touch onPress={() => seekTo(jumpTarget.jumpMs)} hitSlop={8} style={styles.jumpBtn}>
          <Ionicons name="play-skip-forward-outline" size={13} color={Theme.bg} />
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
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
  },
  jumpBtn: {
    minHeight: 30,
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

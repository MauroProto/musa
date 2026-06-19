import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../Icon';
import { Text, Touch } from '../ui';
import { GlassSurface, GlassIconButton } from '../Glass';
import { RADIUS, Theme } from '../../constants/theme';
import { HAPTIC_CATEGORY_LABELS, HAPTIC_LEGEND, type HapticLegendCategory } from '../../constants/haptic-patterns';
import { cueIcon } from './sensory-panel-copy';
import { previewHaptic } from '../../lib/haptics';
import { usePreferences } from '../../store/preferences';
import type { HapticEventType } from '../../lib/types';

const CATEGORY_ORDER: HapticLegendCategory[] = ['body', 'rhythm', 'texture', 'structure', 'emotion', 'voice'];

/**
 * Touch cheatsheet — the learning-curve helper. Open it any time to see the
 * whole tactile vocabulary; the cue you're feeling *right now* is highlighted,
 * so "what was that tap?" always has an answer. Tap any row to feel it again.
 */
export function CueCheatsheet({
  visible,
  onClose,
  activeCueType,
}: {
  visible: boolean;
  onClose: () => void;
  activeCueType?: HapticEventType;
}) {
  const insets = useSafeAreaInsets();
  const strength = usePreferences((s) => s.strength);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close cheatsheet" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text variant="label" color={Theme.textFaint}>TOUCH CHEATSHEET</Text>
              <Text variant="title">What am I feeling?</Text>
            </View>
            <GlassIconButton size={38} onPress={onClose} accessibilityLabel="Close">
              <Icon name="close" size={18} color={Theme.text} />
            </GlassIconButton>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingTop: 8, paddingBottom: 8 }}>
            {CATEGORY_ORDER.map((category) => {
              const items = HAPTIC_LEGEND.filter((i) => i.category === category);
              if (items.length === 0) return null;
              return (
                <View key={category} style={{ gap: 8 }}>
                  <Text variant="label" color={Theme.textFaint} style={styles.categoryLabel}>
                    {HAPTIC_CATEGORY_LABELS[category].toUpperCase()}
                  </Text>
                  {items.map((item) => {
                    const isNow = item.type === activeCueType;
                    return (
                      <GlassSurface
                        key={item.type}
                        onPress={() => previewHaptic(item.type, strength, item.intensity)}
                        radius={RADIUS.md}
                        elevation="none"
                        fill={isNow ? 'strong' : 'whisper'}
                        scaleTo={0.99}
                        accessibilityLabel={`${item.label}: ${item.role}`}
                        style={styles.row}
                      >
                        <View style={styles.iconWrap}>
                          <Icon name={cueIcon(item.type)} size={16} color={Theme.text} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.rowTop}>
                            <Text variant="caption" weight="700">{item.label}</Text>
                            {isNow ? (
                              <View style={styles.nowTag}>
                                <Text variant="label" weight="800" color={Theme.accentText} style={{ letterSpacing: 0.5 }}>NOW</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text variant="caption" dim numberOfLines={1}>{item.haptic} — {item.role}</Text>
                        </View>
                      </GlassSurface>
                    );
                  })}
                </View>
              );
            })}

            <Touch onPress={onClose} style={styles.doneBtn}>
              <Text variant="caption" weight="700" color={Theme.textDim}>Close</Text>
            </Touch>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11,12,14,0.35)' },
  sheet: {
    backgroundColor: Theme.bgDeep,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '86%',
  },
  handle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: Theme.textGhost, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  categoryLabel: { letterSpacing: 1, marginLeft: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.fill },
  nowTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: Theme.accent },
  doneBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
});

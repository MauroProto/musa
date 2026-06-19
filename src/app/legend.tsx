import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Screen, Text, Button, Stack, Card, Touch } from '../components/ui';
import { Theme } from '../constants/theme';
import {
  HAPTIC_CATEGORY_LABELS,
  HAPTIC_LEGEND,
  type HapticLegendCategory,
} from '../constants/haptic-patterns';
import { previewHaptic } from '../lib/haptics';
import { usePreferences } from '../store/preferences';

const CATEGORY_ORDER: HapticLegendCategory[] = ['body', 'rhythm', 'texture', 'structure', 'emotion', 'voice'];

export default function LegendScreen() {
  const strength = usePreferences((s) => s.strength);

  return (
    <Screen scroll>
      <Text variant="largeTitle">Haptic language</Text>
      <Text dim style={{ marginBottom: 2 }}>
        Every pattern has meaning. Tap any card to feel it before the demo.
      </Text>

      <Stack gap={14}>
        {CATEGORY_ORDER.map((category) => {
          const items = HAPTIC_LEGEND.filter((item) => item.category === category);
          if (items.length === 0) return null;
          return (
            <View key={category} style={{ gap: 8 }}>
              <Text variant="label" color={Theme.textFaint} style={styles.categoryLabel}>
                {HAPTIC_CATEGORY_LABELS[category].toUpperCase()}
              </Text>
              {items.map((item) => (
                <Touch
                  key={item.type}
                  onPress={() => previewHaptic(item.type, strength, item.intensity)}
                  style={styles.card}
                  scaleTo={0.99}
                >
                  <View style={styles.cardHead}>
                    <View style={styles.iconWrap}>
                      <Feather name={item.icon as any} size={17} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="heading">{item.label}</Text>
                      <Text variant="caption" dim>
                        {item.role}
                      </Text>
                    </View>
                  </View>
                  <Text dim>
                    {item.haptic} - {item.why}
                  </Text>
                </Touch>
              ))}
            </View>
          );
        })}
      </Stack>

      <Card>
        <Text variant="heading">Semantic, not raw</Text>
        <Text dim>
          Other products vibrate because there is sound. MUSA vibrates because a riff leads,
          the drums turn, the chorus lands, or the emotional color changes.
        </Text>
      </Card>

      <Stack gap={10}>
        <Button label="Calibrate strength" variant="secondary" onPress={() => router.push('/calibrate')} />
        <Link href="/demo" asChild>
          <Button label="Try the demo" variant="ghost" />
        </Link>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  categoryLabel: {
    letterSpacing: 0,
    marginLeft: 2,
  },
  card: {
    gap: 10,
    padding: 17,
    borderRadius: 8,
    backgroundColor: Theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
});
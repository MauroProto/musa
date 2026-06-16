import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Screen, Text, Button, Stack, Card } from '../components/ui';
import { Theme } from '../constants/theme';
import { HAPTIC_LEGEND } from '../constants/haptic-patterns';
import { previewHaptic } from '../lib/haptics';
import { usePreferences } from '../store/preferences';

export default function LegendScreen() {
  const strength = usePreferences((s) => s.strength);

  return (
    <Screen scroll>
      <Text variant="caption" color={Theme.accent} style={{ letterSpacing: 2 }}>
        HAPTIC LANGUAGE
      </Text>
      <Text variant="title">Every pattern has meaning</Text>
      <Text dim>
        MUSA is not vibration by volume. Each haptic communicates a specific musical event. Tap any
        card to feel it.
      </Text>

      <Stack gap={12}>
        {HAPTIC_LEGEND.map((item) => (
          <Pressable
            key={item.type}
            onPress={() => previewHaptic(item.type, strength, item.intensity)}
            style={({ pressed }) => [styles.card, { borderColor: item.color, opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={styles.cardHead}>
              <View style={[styles.iconWrap, { backgroundColor: `${item.color}22` }]}>
                <Feather name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="heading">{item.label}</Text>
                <Text variant="caption" color={item.color}>
                  {item.haptic} · {item.visual}
                </Text>
              </View>
              <Text variant="caption" color={Theme.textDim}>
                Try ▸
              </Text>
            </View>
            <Text dim>{item.why}</Text>
          </Pressable>
        ))}
      </Stack>

      <Card>
        <Text variant="heading">Semantic, not raw</Text>
        <Text dim>
          Other haptic products vibrate because there is sound. MUSA vibrates because a line begins,
          a chorus hits, or the energy shifts — turning synced lyrics into a tactile score.
        </Text>
      </Card>

      <Stack gap={10}>
        <Button label="Calibrate strength" variant="ghost" onPress={() => router.push('/calibrate')} />
        <Link href="/demo" asChild>
          <Button label="Try the demo" variant="ghost" />
        </Link>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: Theme.surface,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

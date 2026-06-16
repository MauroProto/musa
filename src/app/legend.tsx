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
      <Text variant="largeTitle">Haptic language</Text>
      <Text dim style={{ marginBottom: 4 }}>
        Every pattern has meaning. Tap any card to feel it.
      </Text>

      <Stack gap={8}>
        {HAPTIC_LEGEND.map((item) => (
          <Pressable
            key={item.type}
            onPress={() => previewHaptic(item.type, strength, item.intensity)}
            style={({ pressed }) => [styles.card, { opacity: pressed ? 0.6 : 1 }]}
          >
            <View style={styles.cardHead}>
              <View style={[styles.iconWrap, { backgroundColor: `${item.color}26` }]}>
                <Feather name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="heading">{item.label}</Text>
                <Text variant="caption" color={item.color}>
                  {item.haptic} · {item.visual}
                </Text>
              </View>
            </View>
            <Text dim>{item.why}</Text>
          </Pressable>
        ))}
      </Stack>

      <Card>
        <Text variant="heading">Semantic, not raw</Text>
        <Text dim>
          Other products vibrate because there is sound. MUSA vibrates because a line begins, a
          chorus hits, or the energy shifts — turning synced lyrics into a tactile score.
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
  card: { gap: 10, padding: 16, borderRadius: 20, backgroundColor: Theme.surface },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

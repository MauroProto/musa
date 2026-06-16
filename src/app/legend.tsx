import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Screen, Text, Button, Stack, Card, Touch } from '../components/ui';
import { Theme } from '../constants/theme';
import { HAPTIC_LEGEND } from '../constants/haptic-patterns';
import { previewHaptic } from '../lib/haptics';
import { usePreferences } from '../store/preferences';

export default function LegendScreen() {
  const strength = usePreferences((s) => s.strength);

  return (
    <Screen scroll>
      <Text variant="largeTitle">Haptic language</Text>
      <Text dim style={{ marginBottom: 2 }}>
        Every pattern has meaning. Tap any card to feel it.
      </Text>

      <Stack gap={8}>
        {HAPTIC_LEGEND.map((item) => (
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
                  {item.haptic} · {item.visual}
                </Text>
              </View>
            </View>
            <Text dim>{item.why}</Text>
          </Touch>
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
  card: {
    gap: 10,
    padding: 17,
    borderRadius: 20,
    backgroundColor: Theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
});

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { Screen, Text, Button, Stack } from '../../components/ui';
import { GlassSurface } from '../../components/Glass';
import { Theme, RADIUS } from '../../constants/theme';
import { DEMO_TRACKS } from '../../lib/fixtures';

export default function DemoScreen() {
  function open(trackId: number, title: string, artist: string, durationMs?: number) {
    router.push({
      pathname: '/player',
      params: { trackId: String(trackId), title, artist, durationMs: String(durationMs ?? ''), guided: '1' },
    });
  }

  return (
    <Screen scroll bottomBarSpace>
      <View style={{ gap: 8 }}>
        <Text variant="label" color={Theme.textFaint}>GUIDED</Text>
        <Text variant="largeTitle">Try a guided demo</Text>
        <Text dim>
          A narrated walkthrough that talks you through what you’re feeling. Haptics and captions run offline; audio stems are optional.
        </Text>
      </View>

      <Stack gap={12}>
        {DEMO_TRACKS.map((t) => (
          <GlassSurface
            key={t.trackId}
            onPress={() => open(t.trackId, t.title, t.artist, t.durationMs)}
            radius={RADIUS.card}
            elevation="card"
            chroma
            chromaStrength={0.55}
            intensity={22}
            scaleTo={0.99}
            accessibilityLabel={`Play guided demo: ${t.title}`}
            style={styles.demoCard}
          >
            <View style={{ flex: 1, gap: 5 }}>
              <Text variant="title">{t.title}</Text>
              <Text dim variant="caption">
                {t.artist}{t.durationMs ? `  ·  ${Math.round(t.durationMs / 1000)}s` : ''}
              </Text>
            </View>
            <View style={styles.playChip}>
              <Icon name="play" size={18} weight="fill" color={Theme.bg} />
            </View>
          </GlassSurface>
        ))}
      </Stack>

      <GlassSurface radius={RADIUS.card} elevation="card" intensity={18} style={styles.infoCard}>
        <Text variant="heading">What you’ll feel</Text>
        <View style={{ gap: 12, marginTop: 6 }}>
          <Bullet level={1} text="Drums count in with dry, attack taps" />
          <Bullet level={0.92} text="The signature guitar riff gets its own syncopated pattern" />
          <Bullet level={0.78} text="Bass pulses carry the body of the verse" />
          <Bullet level={1} text="The chorus lands as the strongest full-band hit" />
        </View>
      </GlassSurface>

      <Stack gap={10}>
        <Button label="Explore the touch language" variant="secondary" onPress={() => router.push('/legend')} />
        <Button label="Search any song" variant="ghost" onPress={() => router.push('/search')} />
      </Stack>
    </Screen>
  );
}

function Bullet({ level, text }: { level: number; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.text, opacity: level }} />
      <Text dim style={{ flex: 1 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  demoCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 },
  playChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.text,
  },
  infoCard: { padding: 20 },
});

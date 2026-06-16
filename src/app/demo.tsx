import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Text, Button, Stack, Card } from '../components/ui';
import { Theme } from '../constants/theme';
import { DEMO_TRACKS } from '../lib/fixtures';

export default function DemoScreen() {
  function open(trackId: number, title: string, artist: string, durationMs?: number) {
    router.push({
      pathname: '/player',
      params: { trackId: String(trackId), title, artist, durationMs: String(durationMs ?? ''), guided: '1' },
    });
  }

  return (
    <Screen scroll>
      <Text variant="largeTitle">Demo</Text>
      <Text dim style={{ marginBottom: 4 }}>
        Original MUSA tracks with synced lyrics. Press play, hold your phone, and follow the music
        through text, pulse and touch.
      </Text>

      <Stack gap={8}>
        {DEMO_TRACKS.map((t) => (
          <Pressable
            key={t.trackId}
            onPress={() => open(t.trackId, t.title, t.artist, t.durationMs)}
            style={({ pressed }) => [styles.demoCard, { opacity: pressed ? 0.6 : 1 }]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="heading">{t.title}</Text>
              <Text dim variant="caption">
                {t.artist}{t.durationMs ? `  ·  ${Math.round(t.durationMs / 1000)}s` : ''}
              </Text>
            </View>
            <Text variant="heading" color={Theme.accent}>▸</Text>
          </Pressable>
        ))}
      </Stack>

      <Card>
        <Text variant="heading">What you’ll feel</Text>
        <View style={{ gap: 9 }}>
          <Bullet color={Theme.accent} text="Double tap — a new lyric line starts" />
          <Bullet color={Theme.accentAlt} text="Soft long vibration — a held phrase" />
          <Bullet color={Theme.warning} text="Three rising taps — the chorus is coming" />
          <Bullet color={Theme.chorus} text="Strong hit — the chorus lands" />
        </View>
      </Card>

      <Button label="Haptic language" variant="secondary" onPress={() => router.push('/legend')} />
      <Button label="Search real songs" variant="ghost" onPress={() => router.push('/search')} />
    </Screen>
  );
}

function Bullet({ color, text }: { color: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
      <Text dim style={{ flex: 1 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 20,
    backgroundColor: Theme.surface,
  },
});

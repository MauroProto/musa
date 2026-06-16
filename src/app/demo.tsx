import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Screen, Text, Button, Stack, Card, Touch } from '../components/ui';
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
      <Text dim style={{ marginBottom: 2 }}>
        Original MUSA tracks with synced lyrics. Press play, hold your phone, and follow the music
        through text, pulse and touch.
      </Text>

      <Stack gap={10}>
        {DEMO_TRACKS.map((t) => (
          <Touch key={t.trackId} onPress={() => open(t.trackId, t.title, t.artist, t.durationMs)} style={styles.demoCard} scaleTo={0.99}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="heading">{t.title}</Text>
              <Text dim variant="caption">
                {t.artist}{t.durationMs ? `  ·  ${Math.round(t.durationMs / 1000)}s` : ''}
              </Text>
            </View>
            <View style={styles.playChip}>
              <Ionicons name="play" size={15} color={Theme.text} style={{ marginLeft: 2 }} />
            </View>
          </Touch>
        ))}
      </Stack>

      <Card>
        <Text variant="heading">What you’ll feel</Text>
        <View style={{ gap: 11, marginTop: 2 }}>
          <Bullet level={1} text="Double tap — a new lyric line starts" />
          <Bullet level={0.7} text="Soft long vibration — a held phrase" />
          <Bullet level={0.82} text="Three rising taps — the chorus is coming" />
          <Bullet level={1} text="Strong hit — the chorus lands" />
        </View>
      </Card>

      <Button label="Haptic language" variant="secondary" onPress={() => router.push('/legend')} />
      <Button label="Search real songs" variant="ghost" onPress={() => router.push('/search')} />
    </Screen>
  );
}

function Bullet({ level, text }: { level: number; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: Theme.text, opacity: level }} />
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  playChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
});

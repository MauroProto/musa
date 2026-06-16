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
      <Text variant="caption" color={Theme.accent} style={{ letterSpacing: 2 }}>
        GUIDED DEMO
      </Text>
      <Text variant="title">Feel a song, step by step</Text>
      <Text dim>
        These are original MUSA demo tracks with synced lyrics. Press play, hold your phone, and
        follow the music through text, pulse and touch. A live caption will explain each haptic as
        it happens.
      </Text>

      <Stack gap={12}>
        {DEMO_TRACKS.map((t) => (
          <Pressable
            key={t.trackId}
            onPress={() => open(t.trackId, t.title, t.artist, t.durationMs)}
            style={({ pressed }) => [styles.demoCard, { opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="heading">{t.title}</Text>
              <Text dim variant="caption">
                {t.artist}
                {t.durationMs ? `  ·  ${Math.round(t.durationMs / 1000)}s` : ''}
              </Text>
            </View>
            <View style={[styles.playPill, { backgroundColor: Theme.accent }]}>
              <Text variant="caption" color="#03121A" weight="600">
                Play ▸
              </Text>
            </View>
          </Pressable>
        ))}
      </Stack>

      <Card>
        <Text variant="heading">What you’ll feel</Text>
        <View style={{ gap: 8 }}>
          <Bullet color={Theme.accent} text="Double tap — a new lyric line starts" />
          <Bullet color={Theme.accentAlt} text="Soft long vibration — a held, emotional phrase" />
          <Bullet color={Theme.warning} text="Three rising taps — the chorus is coming" />
          <Bullet color={Theme.chorus} text="Strong hit — the chorus / drop lands" />
        </View>
      </Card>

      <Button label="Haptic language" variant="ghost" onPress={() => router.push('/legend')} />
      <Button label="Search real songs" variant="ghost" onPress={() => router.push('/search')} />
    </Screen>
  );
}

function Bullet({ color, text }: { color: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text dim style={{ flex: 1 }}>
        {text}
      </Text>
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
    borderWidth: 1.5,
    borderColor: Theme.border,
    backgroundColor: Theme.surface,
  },
  playPill: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999 },
});

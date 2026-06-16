import { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Screen, Text, Button, Stack, Card, useFontScale } from '../components/ui';
import { Theme } from '../constants/theme';
import { searchTracksClient } from '../lib/api-client';
import { usePreferences } from '../store/preferences';
import type { Track } from '../lib/types';

export default function SearchScreen() {
  const f = useFontScale();
  const setLastTrackId = usePreferences((s) => s.setLastTrackId);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Track[] | null>(null);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults(null);
      setSource('');
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      const { tracks, source } = await searchTracksClient(term);
      setResults(tracks);
      setSource(source);
      setLoading(false);
    }, 350);
    return () => clearTimeout(id);
  }, [q]);

  function openTrack(track: Track) {
    setLastTrackId(track.trackId);
    router.push({
      pathname: '/player',
      params: {
        trackId: String(track.trackId),
        title: track.title,
        artist: track.artist,
        durationMs: String(track.durationMs ?? ''),
        artwork: track.artworkUrl ?? '',
      },
    });
  }

  return (
    <Screen scroll>
      <Text variant="caption" color={Theme.accent} style={{ letterSpacing: 2 }}>
        SENSORY SCORE
      </Text>
      <Text variant="title">Search a song</Text>
      <Text dim>Artist or title. We pull synced lyrics and translate them into touch.</Text>

      <View style={[styles.inputWrap, { borderColor: Theme.border }]}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="e.g. Coldplay, Fix You…"
          placeholderTextColor={Theme.textFaint}
          style={{ color: Theme.text, fontSize: Math.round(17 * f), padding: 14, flex: 1 }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {loading ? <ActivityIndicator color={Theme.accent} /> : null}
      </View>

      {source ? (
        <Text variant="caption" dim>
          {source === 'musixmatch' ? 'Live results · Musixmatch' : 'Demo catalogue (no API key detected)'}
        </Text>
      ) : null}

      {results && results.length === 0 && !loading ? (
        <Card>
          <Text variant="body">No tracks found.</Text>
          <Text dim variant="caption">Try another title, or use the demo.</Text>
        </Card>
      ) : null}

      <Stack gap={10}>
        {results?.map((t) => (
          <Pressable
            key={t.trackId}
            onPress={() => openTrack(t)}
            style={({ pressed }) => [styles.result, { opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="heading" numberOfLines={1}>
                {t.title}
              </Text>
              <Text dim variant="caption" numberOfLines={1}>
                {t.artist}
                {t.album ? `  ·  ${t.album}` : ''}
              </Text>
            </View>
            <Text variant="caption" color={Theme.accent} weight="600">
              Open →
            </Text>
          </Pressable>
        ))}
      </Stack>

      {q.trim() === '' ? (
        <Stack gap={12} style={{ marginTop: 12 }}>
          <Card>
            <Text variant="heading">No Musixmatch key yet?</Text>
            <Text dim>
              Add MUSIXMATCH_API_KEY to .env and restart. Until then, the demo catalogue plays fully
              offline so you can feel the experience.
            </Text>
          </Card>
          <Link href="/demo" asChild>
            <Button label="Play the demo" variant="ghost" />
          </Link>
          <Link href="/calibrate" asChild>
            <Button label="Calibrate haptics" variant="ghost" />
          </Link>
        </Stack>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Theme.border,
    backgroundColor: Theme.surface,
  },
});

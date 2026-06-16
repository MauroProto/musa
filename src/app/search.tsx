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
      <Text variant="largeTitle">Search</Text>

      <View style={styles.inputWrap}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Artist or title"
          placeholderTextColor={Theme.textFaint}
          style={{ color: Theme.text, fontSize: Math.round(17 * f), flex: 1, paddingVertical: 16, paddingHorizontal: 16 }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {loading ? <ActivityIndicator color={Theme.accent} style={{ marginRight: 16 }} /> : null}
      </View>

      {source ? (
        <Text variant="caption" dim style={{ marginTop: -6 }}>
          {source === 'musixmatch' ? 'Live · Musixmatch' : 'Demo catalogue'}
        </Text>
      ) : null}

      {results && results.length === 0 && !loading ? (
        <Text dim style={{ textAlign: 'center', marginTop: 24 }}>No tracks found.</Text>
      ) : null}

      <Stack gap={6}>
        {results?.map((t) => (
          <Pressable
            key={t.trackId}
            onPress={() => openTrack(t)}
            style={({ pressed }) => [styles.result, { opacity: pressed ? 0.6 : 1 }]}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="heading" numberOfLines={1}>{t.title}</Text>
              <Text dim variant="caption" numberOfLines={1}>
                {t.artist}{t.album ? `  ·  ${t.album}` : ''}
              </Text>
            </View>
          </Pressable>
        ))}
      </Stack>

      {q.trim() === '' ? (
        <Stack gap={10} style={{ marginTop: 16 }}>
          <Card>
            <Text variant="heading">No Musixmatch key yet?</Text>
            <Text dim>
              Add MUSIXMATCH_API_KEY to .env and restart. Until then, the demo catalogue plays fully
              offline so you can feel the experience.
            </Text>
          </Card>
          <Link href="/demo" asChild>
            <Button label="Play the demo" variant="secondary" />
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
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.surface, borderRadius: 18 },
  result: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Theme.separator },
});

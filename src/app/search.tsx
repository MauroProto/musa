import { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { Screen, Text, Button, Stack, Card, Touch, useFontScale } from '../components/ui';
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
          style={{ color: Theme.text, fontSize: Math.round(16.5 * f), flex: 1, paddingVertical: 15, paddingHorizontal: 18 }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {loading ? <ActivityIndicator color={Theme.textDim} style={{ marginRight: 16 }} /> : null}
      </View>

      {source ? (
        <View style={styles.sourceRow}>
          <View style={[styles.sourceDot, { backgroundColor: source === 'musixmatch' ? Theme.text : Theme.textGhost }]} />
          <Text variant="caption" dim>
            {source === 'musixmatch' ? 'Live · Musixmatch' : 'Demo catalogue'}
          </Text>
        </View>
      ) : null}

      {results && results.length === 0 && !loading ? (
        <Text dim style={{ textAlign: 'center', marginTop: 24 }}>No tracks found.</Text>
      ) : null}

      <View>
        {results?.map((t) => (
          <Touch key={t.trackId} onPress={() => openTrack(t)} style={styles.result} scaleTo={0.99}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="heading" numberOfLines={1}>{t.title}</Text>
              <Text dim variant="caption" numberOfLines={1}>
                {t.artist}{t.album ? `  ·  ${t.album}` : ''}
              </Text>
            </View>
            <Text variant="caption" color={Theme.textFaint}>›</Text>
          </Touch>
        ))}
      </View>

      {q.trim() === '' ? (
        <Stack gap={12} style={{ marginTop: 14 }}>
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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: -4 },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.separator,
  },
});

import { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Screen, Text, Stack, Touch, useFontScale } from '../components/ui';
import { Theme } from '../constants/theme';
import { searchTracksClient } from '../lib/api-client';
import { DEMO_TRACKS } from '../lib/fixtures';
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
    if (!term) return;
    let cancelled = false;
    const id = setTimeout(async () => {
      const { tracks, source } = await searchTracksClient(term);
      if (cancelled) return;
      setResults(tracks);
      setSource(source);
      setLoading(false);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [q]);

  function updateQuery(value: string) {
    setQ(value);
    if (!value.trim()) {
      setResults(null);
      setSource('');
      setLoading(false);
      return;
    }
    setLoading(true);
  }

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
      <View style={styles.headerRow}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="label" color={Theme.textFaint}>MUSA</Text>
          <Text variant="largeTitle">Find a song</Text>
        </View>
        <Link href="/calibrate" asChild>
          <Touch hitSlop={10} style={styles.iconBtn} accessibilityLabel="Open haptic calibration">
            <Ionicons name="options-outline" size={21} color={Theme.textDim} />
          </Touch>
        </Link>
      </View>

      <View style={styles.inputWrap}>
        <Ionicons name="search-outline" size={19} color={Theme.textFaint} style={{ marginLeft: 16 }} />
        <TextInput
          value={q}
          onChangeText={updateQuery}
          placeholder="Artist, title or demo"
          placeholderTextColor={Theme.textFaint}
          style={{ color: Theme.text, fontSize: Math.round(16.5 * f), flex: 1, paddingVertical: 15, paddingHorizontal: 12 }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {q ? (
          <Touch onPress={() => updateQuery('')} hitSlop={10} style={styles.clearBtn} accessibilityLabel="Clear search">
            <Ionicons name="close" size={18} color={Theme.textDim} />
          </Touch>
        ) : null}
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

      <View style={styles.resultsWrap}>
        {results?.map((t) => (
          <TrackRow key={t.trackId} track={t} onPress={() => openTrack(t)} />
        ))}
      </View>

      {q.trim() === '' ? (
        <Stack gap={12} style={{ marginTop: 14 }}>
          <View style={styles.sectionHeader}>
            <Text variant="heading">Demo scores</Text>
            <Text variant="caption" color={Theme.textFaint}>curated</Text>
          </View>
          {DEMO_TRACKS.map((track) => (
            <TrackRow key={track.trackId} track={track} onPress={() => openTrack(track)} />
          ))}
          <Link href="/calibrate" asChild>
            <Touch style={styles.inlineLink}>
              <Ionicons name="options-outline" size={18} color={Theme.textDim} />
              <Text variant="caption" color={Theme.textDim} weight="600">Calibrate haptics</Text>
            </Touch>
          </Link>
        </Stack>
      ) : null}
    </Screen>
  );
}

function TrackRow({ track, onPress }: { track: Track; onPress: () => void }) {
  return (
    <Touch onPress={onPress} style={styles.result} scaleTo={0.99}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="heading" numberOfLines={1}>{track.title}</Text>
        <Text dim variant="caption" numberOfLines={1}>
          {track.artist}{track.album ? `  /  ${track.album}` : ''}{track.durationMs ? `  /  ${formatDuration(track.durationMs)}` : ''}
        </Text>
      </View>
      <View style={styles.playChip}>
        <Ionicons name="play" size={14} color={Theme.text} style={{ marginLeft: 2 }} />
      </View>
    </Touch>
  );
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  clearBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: -4 },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  resultsWrap: { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  playChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  inlineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
});

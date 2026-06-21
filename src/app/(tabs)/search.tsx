import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from '../../components/Icon';
import { Screen, Text, Stack, Touch, useFontScale, useResponsive } from '../../components/ui';
import { GlassSurface } from '../../components/Glass';
import { AlbumArtwork } from '../../components/songs/AlbumArtwork';
import { DemoTrackShelf } from '../../components/songs/DemoTrackShelf';
import { Theme, RADIUS } from '../../constants/theme';
import { searchTracksClient } from '../../lib/api-client';
import { DEMO_TRACKS } from '../../lib/fixtures';
import { songsHeroBannerHeight } from '../../lib/songs-layout';
import { usePreferences } from '../../store/preferences';
import type { Track } from '../../lib/types';

export default function SearchScreen() {
  const f = useFontScale();
  const { width } = useResponsive();
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

  const searching = q.trim() !== '';

  return (
    <Screen scroll bottomBarSpace pad={20}>
      {!searching ? <HeroBanner height={songsHeroBannerHeight(width)} onDemo={() => router.push('/demo')} /> : null}

      <GlassSurface radius={RADIUS.field} elevation="none" intensity={28} style={styles.inputWrap}>
        <View style={{ marginLeft: 16 }}>
          <Icon name="search" size={18} color={Theme.textFaint} />
        </View>
        <TextInput
          value={q}
          onChangeText={updateQuery}
          placeholder="Search by artist, title or demo"
          placeholderTextColor={Theme.textFaint}
          style={{ color: Theme.text, fontSize: Math.round(16.5 * f), flex: 1, paddingVertical: 16, paddingHorizontal: 12 }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {q ? (
          <Touch onPress={() => updateQuery('')} hitSlop={10} style={styles.clearBtn} accessibilityLabel="Clear search">
            <Icon name="close" size={18} color={Theme.textDim} />
          </Touch>
        ) : null}
        {loading ? <ActivityIndicator color={Theme.textDim} style={{ marginRight: 16 }} /> : null}
      </GlassSurface>

      {source ? (
        <View style={styles.sourceRow}>
          <View style={[styles.sourceDot, { backgroundColor: source === 'musixmatch' ? Theme.teal : Theme.textGhost }]} />
          <Text variant="caption" dim>{source === 'musixmatch' ? 'Live · Musixmatch' : 'Demo catalogue'}</Text>
        </View>
      ) : null}

      {results && results.length === 0 && !loading ? (
        <Text dim style={{ textAlign: 'center', marginTop: 24 }}>No tracks found.</Text>
      ) : null}

      {results && results.length > 0 ? (
        <View style={styles.resultsWrap}>
          {results.map((t) => (
            <TrackRow key={t.trackId} track={t} onPress={() => openTrack(t)} />
          ))}
        </View>
      ) : null}

      {!searching ? (
        <>
          <DemoTrackShelf tracks={DEMO_TRACKS} onTrackPress={openTrack} />

          <Stack gap={10} style={{ marginTop: 4 }}>
            <View style={styles.sectionHeader}>
              <Text variant="heading">Songs</Text>
            </View>
            {DEMO_TRACKS.map((track) => (
              <TrackRow key={track.trackId} track={track} onPress={() => openTrack(track)} featured />
            ))}
          </Stack>

          <View style={styles.quickRow}>
            <QuickTile icon="vinyl" label="Guided demo" hint="See what you'll feel" onPress={() => router.push('/demo')} />
            <QuickTile icon="wave" label="Touch language" hint="Learn the cues" onPress={() => router.push('/legend')} />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function HeroBanner({ height, onDemo }: { height: number; onDemo: () => void }) {
  return (
    <View style={[styles.banner, { height }]}>
      <View style={styles.bannerSurface}>
        <LinearGradient
          colors={['rgba(11,12,14,0.96)', 'rgba(31,35,38,0.92)', 'rgba(11,12,14,0.98)']}
          locations={[0, 0.58, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bannerArtCluster} pointerEvents="none">
          <View style={styles.bannerArtBack}>
            <AlbumArtwork track={DEMO_TRACKS[0]} size={78} radius={9} />
          </View>
          <View style={styles.bannerArtFront}>
            <AlbumArtwork track={DEMO_TRACKS[1]} size={94} radius={10} />
          </View>
        </View>
        <View style={styles.bannerContent}>
          <View style={styles.bannerTextBlock}>
            <Text style={styles.bannerKicker}>MUSA DEMOS</Text>
            <Text style={styles.bannerHeadline}>Music you can feel</Text>
            <Text style={styles.bannerSubline}>Real stems, tactile captions, album-first listening.</Text>
          </View>
          <Touch onPress={onDemo} style={styles.bannerCta} accessibilityLabel="Open guided demo">
            <Icon name="play" size={14} weight="fill" color={Theme.accentText} />
            <Text variant="caption" weight="700" color={Theme.accentText}>Guided demo</Text>
          </Touch>
        </View>
      </View>
    </View>
  );
}

function TrackRow({ track, onPress, featured = false }: { track: Track; onPress: () => void; featured?: boolean }) {
  return (
    <GlassSurface
      onPress={onPress}
      radius={RADIUS.lg}
      elevation="none"
      chroma={featured}
      intensity={18}
      scaleTo={0.99}
      accessibilityLabel={`Play ${track.title} by ${track.artist}`}
      style={styles.result}
    >
      <AlbumArtwork track={track} size={58} radius={8} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="heading" numberOfLines={1}>{track.title}</Text>
        <Text dim variant="caption" numberOfLines={1}>
          {track.artist}{track.album ? `  ·  ${track.album}` : ''}{track.durationMs ? `  ·  ${formatDuration(track.durationMs)}` : ''}
        </Text>
      </View>
      <View style={styles.playChip}>
        <Icon name="play" size={15} weight="fill" color={Theme.bg} />
      </View>
    </GlassSurface>
  );
}

function QuickTile({ icon, label, hint, onPress }: { icon: IconName; label: string; hint: string; onPress: () => void }) {
  return (
    <GlassSurface onPress={onPress} radius={RADIUS.card} elevation="none" chroma intensity={20} style={styles.tile} accessibilityLabel={label}>
      <View style={styles.tileIcon}>
        <Icon name={icon} size={18} color={Theme.teal} />
      </View>
      <Text variant="heading" style={{ marginTop: 10 }}>{label}</Text>
      <Text variant="caption" dim>{hint}</Text>
    </GlassSurface>
  );
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  banner: { borderRadius: RADIUS.card, overflow: 'hidden' },
  bannerSurface: { flex: 1, justifyContent: 'center', overflow: 'hidden' },
  bannerArtCluster: {
    position: 'absolute',
    right: 8,
    top: 20,
    width: 112,
    height: 108,
  },
  bannerArtBack: {
    position: 'absolute',
    right: 30,
    top: 10,
    opacity: 0.66,
    transform: [{ rotate: '-8deg' }],
  },
  bannerArtFront: {
    position: 'absolute',
    right: 0,
    top: 0,
    shadowColor: '#000000',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    transform: [{ rotate: '5deg' }],
  },
  bannerContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    paddingRight: 108,
  },
  bannerTextBlock: { flex: 1, gap: 4, minWidth: 0 },
  bannerKicker: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  bannerHeadline: { fontSize: 22, lineHeight: 25, fontWeight: '800', letterSpacing: 0, color: '#FFFFFF' },
  bannerSubline: { fontSize: 12.5, lineHeight: 16, fontWeight: '600', letterSpacing: 0, color: 'rgba(255,255,255,0.68)' },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Theme.accent,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
  },
  inputWrap: { flexDirection: 'row', alignItems: 'center' },
  clearBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: -6 },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  resultsWrap: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  result: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 10 },
  playChip: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.text },
  quickRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  tile: { flex: 1, padding: 16, minHeight: 124, justifyContent: 'flex-end' },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79,208,221,0.12)',
  },
});

import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, ImageBackground, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from '../../components/Icon';
import { Screen, Text, Stack, Touch, useFontScale, useResponsive } from '../../components/ui';
import { GlassSurface, Wordmark } from '../../components/Glass';
import { Theme, RADIUS } from '../../constants/theme';
import { searchTracksClient } from '../../lib/api-client';
import { DEMO_TRACKS } from '../../lib/fixtures';
import { songsHeroBannerHeight } from '../../lib/songs-layout';
import { usePreferences } from '../../store/preferences';
import type { Track } from '../../lib/types';

const HERO = require('../../../assets/images/musa-hero-background-person.png');

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
          <Stack gap={10} style={{ marginTop: 4 }}>
            <View style={styles.sectionHeader}>
              <Text variant="heading">Demo scores</Text>
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
      <ImageBackground source={HERO} resizeMode="cover" style={styles.bannerImg} imageStyle={styles.bannerImgInner}>
        <LinearGradient
          colors={['rgba(6,7,10,0.2)', 'rgba(6,7,10,0.42)', 'rgba(6,7,10,0.9)']}
          locations={[0, 0.44, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bannerContent}>
          <View style={styles.bannerTextBlock}>
            <Wordmark style={styles.bannerWordmark}>MUSA</Wordmark>
            <Text style={styles.bannerHeadline}>Music you can feel</Text>
          </View>
          <Touch onPress={onDemo} style={styles.bannerCta} accessibilityLabel="Open guided demo">
            <Icon name="play" size={14} weight="fill" color={Theme.accentText} />
            <Text variant="caption" weight="700" color={Theme.accentText}>Guided demo</Text>
          </Touch>
        </View>
      </ImageBackground>
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
  bannerImg: { flex: 1, justifyContent: 'center' },
  bannerImgInner: { borderRadius: RADIUS.card },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 14,
    padding: 16,
  },
  bannerTextBlock: { flex: 1, gap: 4, minWidth: 0 },
  bannerWordmark: { fontSize: 18, color: '#FFFFFF', letterSpacing: 0 },
  bannerHeadline: { fontSize: 22, lineHeight: 25, fontWeight: '800', letterSpacing: 0, color: '#FFFFFF' },
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
  result: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, paddingHorizontal: 16 },
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

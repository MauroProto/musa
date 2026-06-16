import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Backdrop } from '../components/Backdrop';
import { Screen, Text, Button, Stack, Touch, useResponsive } from '../components/ui';
import { Theme } from '../constants/theme';

const SCORE_BARS = [0.28, 0.52, 0.78, 0.42, 0.68, 0.34, 0.86, 0.58, 0.46, 0.74, 0.38, 0.62];

export default function WelcomeScreen() {
  const { isWide } = useResponsive();
  return isWide ? <WebLanding /> : <MobileWelcome />;
}

/* ------------------------------ WEB (landing) ------------------------------ */

function WebLanding() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: Theme.bg }}>
      <Backdrop lift={0.07} />

      <View style={[styles.nav, { paddingTop: insets.top + 22 }]}>
        <Text variant="heading" weight="800">MUSA</Text>
        <View style={styles.navLinks}>
          <NavLink label="Demo" onPress={() => router.push('/demo')} />
          <NavLink label="Language" onPress={() => router.push('/legend')} />
          <Touch onPress={() => router.push('/search')} style={styles.navCta}>
            <Ionicons name="search-outline" size={16} color={Theme.bg} />
            <Text variant="caption" weight="700" color={Theme.bg}>Search</Text>
          </Touch>
        </View>
      </View>

      <View style={styles.heroWrap}>
        <View style={styles.heroContent}>
          <ScorePreview />
          <Text variant="label" align="center" color={Theme.textFaint}>HAPTIC CAPTIONS FOR MUSIC</Text>
          <Text align="center" style={styles.heroTitle}>MUSA</Text>
          <Text dim align="center" style={styles.heroCopy}>
            Lyrics, rhythm and touch in one sensory score.
          </Text>
          <View style={styles.heroCtas}>
            <Button
              label="Get started"
              full={false}
              icon={<Ionicons name="sparkles-outline" size={18} color={Theme.bg} />}
              style={{ paddingHorizontal: 34 }}
              onPress={() => router.push('/profile-setup')}
            />
            <Button
              label="Try demo"
              variant="secondary"
              full={false}
              icon={<Ionicons name="play-outline" size={18} color={Theme.text} />}
              style={{ paddingHorizontal: 34 }}
              onPress={() => router.push('/demo')}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function NavLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text variant="caption" color={Theme.textDim} weight="600">{label}</Text>
    </Pressable>
  );
}

/* ------------------------------ MÓVIL (onboarding) ------------------------------ */

function MobileWelcome() {
  return (
    <Screen scroll center lift={0.07}>
      <View style={styles.brand}>
        <Text variant="hero" align="center">MUSA</Text>
        <Text variant="label" align="center" color={Theme.textFaint} style={{ marginTop: 10 }}>
          HAPTIC CAPTIONS FOR MUSIC
        </Text>
      </View>

      <ScorePreview />

      <View style={styles.headline}>
        <Text variant="largeTitle" align="center">Read it.</Text>
        <Text variant="largeTitle" align="center">Feel it.</Text>
        <Text variant="largeTitle" align="center">Follow it.</Text>
      </View>

      <Text dim align="center" style={{ paddingHorizontal: 12, marginTop: 2 }}>
        A clean sensory score for lyrics, rhythm and haptics.
      </Text>

      <View style={{ marginTop: 14 }}>
        <Stack gap={12}>
          <Button
            label="Get started"
            icon={<Ionicons name="sparkles-outline" size={18} color={Theme.bg} />}
            onPress={() => router.push('/profile-setup')}
          />
          <Link href="/demo" asChild>
            <Button label="Try demo" variant="secondary" icon={<Ionicons name="play-outline" size={18} color={Theme.text} />} />
          </Link>
          <Link href="/legend" asChild>
            <Button label="Haptic language" variant="ghost" />
          </Link>
        </Stack>
      </View>
    </Screen>
  );
}

function ScorePreview() {
  return (
    <View style={styles.scorePreview}>
      <View style={styles.scoreHeader}>
        <View style={styles.miniLines}>
          <View style={[styles.miniLine, { width: '58%', opacity: 0.72 }]} />
          <View style={[styles.miniLine, { width: '82%', opacity: 0.26 }]} />
        </View>
        <View style={styles.pulseRing}>
          <View style={styles.pulseDot} />
        </View>
      </View>

      <View style={styles.scoreBars}>
        {SCORE_BARS.map((height, i) => (
          <View key={`${height}-${i}`} style={styles.scoreRail}>
            <View style={[styles.scoreBar, { height: `${height * 100}%`, opacity: i === 6 ? 1 : 0.34 + height * 0.5 }]} />
          </View>
        ))}
      </View>

      <View style={styles.scoreTimeline}>
        <View style={styles.timelineFill} />
        <View style={styles.timelineHead} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // web
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 10,
  },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 26 },
  navCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Theme.text,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  heroWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 60 },
  heroContent: { width: '100%', maxWidth: 780, alignItems: 'center', gap: 18 },
  heroTitle: { fontSize: 82, lineHeight: 86, fontWeight: '800', letterSpacing: 0, color: Theme.text },
  heroCopy: { maxWidth: 480, fontSize: 18, lineHeight: 27 },
  heroCtas: { flexDirection: 'row', gap: 12, marginTop: 34, flexWrap: 'wrap', justifyContent: 'center' },

  // móvil
  brand: { alignItems: 'center', marginTop: 8 },
  headline: { gap: 1, marginTop: 16 },

  // shared preview
  scorePreview: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: 18,
    paddingVertical: 8,
  },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniLines: { flex: 1, gap: 9 },
  miniLine: { height: 7, borderRadius: 4, backgroundColor: Theme.text },
  pulseRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.borderStrong,
  },
  pulseDot: { width: 13, height: 13, borderRadius: 7, backgroundColor: Theme.text },
  scoreBars: { height: 138, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  scoreRail: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 8,
    backgroundColor: Theme.surface,
    overflow: 'hidden',
  },
  scoreBar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: Theme.text,
  },
  scoreTimeline: {
    height: 2,
    borderRadius: 2,
    backgroundColor: Theme.fill,
  },
  timelineFill: { width: '56%', height: '100%', borderRadius: 2, backgroundColor: Theme.text },
  timelineHead: {
    position: 'absolute',
    left: '56%',
    top: -4,
    width: 10,
    height: 10,
    marginLeft: -5,
    borderRadius: 5,
    backgroundColor: Theme.text,
  },
});

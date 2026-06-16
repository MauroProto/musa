import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Backdrop } from '../components/Backdrop';
import { Screen, Text, Button, Stack, Touch, useResponsive } from '../components/ui';
import { Theme } from '../constants/theme';

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
        <Text variant="heading" weight="800" style={{ letterSpacing: -0.5 }}>MUSA</Text>
        <View style={styles.navLinks}>
          <NavLink label="Demo" onPress={() => router.push('/demo')} />
          <NavLink label="Haptic language" onPress={() => router.push('/legend')} />
          <Touch onPress={() => router.push('/search')} style={styles.navCta}>
            <Text variant="caption" weight="700" color={Theme.bg}>Search</Text>
          </Touch>
        </View>
      </View>

      <View style={styles.heroWrap}>
        <View style={{ width: '100%', maxWidth: 880, alignItems: 'center' }}>
          <Text variant="label" align="center" color={Theme.textFaint}>HAPTIC CAPTIONS FOR MUSIC</Text>
          <Text align="center" style={styles.heroTitle}>Lyrics you can read.</Text>
          <Text align="center" style={styles.heroTitle}>Rhythm you can feel.</Text>
          <Text align="center" style={styles.heroTitle}>Music you can follow.</Text>
          <Text dim align="center" style={{ maxWidth: 560, marginTop: 22, fontSize: 18, lineHeight: 27 }}>
            MUSA turns synced lyrics into a tactile and visual score — so Deaf, hard-of-hearing and
            implant & hearing-aid users can follow a song through text, touch and rhythm.
          </Text>
          <View style={styles.heroCtas}>
            <Button label="Get started" full={false} style={{ paddingHorizontal: 40 }} onPress={() => router.push('/profile-setup')} />
            <Button label="Try the demo" variant="secondary" full={false} style={{ paddingHorizontal: 40 }} onPress={() => router.push('/demo')} />
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

      <View style={styles.headline}>
        <Text variant="largeTitle" align="center">Lyrics you can read.</Text>
        <Text variant="largeTitle" align="center">Rhythm you can feel.</Text>
        <Text variant="largeTitle" align="center">Music you can follow.</Text>
      </View>

      <Text dim align="center" style={{ paddingHorizontal: 12, marginTop: 2 }}>
        MUSA turns synced lyrics into a tactile and visual score — so Deaf, hard-of-hearing and
        implant & hearing-aid users can follow a song through text, touch and rhythm.
      </Text>

      <View style={{ marginTop: 14 }}>
        <Stack gap={12}>
          <Button label="Get started" onPress={() => router.push('/profile-setup')} />
          <Link href="/demo" asChild>
            <Button label="Try the demo" variant="secondary" />
          </Link>
          <Link href="/legend" asChild>
            <Button label="Learn the haptic language" variant="ghost" />
          </Link>
        </Stack>
      </View>
    </Screen>
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
    backgroundColor: Theme.text,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  heroWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 60 },
  heroTitle: { fontSize: 58, lineHeight: 62, fontWeight: '800', letterSpacing: -2.4, color: Theme.text },
  heroCtas: { flexDirection: 'row', gap: 12, marginTop: 34, flexWrap: 'wrap', justifyContent: 'center' },

  // móvil
  brand: { alignItems: 'center', marginTop: 8 },
  headline: { gap: 1, marginTop: 16 },
});

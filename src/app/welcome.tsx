import { router } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wordmark } from '../components/Glass';
import { Icon } from '../components/Icon';
import { Text, Button, Touch, useResponsive } from '../components/ui';
import { Theme } from '../constants/theme';

const HERO = require('../../assets/images/musa-hero-background-person.png');

export default function WelcomeScreen() {
  const { isWide } = useResponsive();
  return isWide ? <WebLanding /> : <MobileWelcome />;
}

/* ------------------------------ MOBILE ------------------------------ */

function MobileWelcome() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.fill, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.brandRow}>
        <Wordmark style={styles.brand}>MUSA</Wordmark>
        <Text variant="label" color={Theme.textFaint} style={styles.kicker}>Haptic captions for music</Text>
      </View>

      {/* Inset hero card — fixed aspect ratio (predictable cover on every device). */}
      <View style={styles.heroCard}>
        <ImageBackground source={HERO} resizeMode="cover" style={StyleSheet.absoluteFill} imageStyle={styles.heroImg}>
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroCaption}>
            <Text style={styles.heroCaptionText}>Feel the music in your hands.</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.body}>
        <Text style={styles.headline}>Music you can feel.</Text>
        <Text style={styles.lede}>
          Lyrics to read, rhythm to see, and cues you feel in your hands. One sensory score, built deaf-first.
        </Text>
        <View style={{ gap: 12, marginTop: 20 }}>
          <Button label="Start" onPress={() => router.push('/profile-setup')} />
          <Button
            label="Try the demo"
            variant="secondary"
            icon={<Icon name="play" size={15} weight="fill" color={Theme.text} />}
            onPress={() => router.push('/demo')}
          />
          <Pressable onPress={() => router.push('/legend')} hitSlop={8} style={styles.ghostLink}>
            <Text variant="caption" color={Theme.textDim} weight="600">Explore the touch language</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------ WEB ------------------------------ */

function WebLanding() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.fill, { paddingTop: insets.top + 28, paddingHorizontal: 56 }]}>
      <View style={styles.webTop}>
        <Wordmark style={{ fontSize: 20 }}>MUSA</Wordmark>
        <View style={styles.navLinks}>
          <NavLink label="Demo" onPress={() => router.push('/demo')} />
          <NavLink label="Touch language" onPress={() => router.push('/legend')} />
          <Touch onPress={() => router.push('/search')} style={styles.navCta}>
            <Text variant="caption" weight="700" color={Theme.accentText}>Open app</Text>
          </Touch>
        </View>
      </View>

      <View style={styles.webSplit}>
        <View style={styles.webCopy}>
          <Text variant="label" color={Theme.textFaint} style={styles.kicker}>HAPTIC CAPTIONS FOR MUSIC</Text>
          <Text style={styles.headlineWeb}>Music you{'\n'}can feel.</Text>
          <Text style={styles.ledeWeb}>
            Lyrics to read, rhythm to see, and cues you feel in your hands. One sensory score, built deaf-first, for every way you listen.
          </Text>
          <View style={styles.webCtas}>
            <Button label="Start" full={false} style={{ paddingHorizontal: 30 }} onPress={() => router.push('/profile-setup')} />
            <Button
              label="Try the demo"
              variant="secondary"
              full={false}
              icon={<Icon name="play" size={15} weight="fill" color={Theme.text} />}
              style={{ paddingHorizontal: 30 }}
              onPress={() => router.push('/demo')}
            />
          </View>
        </View>
        <View style={styles.heroCardWeb}>
          <ImageBackground source={HERO} resizeMode="cover" style={StyleSheet.absoluteFill} imageStyle={styles.heroImg}>
            <LinearGradient
              colors={['transparent', 'transparent', 'rgba(0,0,0,0.5)']}
              locations={[0, 0.6, 1]}
              style={StyleSheet.absoluteFill}
            />
          </ImageBackground>
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

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: Theme.bg },

  // mobile
  brandRow: { paddingHorizontal: 24, marginBottom: 18, gap: 4 },
  brand: { fontSize: 22 },
  kicker: { letterSpacing: 1 },
  heroCard: { marginHorizontal: 24, aspectRatio: 0.82, borderRadius: 24, overflow: 'hidden', backgroundColor: Theme.card },
  heroImg: { borderRadius: 24 },
  heroCaption: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20 },
  heroCaptionText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  body: { marginTop: 26, paddingHorizontal: 24 },
  headline: { fontSize: 40, lineHeight: 42, fontWeight: '800', letterSpacing: -1, color: Theme.text },
  lede: { fontSize: 16, lineHeight: 24, color: Theme.textDim, marginTop: 12, maxWidth: 380 },
  ghostLink: { alignItems: 'center', paddingVertical: 10 },

  // web
  webTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  navCta: { backgroundColor: Theme.accent, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999 },
  webSplit: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 56, paddingBottom: 40 },
  webCopy: { flex: 1, maxWidth: 520, gap: 4 },
  headlineWeb: { fontSize: 72, lineHeight: 70, fontWeight: '800', letterSpacing: -2, color: Theme.text, marginTop: 10 },
  ledeWeb: { fontSize: 18, lineHeight: 28, color: Theme.textDim, marginTop: 16, maxWidth: 480 },
  webCtas: { flexDirection: 'row', gap: 12, marginTop: 28, flexWrap: 'wrap' },
  heroCardWeb: { flex: 1, maxWidth: 460, aspectRatio: 0.82, borderRadius: 24, overflow: 'hidden', backgroundColor: Theme.card },
});

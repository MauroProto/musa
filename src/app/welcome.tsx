import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen, Text, Button, Stack } from '../components/ui';
import { Theme } from '../constants/theme';

export default function WelcomeScreen() {
  return (
    <Screen scroll>
      <View style={styles.brand}>
        <Text variant="hero" align="center">
          MUSA
        </Text>
        <Text variant="label" align="center" color={Theme.textDim} style={{ letterSpacing: 4, marginTop: 6 }}>
          HAPTIC CAPTIONS FOR MUSIC
        </Text>
      </View>

      <View style={styles.headline}>
        <Text variant="largeTitle" align="center">
          Lyrics you can read.
        </Text>
        <Text variant="largeTitle" align="center" color={Theme.accent}>
          Rhythm you can feel.
        </Text>
        <Text variant="largeTitle" align="center">
          Music you can follow.
        </Text>
      </View>

      <Text dim align="center" style={{ paddingHorizontal: 8 }}>
        MUSA turns synced lyrics into a tactile and visual score — so Deaf, hard-of-hearing and
        implant & hearing-aid users can follow a song through text, touch and rhythm.
      </Text>

      <View style={{ marginTop: 8 }}>
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
  brand: { alignItems: 'center', marginTop: 24, marginBottom: 8 },
  headline: { gap: 2, marginTop: 12 },
});

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
        <Text variant="caption" align="center" color={Theme.accent} style={{ letterSpacing: 3 }}>
          HAPTIC CAPTIONS FOR MUSIC
        </Text>
      </View>

      <View style={styles.headline}>
        <Text variant="title" align="center">
          Lyrics you can read.
        </Text>
        <Text variant="title" align="center" color={Theme.accentAlt}>
          Rhythm you can feel.
        </Text>
        <Text variant="title" align="center">
          Music you can follow.
        </Text>
      </View>

      <Text dim align="center">
        MUSA turns synced lyrics into a tactile and visual score — so Deaf, hard-of-hearing and
        implant & hearing-aid users can follow a song through text, touch and rhythm.
      </Text>

      <Stack gap={12}>
        <Button label="Get started" onPress={() => router.push('/profile-setup')} />
        <Link href="/demo" asChild>
          <Button label="Try the demo" variant="ghost" />
        </Link>
        <Link href="/legend" asChild>
          <Button label="Learn the haptic language" variant="ghost" />
        </Link>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', gap: 6, marginTop: 12 },
  headline: { gap: 4, marginTop: 8, marginBottom: 4 },
});

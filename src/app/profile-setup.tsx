import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Text, Button, Stack } from '../components/ui';
import { Theme } from '../constants/theme';
import { usePreferences } from '../store/preferences';
import type { ListeningProfile } from '../lib/types';

const PROFILES: { id: ListeningProfile; title: string; hint: string }[] = [
  { id: 'deaf_visual', title: 'Deaf / mostly visual', hint: 'I follow music through sight and touch' },
  { id: 'hard_of_hearing', title: 'Hard of hearing', hint: 'I catch some sound but miss details' },
  { id: 'cochlear_implant', title: 'Cochlear implant', hint: 'I hear rhythm & voice, miss texture' },
  { id: 'hearing_aid', title: 'Hearing aid', hint: 'Music can distort or lose clarity' },
  { id: 'feel_more', title: 'I want to feel more', hint: 'A multisensory way into music' },
];

export default function ProfileSetupScreen() {
  const setProfile = usePreferences((s) => s.setProfile);
  const complete = usePreferences((s) => s.completeOnboarding);
  const [selected, setSelected] = useState<ListeningProfile | null>(null);

  function continueToCalibrate() {
    if (!selected) return;
    setProfile(selected);
    complete();
    router.replace('/calibrate');
  }

  return (
    <Screen scroll>
      <Text variant="label" color={Theme.textDim} style={{ letterSpacing: 3 }}>
        STEP 1 OF 2
      </Text>
      <Text variant="largeTitle">How do you want to follow music?</Text>
      <Text dim style={{ marginBottom: 4 }}>
        There’s no single “deaf mode”. Choose what fits you — you can change this later.
      </Text>

      <Stack gap={8}>
        {PROFILES.map((p) => {
          const active = selected === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: active ? `${Theme.accent}26` : Theme.surface,
                  borderColor: active ? `${Theme.accent}99` : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text variant="heading">{p.title}</Text>
                <Text variant="caption" dim>
                  {p.hint}
                </Text>
              </View>
              <View style={[styles.radio, { borderColor: active ? Theme.accent : Theme.textFaint, backgroundColor: active ? Theme.accent : 'transparent' }]} />
            </Pressable>
          );
        })}
      </Stack>

      <Button label="Continue" onPress={continueToCalibrate} disabled={!selected} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
});

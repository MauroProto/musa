import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Screen, Text, Button } from '../components/ui';
import { WizardSteps } from '../components/controls';
import { ProfilePicker } from '../components/ProfilePicker';
import { Theme } from '../constants/theme';
import { usePreferences } from '../store/preferences';
import type { ListeningProfile } from '../lib/types';

export default function ProfileSetupScreen() {
  const applyProfilePreset = usePreferences((s) => s.applyProfilePreset);
  const complete = usePreferences((s) => s.completeOnboarding);
  const [selected, setSelected] = useState<ListeningProfile | null>(null);

  function continueToCalibrate() {
    if (!selected) return;
    // Apply the full recommended preset (strength, audio, caption size, mixer
    // gains) for how this person listens. Everything stays adjustable next.
    applyProfilePreset(selected);
    complete();
    router.replace('/calibrate?onboarding=1');
  }

  return (
    <Screen scroll>
      <View style={{ gap: 14 }}>
        <WizardSteps current={1} total={2} />
        <View style={{ gap: 8 }}>
          <Text variant="label" color={Theme.textFaint}>STEP 1 · YOU</Text>
          <Text variant="largeTitle">How do you listen?</Text>
          <Text dim>
            Pick whatever fits — there’s no single “deaf mode”. We’ll tune the haptics, captions and mix to match. You can change everything later.
          </Text>
        </View>
      </View>

      <ProfilePicker selected={selected} onSelect={setSelected} />

      <Button label="Continue" onPress={continueToCalibrate} disabled={!selected} />
    </Screen>
  );
}

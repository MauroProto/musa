import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HapticStrength, ListeningProfile } from '../lib/types';

type FontScale = 'comfortable' | 'large' | 'xl';

type PreferencesState = {
  profile: ListeningProfile | null;
  strength: HapticStrength;
  pulseOn: boolean;
  visualOnly: boolean;
  fontScale: FontScale;
  onboarded: boolean;
  lastTrackId: number | null;
  setProfile: (p: ListeningProfile) => void;
  setStrength: (s: HapticStrength) => void;
  setPulseOn: (v: boolean) => void;
  setVisualOnly: (v: boolean) => void;
  setFontScale: (f: FontScale) => void;
  setLastTrackId: (id: number) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      profile: null,
      strength: 'medium',
      pulseOn: true,
      visualOnly: false,
      fontScale: 'large',
      onboarded: false,
      lastTrackId: null,
      setProfile: (profile) => set({ profile }),
      setStrength: (strength) => set({ strength }),
      setPulseOn: (pulseOn) => set({ pulseOn }),
      setVisualOnly: (visualOnly) => set({ visualOnly }),
      setFontScale: (fontScale) => set({ fontScale }),
      setLastTrackId: (lastTrackId) => set({ lastTrackId }),
      completeOnboarding: () => set({ onboarded: true }),
      reset: () =>
        set({
          profile: null,
          strength: 'medium',
          pulseOn: true,
          visualOnly: false,
          fontScale: 'large',
          onboarded: false,
          lastTrackId: null,
        }),
    }),
    {
      name: 'musa-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export type { FontScale };

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
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

type PersistedPreferences = Pick<
  PreferencesState,
  'fontScale' | 'lastTrackId' | 'onboarded' | 'profile' | 'pulseOn' | 'strength' | 'visualOnly'
>;

const STORAGE_KEY = 'musa-preferences';

const DEFAULT_PREFERENCES: PersistedPreferences = {
  profile: null,
  strength: 'medium',
  pulseOn: true,
  visualOnly: false,
  fontScale: 'large',
  onboarded: false,
  lastTrackId: null,
};

function canUseStorage(): boolean {
  return Platform.OS !== 'web' || typeof window !== 'undefined';
}

function pickPreferences(state: PreferencesState): PersistedPreferences {
  return {
    profile: state.profile,
    strength: state.strength,
    pulseOn: state.pulseOn,
    visualOnly: state.visualOnly,
    fontScale: state.fontScale,
    onboarded: state.onboarded,
    lastTrackId: state.lastTrackId,
  };
}

function persistPreferences(state: PreferencesState) {
  if (!canUseStorage()) return;
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pickPreferences(state))).catch(() => {});
}

function isPersistedPreferences(value: unknown): value is Partial<PersistedPreferences> {
  return typeof value === 'object' && value !== null;
}

export const usePreferences = create<PreferencesState>()((set, get) => {
  function setAndPersist(patch: Partial<PersistedPreferences>) {
    set(patch);
    persistPreferences(get());
  }

  return {
    ...DEFAULT_PREFERENCES,
    setProfile: (profile) => setAndPersist({ profile }),
    setStrength: (strength) => setAndPersist({ strength }),
    setPulseOn: (pulseOn) => setAndPersist({ pulseOn }),
    setVisualOnly: (visualOnly) => setAndPersist({ visualOnly }),
    setFontScale: (fontScale) => setAndPersist({ fontScale }),
    setLastTrackId: (lastTrackId) => setAndPersist({ lastTrackId }),
    completeOnboarding: () => setAndPersist({ onboarded: true }),
    reset: () => setAndPersist(DEFAULT_PREFERENCES),
  };
});

async function hydratePreferences() {
  if (!canUseStorage()) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (isPersistedPreferences(parsed)) {
      usePreferences.setState({ ...DEFAULT_PREFERENCES, ...parsed });
    }
  } catch {
    /* keep defaults */
  }
}

void hydratePreferences();

export type { FontScale };

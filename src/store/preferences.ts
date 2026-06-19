import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { AudioMode, StemKind } from '../lib/audio-client';
import type { DemoTuningOverrides } from '../lib/demo-tuning';
import { DEFAULT_LAYER_GAINS, clampGain, normalizeLayerGains, type LayerGains, type MixLayer } from '../lib/layer-gains';
import { presetForProfile } from '../lib/profile-presets';
import type { HapticStrength, ListeningProfile } from '../lib/types';

type FontScale = 'comfortable' | 'large' | 'xl';

export type NowPlaying = { trackId: number; title: string; artist: string; durationMs?: number } | null;

type PreferencesState = {
  profile: ListeningProfile | null;
  strength: HapticStrength;
  pulseOn: boolean;
  visualOnly: boolean;
  audioMode: AudioMode;
  isolateStem: StemKind;
  fontScale: FontScale;
  layerGains: LayerGains;
  onboarded: boolean;
  lastTrackId: number | null;
  nowPlaying: NowPlaying;
  demoTuningOverrides: DemoTuningOverrides;
  setProfile: (p: ListeningProfile) => void;
  /** Set the profile AND apply its recommended preset (strength/audio/gains/...). */
  applyProfilePreset: (p: ListeningProfile) => void;
  setStrength: (s: HapticStrength) => void;
  setPulseOn: (v: boolean) => void;
  setVisualOnly: (v: boolean) => void;
  setAudioMode: (m: AudioMode) => void;
  setIsolateStem: (s: StemKind) => void;
  setFontScale: (f: FontScale) => void;
  setLayerGain: (layer: MixLayer, value: number) => void;
  setLayerGains: (gains: LayerGains) => void;
  resetLayerGains: () => void;
  setLastTrackId: (id: number) => void;
  setNowPlaying: (np: NowPlaying) => void;
  setDemoTuningOverrides: (overrides: DemoTuningOverrides) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

type PersistedPreferences = Pick<
  PreferencesState,
  | 'audioMode'
  | 'fontScale'
  | 'isolateStem'
  | 'layerGains'
  | 'demoTuningOverrides'
  | 'lastTrackId'
  | 'onboarded'
  | 'profile'
  | 'pulseOn'
  | 'strength'
  | 'visualOnly'
>;

const STORAGE_KEY = 'musa-preferences';

const DEFAULT_PREFERENCES: PersistedPreferences = {
  profile: null,
  strength: 'medium',
  pulseOn: true,
  visualOnly: false,
  audioMode: 'silent',
  isolateStem: 'vocals',
  fontScale: 'large',
  layerGains: DEFAULT_LAYER_GAINS,
  onboarded: false,
  lastTrackId: null,
  demoTuningOverrides: {},
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
    audioMode: state.audioMode,
    isolateStem: state.isolateStem,
    fontScale: state.fontScale,
    layerGains: state.layerGains,
    onboarded: state.onboarded,
    lastTrackId: state.lastTrackId,
    demoTuningOverrides: state.demoTuningOverrides,
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
    nowPlaying: null,
    setProfile: (profile) => setAndPersist({ profile }),
    applyProfilePreset: (profile) => {
      const preset = presetForProfile(profile);
      setAndPersist({
        profile,
        strength: preset.strength,
        visualOnly: preset.visualOnly,
        audioMode: preset.audioMode,
        fontScale: preset.fontScale,
        layerGains: preset.layerGains,
      });
    },
    setStrength: (strength) => setAndPersist({ strength }),
    setPulseOn: (pulseOn) => setAndPersist({ pulseOn }),
    setVisualOnly: (visualOnly) => setAndPersist({ visualOnly }),
    setAudioMode: (audioMode) => setAndPersist({ audioMode }),
    setIsolateStem: (isolateStem) => setAndPersist({ isolateStem }),
    setFontScale: (fontScale) => setAndPersist({ fontScale }),
    setLayerGain: (layer, value) =>
      setAndPersist({ layerGains: { ...get().layerGains, [layer]: clampGain(value) } }),
    setLayerGains: (layerGains) => setAndPersist({ layerGains: normalizeLayerGains(layerGains) }),
    resetLayerGains: () => setAndPersist({ layerGains: DEFAULT_LAYER_GAINS }),
    setLastTrackId: (lastTrackId) => setAndPersist({ lastTrackId }),
    setNowPlaying: (nowPlaying) => set({ nowPlaying }),
    setDemoTuningOverrides: (demoTuningOverrides) => setAndPersist({ demoTuningOverrides }),
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
      const merged = { ...DEFAULT_PREFERENCES, ...parsed };
      merged.layerGains = normalizeLayerGains(merged.layerGains);
      usePreferences.setState(merged);
    }
  } catch {
    /* keep defaults */
  }
}

void hydratePreferences();

export type { FontScale };

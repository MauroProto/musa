import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '../components/Icon';
import { Screen, Text, Button, Stack, Touch } from '../components/ui';
import { GlassSurface, GlassIconButton } from '../components/Glass';
import { SelectCard, SegmentedControl, Toggle, WizardSteps } from '../components/controls';
import { ProfilePicker } from '../components/ProfilePicker';
import { LayerMixer } from '../components/player/LayerMixer';
import { Theme, RADIUS } from '../constants/theme';
import { HAPTIC_LEGEND } from '../constants/haptic-patterns';
import { usePreferences } from '../store/preferences';
import { previewHaptic } from '../lib/haptics';
import { AUDIO_MODE_OPTIONS, ISOLATABLE_STEMS, type AudioMode, type StemKind } from '../lib/audio-client';
import { presetForProfile } from '../lib/profile-presets';
import type { HapticStrength } from '../lib/types';

const STRENGTHS: { id: HapticStrength; label: string; desc: string; icon: IconName }[] = [
  { id: 'soft', label: 'Soft', desc: 'Light cues — comfortable over long sessions', icon: 'signalLow' },
  { id: 'medium', label: 'Medium', desc: 'Balanced and easy to read', icon: 'signalMid' },
  { id: 'strong', label: 'Strong', desc: 'Pronounced cues that are hard to miss', icon: 'signalHigh' },
];

const LEARN_TYPES = new Set(['bass_pulse', 'drum_fill', 'guitar_riff', 'chorus', 'mood_shift']);
const LEARN_PATTERNS = HAPTIC_LEGEND.filter((item) => LEARN_TYPES.has(item.type));
const TEST_PATTERNS = HAPTIC_LEGEND.filter((item) => item.type !== 'pause');

export default function CalibrateScreen() {
  const params = useLocalSearchParams<{ onboarding?: string }>();
  const onboarding = params.onboarding === '1';

  const strength = usePreferences((s) => s.strength);
  const setStrength = usePreferences((s) => s.setStrength);
  const pulseOn = usePreferences((s) => s.pulseOn);
  const setPulseOn = usePreferences((s) => s.setPulseOn);
  const visualOnly = usePreferences((s) => s.visualOnly);
  const setVisualOnly = usePreferences((s) => s.setVisualOnly);
  const audioMode = usePreferences((s) => s.audioMode);
  const setAudioMode = usePreferences((s) => s.setAudioMode);
  const isolateStem = usePreferences((s) => s.isolateStem);
  const setIsolateStem = usePreferences((s) => s.setIsolateStem);
  const fontScale = usePreferences((s) => s.fontScale);
  const setFontScale = usePreferences((s) => s.setFontScale);
  const profile = usePreferences((s) => s.profile);
  const applyProfilePreset = usePreferences((s) => s.applyProfilePreset);

  return (
    <Screen scroll>
      {onboarding ? (
        <View style={{ gap: 14 }}>
          <WizardSteps current={2} total={2} />
          <View style={{ gap: 8 }}>
            <Text variant="label" color={Theme.textFaint}>STEP 2 · YOUR TOUCH</Text>
            <Text variant="largeTitle">Tune how it feels</Text>
            <Text dim>
              Learn what each tactile layer means, then pick a strength that stays clear without tiring you out.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.settingsHeader}>
          <GlassIconButton size={42} onPress={() => router.back()} accessibilityLabel="Close settings">
            <Icon name="back" size={22} color={Theme.text} />
          </GlassIconButton>
          <View style={{ flex: 1 }}>
            <Text variant="label" color={Theme.textFaint}>MUSA</Text>
            <Text variant="largeTitle">Settings</Text>
          </View>
        </View>
      )}

      <SectionLabel icon="ear" title="Listening profile" hint="Switch anytime — it re-tunes the haptics, audio and mix for how you listen." />
      <ProfilePicker selected={profile} onSelect={applyProfilePreset} />
      {profile ? (
        <Text variant="caption" dim style={{ marginTop: -4 }}>
          {presetForProfile(profile).rationale}
        </Text>
      ) : null}

      <SectionLabel icon="handTap" title="Learn the cues" hint="Tap each one. The body, the attack, the riff, the payoff, and the mood should each feel different." />
      <GlassSurface radius={RADIUS.card} elevation="card" intensity={20} style={styles.card}>
        <View style={styles.testRow}>
          {LEARN_PATTERNS.map((item) => (
            <TestButton key={item.type} label={item.label} onPress={() => previewHaptic(item.type, strength, item.intensity)} />
          ))}
        </View>
      </GlassSurface>

      <SectionLabel icon="pulse" title="Haptic strength" hint={visualOnly ? 'Turn off “Visual only” to feel these.' : 'How forceful every cue feels.'} />
      <Stack gap={10} style={{ opacity: visualOnly ? 0.4 : 1 }}>
        {STRENGTHS.map((s) => (
          <SelectCard key={s.id} title={s.label} hint={s.desc} icon={s.icon} active={strength === s.id} onPress={() => setStrength(s.id)} />
        ))}
      </Stack>

      <SectionLabel icon="faders" title="Layer mixer" hint="How much of each layer you feel — and hear, when audio is on. Also live in the player." />
      <LayerMixer />

      <SectionLabel icon="faders" title="Pattern lab" hint="The full set of cues. Fine-tune once you know the core five." />
      <GlassSurface radius={RADIUS.card} elevation="card" intensity={18} style={styles.card}>
        <View style={styles.testRow}>
          {TEST_PATTERNS.map((item) => (
            <TestButton key={item.type} label={item.label} onPress={() => previewHaptic(item.type, strength, item.intensity)} />
          ))}
        </View>
      </GlassSurface>

      <SectionLabel icon="music" title="Audio" hint="Silent by default. Full mix streams the R2-hosted demo audio; Isolate plays one stem to learn the layer." />
      <Stack gap={10}>
        {AUDIO_MODE_OPTIONS.map((opt) => (
          <SelectCard
            key={opt.key}
            title={opt.label}
            hint={opt.hint}
            active={audioMode === opt.key}
            onPress={() => setAudioMode(opt.key as AudioMode)}
          />
        ))}
      </Stack>
      {audioMode === 'isolate' ? (
        <View style={styles.stemRow}>
          {ISOLATABLE_STEMS.map((stem) => {
            const active = isolateStem === stem.key;
            return (
              <GlassSurface
                key={stem.key}
                onPress={() => setIsolateStem(stem.key as StemKind)}
                radius={RADIUS.pill}
                elevation="none"
                chroma={false}
                fill={active ? 'strong' : 'whisper'}
                intensity={active ? 26 : 14}
                style={styles.stemBtn}
                accessibilityLabel={stem.label}
                accessibilityState={{ selected: active }}
              >
                <Text variant="caption" color={active ? Theme.text : Theme.textDim} weight="700">{stem.label}</Text>
              </GlassSurface>
            );
          })}
        </View>
      ) : null}

      <SectionLabel icon="display" title="Comfort & display" />
      <GlassSurface radius={RADIUS.card} elevation="card" intensity={18} style={[styles.card, { gap: 4 }]}>
        <Toggle label="Beat pulse" desc="Quiet timing taps between the main cues" value={pulseOn} onToggle={() => setPulseOn(!pulseOn)} />
        <View style={styles.sep} />
        <Toggle label="Visual only" desc="Turn off all vibration — follow by sight" value={visualOnly} onToggle={() => setVisualOnly(!visualOnly)} />
        <View style={styles.sep} />
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="body">Caption size</Text>
            <Text dim variant="caption">Make the on-screen lyrics larger</Text>
          </View>
          <View style={{ width: 150 }}>
            <SegmentedControl
              value={fontScale}
              onChange={(k) => setFontScale(k as typeof fontScale)}
              options={[
                { key: 'comfortable', label: 'A' },
                { key: 'large', label: 'A+' },
                { key: 'xl', label: 'A++' },
              ]}
            />
          </View>
        </View>
      </GlassSurface>

      {onboarding ? (
        <Button label="Enter" onPress={() => router.replace('/search')} />
      ) : (
        <Button label="Done" variant="secondary" onPress={() => router.back()} />
      )}
    </Screen>
  );
}

function SectionLabel({ icon, title, hint }: { icon: IconName; title: string; hint?: string }) {
  return (
    <View style={{ gap: 6, marginTop: 4 }}>
      <View style={styles.sectionLabelRow}>
        <Icon name={icon} size={16} color={Theme.teal} />
        <Text variant="heading">{title}</Text>
      </View>
      {hint ? <Text variant="caption" dim>{hint}</Text> : null}
    </View>
  );
}

function TestButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Touch onPress={onPress} style={styles.testBtn} scaleTo={0.96}>
      <View style={styles.dot} />
      <Text variant="caption" weight="600">{label}</Text>
    </Touch>
  );
}

const styles = StyleSheet.create({
  settingsHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  card: { padding: 16 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  testRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 999,
    backgroundColor: 'rgba(11,12,14,0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Theme.textDim },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: Theme.separator, marginVertical: 6 },
  stemRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stemBtn: { paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
});

import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Theme } from '../../constants/theme';
import { Text, Touch } from '../ui';
import { AUDIO_MODE_OPTIONS, ISOLATABLE_STEMS, type AudioMode, type StemKind } from '../../lib/audio-client';
import { usePreferences } from '../../store/preferences';

/**
 * Compact audio-mode control for the player.
 * Lets the user switch between silent (Deaf-first), full mix, and stem isolation.
 * Stem isolation is the differentiator Apple Music Haptics does not offer.
 */
export function AudioModeControl() {
  const audioMode = usePreferences((s) => s.audioMode);
  const setAudioMode = usePreferences((s) => s.setAudioMode);
  const isolateStem = usePreferences((s) => s.isolateStem);
  const setIsolateStem = usePreferences((s) => s.setIsolateStem);

  return (
    <View style={styles.wrap}>
      <View style={styles.segRow}>
        {AUDIO_MODE_OPTIONS.map((opt) => {
          const active = audioMode === opt.key;
          return (
            <Touch
              key={opt.key}
              onPress={() => setAudioMode(opt.key as AudioMode)}
              scaleTo={0.97}
              style={[
                styles.seg,
                {
                  backgroundColor: active ? Theme.text : Theme.surface,
                  borderColor: active ? Theme.text : Theme.border,
                },
              ]}
              accessibilityLabel={opt.label}
            >
              <Ionicons
                name={modeIcon(opt.key)}
                size={13}
                color={active ? Theme.bg : Theme.textDim}
              />
              <Text
                variant="label"
                color={active ? Theme.bg : Theme.textDim}
                weight="700"
                style={styles.segText}
              >
                {opt.label.toUpperCase()}
              </Text>
            </Touch>
          );
        })}
      </View>

      {audioMode === 'isolate' ? (
        <View style={styles.stemRow}>
          {ISOLATABLE_STEMS.map((stem) => {
            const active = isolateStem === stem.key;
            return (
              <Touch
                key={stem.key}
                onPress={() => setIsolateStem(stem.key as StemKind)}
                style={[
                  styles.stemBtn,
                  {
                    backgroundColor: active ? Theme.surfaceStrong : Theme.surface,
                    borderColor: active ? Theme.borderStrong : Theme.border,
                  },
                ]}
              >
                <Text variant="caption" color={active ? Theme.text : Theme.textDim} weight="600">
                  {stem.label}
                </Text>
              </Touch>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function modeIcon(mode: AudioMode): 'volume-mute-outline' | 'volume-high-outline' | 'git-branch-outline' {
  switch (mode) {
    case 'silent':
      return 'volume-mute-outline';
    case 'mix':
      return 'volume-high-outline';
    case 'isolate':
      return 'git-branch-outline';
  }
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  segRow: { flexDirection: 'row', gap: 6 },
  seg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segText: { letterSpacing: 0.4 },
  stemRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stemBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

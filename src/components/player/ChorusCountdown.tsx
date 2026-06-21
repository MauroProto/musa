import { StyleSheet, View } from 'react-native';
import { Theme } from '../../constants/theme';
import { Text, useFontScale } from '../ui';
import { CHORUS_COUNTDOWN_CHROME } from '../../lib/player-ui-chrome';

export function ChorusCountdown({ msAway }: { msAway: number | null }) {
  const f = useFontScale();

  if (msAway === null) return null;
  const secs = Math.max(0, Math.round(msAway / 1000));

  return (
    <View style={[styles.wrap, CHORUS_COUNTDOWN_CHROME.surface === 'inline' ? styles.inline : styles.pill]}>
      {CHORUS_COUNTDOWN_CHROME.dotVisible ? <View style={styles.dot} /> : null}
      <Text variant="caption" weight="600" color={Theme.textDim} style={{ fontSize: Math.round(12.5 * f), letterSpacing: 0 }}>
        Chorus in {secs}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'center',
  },
  inline: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.border,
    backgroundColor: Theme.surface,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.text },
});

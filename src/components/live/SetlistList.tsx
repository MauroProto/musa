import { StyleSheet, View } from 'react-native';
import { Icon } from '../Icon';
import { Text, Touch } from '../ui';
import { LiveBadge } from './LiveBadge';
import { RADIUS, Theme } from '../../constants/theme';
import { entryPlayState, type LiveSession } from '../../lib/live-session';
import type { Concert } from '../../lib/live-shows';

function fmt(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * The setlist, rendered for both the lobby (read-only) and the host console
 * (tap a row to jump to that song). Each row shows its play state: done, now,
 * next, or upcoming.
 */
export function SetlistList({
  show,
  session,
  onSelectEntry,
}: {
  show: Concert;
  session?: LiveSession | null;
  onSelectEntry?: (index: number) => void;
}) {
  return (
    <View style={styles.list}>
      {show.setlist.map((entry, index) => {
        const state = session ? entryPlayState(session, index) : 'upcoming';
        const isNow = state === 'now';
        const interactive = Boolean(onSelectEntry);
        const body = (
          <>
            <View style={[styles.indexWrap, isNow && styles.indexWrapNow]}>
              {isNow ? (
                <Icon name="vibrate" size={15} color={Theme.accentText} weight="fill" />
              ) : state === 'done' ? (
                <Icon name="skipForward" size={13} color={Theme.textFaint} />
              ) : (
                <Text variant="caption" weight="700" color={Theme.textDim}>{index + 1}</Text>
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text variant="body" weight="700" numberOfLines={1} color={state === 'done' ? Theme.textDim : Theme.text}>
                {entry.title}
              </Text>
              <Text variant="caption" dim numberOfLines={1}>
                {entry.artist}{entry.note ? `  ·  ${entry.note}` : ''}
              </Text>
            </View>
            {isNow ? (
              <LiveBadge />
            ) : state === 'next' ? (
              <Text variant="label" weight="700" color={Theme.textFaint} style={{ letterSpacing: 1 }}>NEXT</Text>
            ) : (
              <Text variant="caption" color={Theme.textGhost}>{fmt(entry.durationMs)}</Text>
            )}
          </>
        );

        if (interactive) {
          return (
            <Touch
              key={`${entry.trackId}-${index}`}
              onPress={() => onSelectEntry?.(index)}
              scaleTo={0.98}
              style={[styles.row, isNow && styles.rowNow]}
              accessibilityLabel={`Start ${entry.title} by ${entry.artist}`}
            >
              {body}
            </Touch>
          );
        }
        return (
          <View key={`${entry.trackId}-${index}`} style={[styles.row, isNow && styles.rowNow]}>
            {body}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    backgroundColor: Theme.card,
  },
  rowNow: { backgroundColor: Theme.cardStrong },
  indexWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.surfaceStrong,
  },
  indexWrapNow: { backgroundColor: Theme.accent },
});

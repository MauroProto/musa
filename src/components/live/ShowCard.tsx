import { StyleSheet, View } from 'react-native';
import { GlassSurface } from '../Glass';
import { Icon } from '../Icon';
import { Text } from '../ui';
import { LiveBadge } from './LiveBadge';
import { RADIUS, Theme } from '../../constants/theme';
import type { Concert } from '../../lib/live-shows';

/** A concert in the discover list. Live shows lead with the red badge. */
export function ShowCard({ show, onPress }: { show: Concert; onPress: () => void }) {
  const isLive = show.status === 'live';
  return (
    <GlassSurface
      onPress={onPress}
      radius={RADIUS.card}
      elevation="card"
      scaleTo={0.99}
      accessibilityLabel={`${show.name} at ${show.venue}, ${isLive ? 'live now' : show.when}`}
      style={styles.card}
    >
      <View style={styles.topRow}>
        {isLive ? <LiveBadge /> : (
          <View style={styles.upcomingTag}>
            <Icon name="vinyl" size={12} color={Theme.textFaint} />
            <Text variant="label" color={Theme.textFaint} style={{ letterSpacing: 1 }}>UPCOMING</Text>
          </View>
        )}
        <Text variant="label" color={Theme.textGhost} style={{ letterSpacing: 0 }}>
          {show.setlist.length} songs
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text variant="title" numberOfLines={1}>{show.name}</Text>
        <Text variant="caption" dim numberOfLines={1}>{show.subtitle}</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <Icon name="navigation" size={13} color={Theme.textFaint} />
          <Text variant="caption" dim numberOfLines={1}>{show.venue} · {show.city}</Text>
        </View>
        <Text variant="caption" weight="700" color={isLive ? Theme.rec : Theme.textDim}>
          {isLive ? 'On air' : show.when}
        </Text>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, gap: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  upcomingTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 },
});

import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassSurface } from '../Glass';
import { Icon } from '../Icon';
import { Text } from '../ui';
import { LiveBadge } from './LiveBadge';
import { RADIUS, Theme } from '../../constants/theme';
import type { Concert } from '../../lib/live-shows';

const ALEX_WARREN_LIVE_IMAGE = require('../../../assets/images/live/alex-warren-live-card.png');

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
      <View style={styles.media}>
        <Image source={ALEX_WARREN_LIVE_IMAGE} resizeMode="cover" style={styles.mediaPhoto} />
        <LinearGradient
          colors={['rgba(11,12,14,0.08)', 'rgba(11,12,14,0.2)', 'rgba(11,12,14,0.82)']}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.mediaContent}>
          <View style={styles.mediaTop}>
            {isLive ? (
              <View style={styles.livePill}>
                <LiveBadge label="LIVE NOW" />
              </View>
            ) : (
              <View style={styles.upcomingTag}>
                <Icon name="vinyl" size={12} color={Theme.accentText} />
                <Text variant="label" color={Theme.accentText} style={styles.mediaKicker}>UPCOMING</Text>
              </View>
            )}
          </View>

          <View style={styles.mediaCopy}>
            <Text variant="title" color={Theme.accentText} numberOfLines={1}>{show.name}</Text>
            <Text variant="caption" color="rgba(255,255,255,0.76)" numberOfLines={1}>{show.subtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Icon name="navigation" size={13} color={Theme.textFaint} />
            <Text variant="caption" dim numberOfLines={1}>{show.venue}</Text>
          </View>
          <View style={styles.enterButton}>
            <Text variant="label" weight="800" color={Theme.accentText}>ENTER</Text>
            <Icon name="arrowRight" size={14} color={Theme.accentText} weight="bold" />
          </View>
        </View>

      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 0,
    overflow: 'hidden',
    backgroundColor: Theme.bgElevated,
  },
  media: {
    width: '100%',
    height: 246,
    position: 'relative',
    overflow: 'hidden',
  },
  mediaContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  mediaPhoto: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  mediaTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  mediaCopy: { gap: 4 },
  mediaKicker: { letterSpacing: 1 },
  livePill: {
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  upcomingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(11,12,14,0.42)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  body: {
    padding: 16,
    backgroundColor: Theme.bgElevated,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 },
  enterButton: {
    minHeight: 36,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 13,
    backgroundColor: Theme.accent,
  },
});

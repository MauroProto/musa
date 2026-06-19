import { useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { Icon } from '../Icon';
import { Text, Touch } from '../ui';
import { GlassSurface } from '../Glass';
import { RADIUS, Theme } from '../../constants/theme';
import { GAIN_MAX, MIX_LAYERS, MIX_LAYER_LABEL, type MixLayer } from '../../lib/layer-gains';
import { usePreferences } from '../../store/preferences';

const LAYER_ICON: Record<MixLayer, 'drums' | 'bass' | 'guitar' | 'voice'> = {
  drums: 'drums',
  bass: 'bass',
  guitar: 'guitar',
  vocals: 'voice',
};

/**
 * Live mixer — one fader per layer. Each fader drives BOTH the haptic intensity
 * of that layer and (when audio is on) the stem's volume. Drag to taste; tap the
 * label to mute/solo-out. Neutral (as-authored) sits at 100%.
 */
export function LayerMixer() {
  const layerGains = usePreferences((s) => s.layerGains);
  const setLayerGain = usePreferences((s) => s.setLayerGain);
  const resetLayerGains = usePreferences((s) => s.resetLayerGains);

  return (
    <GlassSurface radius={RADIUS.lg} elevation="none" style={styles.wrap}>
      <View style={styles.header}>
        <Text variant="label" color={Theme.textFaint} style={styles.eyebrow}>LIVE MIXER</Text>
        <Touch onPress={resetLayerGains} hitSlop={8} style={styles.reset} accessibilityLabel="Reset mixer">
          <Text variant="label" color={Theme.textDim} weight="700">RESET</Text>
        </Touch>
      </View>
      {MIX_LAYERS.map((layer) => (
        <Fader
          key={layer}
          layer={layer}
          value={layerGains[layer]}
          onChange={(v) => setLayerGain(layer, v)}
        />
      ))}
    </GlassSurface>
  );
}

function Fader({ layer, value, onChange }: { layer: MixLayer; value: number; onChange: (v: number) => void }) {
  const [width, setWidth] = useState(1);
  const ratio = Math.max(0, Math.min(1, value / GAIN_MAX));
  const neutralRatio = 1 / GAIN_MAX; // 100% marker
  const muted = value < 0.06;

  function onLayout(e: LayoutChangeEvent) {
    setWidth(Math.max(1, e.nativeEvent.layout.width));
  }
  function setFromEvent(e: GestureResponderEvent) {
    const r = Math.max(0, Math.min(1, e.nativeEvent.locationX / width));
    onChange(r * GAIN_MAX);
  }

  return (
    <View style={styles.faderRow}>
      <Touch
        onPress={() => onChange(muted ? 1 : 0)}
        style={styles.faderLabel}
        hitSlop={6}
        accessibilityLabel={`${MIX_LAYER_LABEL[layer]} ${muted ? 'muted, tap to restore' : 'tap to mute'}`}
      >
        <Icon name={LAYER_ICON[layer]} size={15} color={muted ? Theme.textFaint : Theme.text} />
        <Text variant="caption" weight="600" color={muted ? Theme.textFaint : Theme.text}>
          {MIX_LAYER_LABEL[layer]}
        </Text>
      </Touch>

      <View
        style={styles.track}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={setFromEvent}
        onResponderMove={setFromEvent}
        onResponderRelease={setFromEvent}
        accessibilityRole="adjustable"
        accessibilityLabel={`${MIX_LAYER_LABEL[layer]} level`}
        accessibilityValue={{ now: Math.round(value * 100), min: 0, max: Math.round(GAIN_MAX * 100) }}
      >
        <View style={styles.trackBg} />
        <View style={[styles.neutralTick, { left: `${neutralRatio * 100}%` }]} />
        <View style={[styles.trackFill, { width: `${ratio * 100}%`, backgroundColor: muted ? Theme.textFaint : Theme.text }]} />
        <View style={[styles.thumb, { left: `${ratio * 100}%`, backgroundColor: muted ? Theme.textFaint : Theme.text }]} />
      </View>

      <Text variant="mono" color={muted ? Theme.textFaint : Theme.textDim} style={styles.value}>
        {Math.round(value * 100)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 14, gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  eyebrow: { letterSpacing: 1 },
  reset: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, backgroundColor: Theme.fill },
  faderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40 },
  faderLabel: { width: 78, flexDirection: 'row', alignItems: 'center', gap: 7 },
  track: { flex: 1, height: 34, justifyContent: 'center' },
  trackBg: { position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3, backgroundColor: Theme.fill },
  neutralTick: { position: 'absolute', width: 2, height: 12, marginLeft: -1, borderRadius: 1, backgroundColor: Theme.textGhost },
  trackFill: { position: 'absolute', left: 0, height: 6, borderRadius: 3 },
  thumb: { position: 'absolute', width: 16, height: 16, borderRadius: 8, marginLeft: -8 },
  value: { width: 34, textAlign: 'right', fontSize: 11.5 },
});

import { useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { seekRatioToMs } from '../../lib/player-time';
import { PulseLine } from './PulseLine';

type SeekBarProps = {
  progress: number;
  beatPulse: number;
  active: boolean;
  durationMs: number;
  seekTo: (targetMs: number) => void;
};

export function SeekBar({ progress, beatPulse, active, durationMs, seekTo }: SeekBarProps) {
  const [width, setWidth] = useState(1);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(Math.max(1, e.nativeEvent.layout.width));
  }

  function seekFromEvent(e: GestureResponderEvent) {
    seekTo(seekRatioToMs(e.nativeEvent.locationX / width, durationMs));
  }

  return (
    <View
      style={styles.wrap}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={seekFromEvent}
      onResponderMove={seekFromEvent}
      onResponderRelease={seekFromEvent}
      accessibilityRole="adjustable"
      accessibilityLabel="Song position"
    >
      <PulseLine progress={progress} beatPulse={beatPulse} active={active} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 34,
    justifyContent: 'center',
  },
});

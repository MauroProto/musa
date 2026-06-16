import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Theme } from '../constants/theme';

/**
 * Fondo minimalista: negro absoluto con un halo de luz superior
 * apenas perceptible (blanco ~5%) para dar profundidad sin ruido.
 * `lift` permite intensificar el halo en una pantalla concreta (p.ej. el player).
 */
export const Backdrop = memo(function Backdrop({ lift = 0.05 }: { lift?: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: Theme.bg }]} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <RadialGradient id="backdrop-top" cx="50%" cy="2%" r="80%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={lift.toFixed(3)} />
            <Stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#backdrop-top)" />
      </Svg>
    </View>
  );
});

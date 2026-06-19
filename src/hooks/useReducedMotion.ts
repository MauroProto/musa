import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Cross-platform "prefers reduced motion".
 *
 * MUSA leans heavily on a living, music-reactive background and pulsing
 * haptual feedback. For users who find motion uncomfortable (and as a
 * baseline accessibility courtesy), we must be able to calm every looping
 * animation to a still, legible state. Reach for this hook anywhere a
 * decorative/looping animation runs.
 *
 *  • Native  → AccessibilityInfo.isReduceMotionEnabled + change listener.
 *  • Web      → window.matchMedia('(prefers-reduced-motion: reduce)').
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => mounted && setReduced(mql.matches);
      update();
      // Safari < 14 uses addListener/removeListener.
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
      }
      mql.addListener(update);
      return () => mql.removeListener(update);
    }

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => mounted && setReduced(value))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      if (mounted) setReduced(value);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

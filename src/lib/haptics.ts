import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { HapticEventType, HapticStrength, Intensity } from './types';
import {
  buildHapticSequence,
  type AndroidHapticName,
  type HapticStep,
  type IosHapticName,
} from './haptic-sequence';

type HapticPlatform = 'android' | 'ios' | 'web';

const ANDROID_HAPTICS: Record<AndroidHapticName, Haptics.AndroidHaptics> = {
  'clock-tick': Haptics.AndroidHaptics.Clock_Tick,
  confirm: Haptics.AndroidHaptics.Confirm,
  'context-click': Haptics.AndroidHaptics.Context_Click,
  'gesture-end': Haptics.AndroidHaptics.Gesture_End,
  'gesture-start': Haptics.AndroidHaptics.Gesture_Start,
  'keyboard-press': Haptics.AndroidHaptics.Keyboard_Press,
  'long-press': Haptics.AndroidHaptics.Long_Press,
  'segment-frequent-tick': Haptics.AndroidHaptics.Segment_Frequent_Tick,
  'segment-tick': Haptics.AndroidHaptics.Segment_Tick,
  'virtual-key': Haptics.AndroidHaptics.Virtual_Key,
  'virtual-key-release': Haptics.AndroidHaptics.Virtual_Key_Release,
};

const IOS_IMPACTS: Partial<Record<IosHapticName, Haptics.ImpactFeedbackStyle>> = {
  'impact-heavy': Haptics.ImpactFeedbackStyle.Heavy,
  'impact-light': Haptics.ImpactFeedbackStyle.Light,
  'impact-medium': Haptics.ImpactFeedbackStyle.Medium,
  'impact-rigid': Haptics.ImpactFeedbackStyle.Rigid,
  'impact-soft': Haptics.ImpactFeedbackStyle.Soft,
};

function vibrateWeb(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* no-op */
  }
}

function currentPlatform(): HapticPlatform {
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'ios') return 'ios';
  return 'web';
}

function playIos(name: IosHapticName) {
  if (name === 'selection') {
    void Haptics.selectionAsync().catch(() => {});
    return;
  }
  if (name === 'notification-success') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return;
  }
  if (name === 'notification-warning') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    return;
  }
  const style = IOS_IMPACTS[name] ?? Haptics.ImpactFeedbackStyle.Medium;
  void Haptics.impactAsync(style).catch(() => {});
}

function playNativeStep(step: HapticStep) {
  if (Platform.OS === 'android') {
    void Haptics.performAndroidHapticsAsync(ANDROID_HAPTICS[step.android]).catch(() => {
      playIos(step.ios);
    });
    return;
  }
  playIos(step.ios);
}

export type HapticController = {
  fire: (type: HapticEventType, intensity: Intensity) => void;
  stop: () => void;
};

export function createHapticController(opts: {
  strength: HapticStrength;
  visualOnly: boolean;
}): HapticController {
  const timers = new Set<ReturnType<typeof setTimeout>>();

  function schedule(fn: () => void, delayMs: number) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, delayMs);
    timers.add(id);
  }

  function fire(type: HapticEventType, intensity: Intensity) {
    if (opts.visualOnly) return;
    const platform = currentPlatform();
    const sequence = buildHapticSequence(type, {
      strength: opts.strength,
      intensity,
    });

    if (platform === 'web') {
      if (sequence.webPattern !== null) vibrateWeb(sequence.webPattern);
      return;
    }

    for (const step of sequence.steps) {
      if (step.delayMs <= 0) playNativeStep(step);
      else schedule(() => playNativeStep(step), step.delayMs);
    }
  }

  function stop() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
    if (Platform.OS === 'web') vibrateWeb(0);
  }

  return { fire, stop };
}

export function previewHaptic(
  type: HapticEventType,
  strength: HapticStrength,
  intensity: Intensity,
) {
  const ctrl = createHapticController({ strength, visualOnly: false });
  ctrl.fire(type, intensity);
  setTimeout(() => ctrl.stop(), 1500);
}

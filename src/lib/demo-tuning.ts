import type { AuthoredMoment, Intensity } from './types';

export type DemoMomentOverride = {
  startOffsetMs?: number;
  endOffsetMs?: number;
  repeatEveryMs?: number;
  intensity?: Intensity;
  enabled?: boolean;
};

export type DemoTuningOverrides = Record<string, DemoMomentOverride>;

function keyForMoment(moment: AuthoredMoment): string {
  return moment.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function clampEnd(startMs: number, endMs: number): number {
  return Math.max(startMs + 120, endMs);
}

export function applyDemoTuning(
  moments: AuthoredMoment[],
  overrides: DemoTuningOverrides,
): AuthoredMoment[] {
  return moments.flatMap((moment) => {
    const key = keyForMoment(moment);
    const override = overrides[key] ?? overrides[moment.label] ?? {};
    if (override.enabled === false) return [];

    const t = Math.max(0, moment.t + (override.startOffsetMs ?? 0));
    const endMs = clampEnd(t, moment.endMs + (override.endOffsetMs ?? 0));
    const repeatEveryMs = override.repeatEveryMs ?? moment.repeatEveryMs;
    return [{
      ...moment,
      t,
      endMs,
      intensity: override.intensity ?? moment.intensity,
      ...(repeatEveryMs !== undefined ? { repeatEveryMs } : {}),
    }];
  });
}

export function tuningSnippetForMoments(moments: AuthoredMoment[]): string {
  return moments.map((moment) => {
    const lines = [
      '  {',
      `    t: ${moment.t},`,
      `    endMs: ${moment.endMs},`,
      `    layer: '${moment.layer}',`,
      `    label: '${escapeSingle(moment.label)}',`,
      `    detail: '${escapeSingle(moment.detail)}',`,
      `    intensity: ${moment.intensity},`,
      ...(moment.mood ? [`    mood: '${moment.mood}',`] : []),
      `    cueType: '${moment.cueType}',`,
      ...(moment.repeatEveryMs !== undefined ? [`    repeatEveryMs: ${moment.repeatEveryMs},`] : []),
      '  },',
    ];
    return lines.join('\n');
  }).join('\n');
}

function escapeSingle(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
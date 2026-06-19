import type { GuidedDemoStep } from './demo-guided.ts';
import type { SensoryMoment, SyncedLine } from './types.ts';

export type PlayerDisplayMode = 'idle' | 'prelude' | 'lyric' | 'empty';

export type PlayerDisplayState = {
  mode: PlayerDisplayMode;
  primaryText: string;
  previousText: string | null;
  nextText: string | null;
  statusLabel: string | null;
};

type PlayerDisplayInput = {
  lines: SyncedLine[];
  currentLineIndex: number;
  isPlaying: boolean;
  currentMs: number;
  activeMoments: SensoryMoment[];
  guidedStep?: GuidedDemoStep | null;
};

export function resolvePlayerDisplayState({
  lines,
  currentLineIndex,
  isPlaying,
  currentMs,
  activeMoments,
  guidedStep,
}: PlayerDisplayInput): PlayerDisplayState {
  const currentLine = currentLineIndex >= 0 ? lines[currentLineIndex] : null;
  if (currentLine) {
    return {
      mode: 'lyric',
      primaryText: currentLine.text,
      previousText: currentLineIndex > 0 ? lines[currentLineIndex - 1]?.text ?? null : null,
      nextText: currentLineIndex < lines.length - 1 ? lines[currentLineIndex + 1]?.text ?? null : null,
      statusLabel: null,
    };
  }

  if (lines.length === 0) {
    return {
      mode: 'empty',
      primaryText: 'Waiting for synced lyrics...',
      previousText: null,
      nextText: null,
      statusLabel: isPlaying ? 'Loading' : null,
    };
  }

  if (!isPlaying) {
    return {
      mode: 'idle',
      primaryText: 'Press play',
      previousText: null,
      nextText: firstUpcomingLine(lines, currentMs)?.text ?? null,
      statusLabel: 'Ready',
    };
  }

  const activeMoment = activeMoments[0];
  const primaryText = activeMoment?.label ?? guidedStep?.label ?? 'Listening for first caption';

  return {
    mode: 'prelude',
    primaryText,
    previousText: null,
    nextText: firstUpcomingLine(lines, currentMs)?.text ?? null,
    statusLabel: 'Intro',
  };
}

function firstUpcomingLine(lines: SyncedLine[], currentMs: number): SyncedLine | null {
  return lines.find((line) => line.startMs > currentMs) ?? null;
}

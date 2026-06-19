import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowRight,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  CellSignalFull,
  CellSignalLow,
  CellSignalMedium,
  CircleHalf,
  Cpu,
  Disc,
  Ear,
  Eye,
  Faders,
  FlowArrow,
  GitBranch,
  HandHeart,
  HandTap,
  Heart,
  House,
  Lightning,
  MagnifyingGlass,
  Metronome,
  Microphone,
  MusicNote,
  MusicNotes,
  NavigationArrow,
  Pause,
  Pill,
  Play,
  Pulse,
  Question,
  SkipForward,
  SlidersHorizontal,
  SpeakerHigh,
  SpeakerSlash,
  StackSimple,
  TrendUp,
  Vibrate,
  VinylRecord,
  Waveform,
  WaveSine,
  Wind,
  X,
  type IconProps,
} from 'phosphor-react-native';
import type { ComponentType } from 'react';
import { Theme } from '../constants/theme';

/**
 * One icon system for the whole app: Phosphor (premium, thin-line, Apple-adjacent),
 * addressed by semantic names so screens never touch the raw library.
 */
const MAP = {
  // chrome / nav
  search: MagnifyingGlass,
  vinyl: VinylRecord,
  wave: Waveform,
  vibrate: Vibrate,
  settings: SlidersHorizontal,
  back: CaretLeft,
  chevronRight: CaretRight,
  chevronUp: CaretUp,
  chevronDown: CaretDown,
  close: X,
  help: Question,
  arrowRight: ArrowRight,
  home: House,
  // transport
  play: Play,
  pause: Pause,
  rewind: ArrowCounterClockwise,
  forward: ArrowClockwise,
  skipForward: SkipForward,
  navigation: NavigationArrow,
  // profiles
  eye: Eye,
  ear: Ear,
  chip: Cpu,
  medical: Pill,
  feel: HandHeart,
  // strength
  signalLow: CellSignalLow,
  signalMid: CellSignalMedium,
  signalHigh: CellSignalFull,
  // settings sections
  handTap: HandTap,
  faders: Faders,
  display: CircleHalf,
  music: MusicNotes,
  // layers / cues
  bass: WaveSine,
  drums: Metronome,
  guitar: MusicNote,
  voice: Microphone,
  energy: Lightning,
  emotion: Heart,
  structure: GitBranch,
  disc: Disc,
  flash: Lightning,
  pulse: Pulse,
  trendUp: TrendUp,
  wind: Wind,
  flow: FlowArrow,
  layers: StackSimple,
  speaker: SpeakerHigh,
  speakerMute: SpeakerSlash,
} satisfies Record<string, ComponentType<IconProps>>;

export type IconName = keyof typeof MAP;
export type IconWeight = IconProps['weight'];

export function Icon({
  name,
  size = 22,
  color = Theme.text,
  weight = 'regular',
}: {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
}) {
  const Cmp = MAP[name];
  return <Cmp size={size} color={color} weight={weight} />;
}

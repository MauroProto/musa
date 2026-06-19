/**
 * MUSA — Tipos core del Sensory Score.
 * Estos tipos son la columna vertebral del producto:
 * convierten synced lyrics (Musixmatch) en eventos táctiles y visuales.
 */

/** Una línea de letra sincronizada, tal como llega de Musixmatch subtitle.get */
export type SyncedLine = {
  startMs: number;
  endMs?: number;
  text: string;
};

/** Track normalizado desde Musixmatch */
export type Track = {
  trackId: number;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  durationMs?: number;
  hasSubtitles: boolean;
  instrumental?: boolean;
};

/** Perfil de escucha elegido en onboarding */
export type ListeningProfile =
  | 'deaf_visual'
  | 'hard_of_hearing'
  | 'cochlear_implant'
  | 'hearing_aid'
  | 'feel_more';

/** Intensidad háptica calibrada por la usuaria */
export type HapticStrength = 'soft' | 'medium' | 'strong';

/** Tipos de evento del lenguaje háptico (haptic alphabet) */
export type HapticEventType =
  | 'beat' // pulso principal repetido
  | 'bass_pulse' // pulso corporal de bajo / low-end
  | 'drum_fill' // textura percusiva breve antes de cambios
  | 'guitar_strum' // rasgueo / ataque de guitarra
  | 'guitar_riff' // riff de guitarra curado / syncopado
  | 'energy_rise' // build-up / incremento de tensión
  | 'line_start' // nueva línea vocal (double tap)
  | 'mood_shift' // cambio emocional perceptible
  | 'chorus_warning' // coro próximo (3 taps ascendentes)
  | 'chorus' // impacto de coro/drop
  | 'pause' // silencio / respiración
  | 'sustain' // frase larga/emocional (vibración sostenida)
  | 'section_end'; // fin de sección

/** Intensidad normalizada (0–1) en pasos discretos */
export type Intensity = 0.2 | 0.4 | 0.6 | 0.8 | 1;

export type HapticEvent = {
  t: number; // ms absoluta desde el inicio de la canción
  type: HapticEventType;
  intensity: Intensity;
  durationMs: number;
};

/** Punto de energía (de stems LALAL o estimado) */
export type EnergyPoint = {
  t: number;
  value: number; // 0–1
};

export type StemFrame = {
  t: number;
  bass?: number;
  drums?: number;
  guitar?: number;
  vocals?: number;
  /** Transient/attack intensity (peak amplitude) per stem, 0–1. Used for strum/fill/bass attacks. */
  onsetBass?: number;
  onsetDrums?: number;
  onsetGuitar?: number;
  onsetVocals?: number;
};

export type StemAnalysis = {
  source: 'lalal' | 'lalal-local';
  durationMs?: number;
  bpm?: number;
  frames: StemFrame[];
};

/** Sección estructural detectada */
export type SectionMark = {
  t: number;
  endMs?: number;
  kind: 'verse' | 'chorus' | 'intro' | 'outro' | 'bridge';
  label?: string;
};

export type SensoryLayer = 'voice' | 'rhythm' | 'bass' | 'drums' | 'guitar' | 'emotion' | 'structure';

export type SensoryMood =
  | 'calm'
  | 'driving'
  | 'euphoric'
  | 'melancholic'
  | 'neutral'
  | 'tense';

export type SensoryMoment = {
  t: number;
  endMs: number;
  layer: SensoryLayer;
  label: string;
  detail: string;
  intensity: Intensity;
  mood?: SensoryMood;
};

/** Resultado completo del motor */
export type SensoryScore = {
  events: HapticEvent[];
  beats: number[];
  sections: SectionMark[];
  energy: EnergyPoint[];
  moments: SensoryMoment[];
  durationMs: number;
  chorusTimesMs: number[];
  source: 'semantic' | 'lalal' | 'lalal-local';
  bpm: number;
};

/** Input del motor */
export type SensoryScoreInput = {
  lines: SyncedLine[];
  bpm?: number;
  energy?: EnergyPoint[];
  stemAnalysis?: StemAnalysis;
  durationMs?: number;
  /** Curated, human-authored moments that override auto-detection in their windows. */
  authored?: AuthoredMoment[];
};

/**
 * A human-authored tactile/narrative moment for a specific track.
 * Authored moments win over auto-detected moments of the same layer when they
 * overlap in time, and their cue is injected into the haptic event stream.
 */
export type AuthoredMoment = {
  t: number;
  endMs: number;
  layer: SensoryLayer;
  label: string;
  detail: string;
  intensity: Intensity;
  mood?: SensoryMood;
  /** Haptic cue fired at moment.t (and repeated across the window if repeatEveryMs is set). */
  cueType: HapticEventType;
  /** If set, the cueType repeats every repeatEveryMs across [t, endMs] (e.g. a riff). */
  repeatEveryMs?: number;
  /** If true, regular beat pulses pause while this authored moment is active. */
  suppressBeat?: boolean;
};

/** Preferencias de usuaria que afectan la generación */
export type ScorePreferences = {
  strength: HapticStrength;
  visualOnly: boolean;
};

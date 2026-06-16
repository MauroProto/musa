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
  | 'line_start' // nueva línea vocal (double tap)
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

/** Sección estructural detectada */
export type SectionMark = {
  t: number;
  endMs?: number;
  kind: 'verse' | 'chorus' | 'intro' | 'outro' | 'bridge';
  label?: string;
};

/** Resultado completo del motor */
export type SensoryScore = {
  events: HapticEvent[];
  beats: number[];
  sections: SectionMark[];
  energy: EnergyPoint[];
  durationMs: number;
  chorusTimesMs: number[];
};

/** Input del motor */
export type SensoryScoreInput = {
  lines: SyncedLine[];
  bpm?: number;
  energy?: EnergyPoint[];
  durationMs?: number;
};

/** Preferencias de usuaria que afectan la generación */
export type ScorePreferences = {
  strength: HapticStrength;
  visualOnly: boolean;
};

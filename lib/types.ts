import type { RhythmHit, NoteName } from "./rhythm-engine";

export type AccessLevel = "free" | "premium";

export type ExerciseType =
  | "quiz"
  | "tap_pulse"
  | "complete_bar"
  | "listen_choose"
  | "takadimi"
  | "dictation"
  | "human_metronome"
  | "module_exam"
  | "call_response";

export type RhythmOption = {
  label: string;
  abc: string;
  syllables: string[];
  hits?: RhythmHit[];
  defaultNote?: NoteName;
};

export type LessonExercise = {
  type: ExerciseType;
  title: string;
  prompt: string;
  xp: number;
  options?: string[];
  answer?: string;
  explanation?: string;
  bpm?: number;
  beats?: number;
  pattern?: string[];
  choices?: string[][];
  correctIndex?: number;
  rhythmOptions?: RhythmOption[];
  passScore?: number;
  rhythm?: RhythmOption;
};

export type Lesson = {
  slug: string;
  title: string;
  description: string;
  objective: string;
  theory: string[];
  teacherTip: string;
  commonMistake: string;
  realMusicExample: string;
  videoTitle: string;
  youtubeId?: string;
  visualPattern: string[];
  reflection: string;
  xp: number;
  access: AccessLevel;
  difficulty: "Inicial" | "Básico" | "Intermedio" | "Avanzado" | "Desafío";
  level: number;
  estimatedMinutes: number;
  skills: string[];
  exercises: LessonExercise[];
};

export type Module = {
  slug: string;
  title: string;
  description: string;
  mascot: string;
  color: string;
  xp: number;
  access: AccessLevel;
  stage: string;
  level: number;
  difficulty: "Inicial" | "Básico" | "Intermedio" | "Avanzado" | "Desafío";
  lessons: Lesson[];
};

export type LevelDefinition = {
  level: number;
  name: string;
  minXp: number;
  nextXp: number | null;
  badge: string;
  description: string;
};

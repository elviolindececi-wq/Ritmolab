/**
 * lib/engine/types.ts
 * 
 * Tipos centrales de la arquitectura escalable.
 * Las 18 lecciones existentes en lib/content.ts NO se tocan — siguen usando
 * los tipos de lib/types.ts. Esta capa nueva convive en paralelo.
 */

import type { NoteName } from "@/lib/rhythm-engine";

// ─── Figuras rítmicas ─────────────────────────────────────────────────────────

export type Figure =
  | "whole"           // redonda       — 4 pulsos
  | "half"            // blanca        — 2 pulsos
  | "quarter"         // negra         — 1 pulso
  | "eighth"          // corchea       — 0.5 pulsos
  | "sixteenth"       // semicorchea   — 0.25 pulsos
  | "triplet"         // tresillo      — 0.333 pulsos
  | "dotted_half"     // blanca con puntillo — 3 pulsos
  | "dotted_quarter"  // negra con puntillo  — 1.5 pulsos
  | "quarter_rest"    // silencio de negra
  | "eighth_rest"     // silencio de corchea
  | "half_rest"       // silencio de blanca
  | "syncope"         // síncopa
  | "eighth_triplet"; // tresillo de corcheas

export type TimeSignature = "4/4" | "3/4" | "2/4" | "3/8" | "6/8" | "12/8" | "5/4" | "7/8";

// ─── Habilidades rítmicas ─────────────────────────────────────────────────────

export type SkillId =
  | "pulse"           // Pulso interno — estabilidad temporal
  | "reading"         // Lectura rítmica — decodificar partitura
  | "dictation"       // Dictado rítmico — identificar de oído
  | "subdivision"     // Subdivisión — dividir el pulso
  | "silence"         // Silencios — contar sin tocar
  | "syncopation"     // Síncopa y contratiempos
  | "meter"           // Compases — sentir la métrica
  | "speed"           // Velocidad — precisión a tempo alto
  | "memory"          // Memoria rítmica — retener y reproducir
  | "independence"    // Coordinación bimanual
  | "sight_reading"   // Lectura a primera vista
  | "groove";         // Groove — sensación rítmica aplicada

export type SkillLevel = "untrained" | "weak" | "developing" | "strong" | "mastered";

export type SkillState = {
  id: SkillId;
  level: SkillLevel;
  /** 0–100 */
  accuracy: number;
  /** Sessions where accuracy >= 80 */
  strongSessions: number;
  /** ISO date string */
  lastPracticed: string | null;
  /** Total exercise attempts */
  totalAttempts: number;
  /** Next recommended review (ISO date) */
  nextReview: string | null;
};

// ─── Patrón rítmico generativo ────────────────────────────────────────────────

export type BeatSlot = {
  /** Position in quarter-note beats */
  beat: number;
  figure: Figure;
  note?: NoteName;
  accent?: boolean;
  label?: string;
};

export type RhythmPattern = {
  id: string;
  /** Human-readable label e.g. "TA TA-KA TA TA" */
  label: string;
  timeSignature: TimeSignature;
  /** Duration in quarter-note beats */
  totalBeats: number;
  /** Number of measures generated for this pattern */
  bars?: number;
  bpm: number;
  slots: BeatSlot[];
  /** Which skills this pattern exercises */
  skills: SkillId[];
  /** 1–10 */
  difficulty: number;
  /** ABC notation for AbcStaff */
  abc: string;
  /** Takadimi syllables */
  syllables: string[];
};

// ─── Ejercicio generativo ─────────────────────────────────────────────────────

export type GenerativeExerciseType =
  | "metronome"        // Toca el patrón con precisión
  | "dictation"        // Escucha y elige la partitura
  | "call_response"    // Escucha y reproduce de memoria
  | "sight_reading"    // Lee y toca sin preparación
  | "error_detect"     // ¿Cuál versión tiene el error?
  | "fill_blank"       // Completá el compás faltante
  | "speed_ladder";    // Mismo patrón, BPM sube cada ronda

export type GenerativeExercise = {
  type: GenerativeExerciseType;
  pattern: RhythmPattern;
  /** For dictation: the wrong options */
  distractors?: RhythmPattern[];
  /** For speed_ladder: starting and target BPM */
  bpmRange?: { start: number; target: number; step: number };
  /** XP for completing */
  xp: number;
  /** Minimum accuracy to count as passed */
  passScore: number;
  /** Which skill this primarily develops */
  primarySkill: SkillId;
};

// ─── Dominio de habilidad ─────────────────────────────────────────────────────

export type DomainCriteria = {
  /** Minimum accuracy per session */
  minAccuracy: number;
  /** How many passing sessions needed */
  passingSessions: number;
  /** Must pass at different BPM values */
  bpmVariants: number;
  /** Must pass a review N days later */
  reviewAfterDays: number;
};

export const DOMAIN_CRITERIA: Record<SkillLevel, DomainCriteria> = {
  untrained:   { minAccuracy: 0,  passingSessions: 0, bpmVariants: 1, reviewAfterDays: 0 },
  weak:        { minAccuracy: 60, passingSessions: 1, bpmVariants: 1, reviewAfterDays: 1 },
  developing:  { minAccuracy: 75, passingSessions: 2, bpmVariants: 1, reviewAfterDays: 3 },
  strong:      { minAccuracy: 85, passingSessions: 3, bpmVariants: 2, reviewAfterDays: 7 },
  mastered:    { minAccuracy: 90, passingSessions: 5, bpmVariants: 3, reviewAfterDays: 21 },
};

// ─── Mundo escalable ─────────────────────────────────────────────────────────

export type WorldId =
  | "pulse"          // Mundo 1
  | "durations"      // Mundo 2
  | "eighths"        // Mundo 3
  | "reading"        // Mundo 4
  | "dictation"      // Mundo 5
  | "subdivision"    // Mundo 6
  | "musicalidad"    // Mundo 7
  | "memory"         // Mundo 8
  | "speed"          // Mundo 9 (nuevo)
  | "latin"          // Mundo 10 (nuevo)
  | "jazz"           // Mundo 11 (nuevo)
  | "sight"          // Mundo 12 (nuevo)
  | "meters"         // Mundo 13 (nuevo)
  | "funk"           // Mundo 14 (nuevo)
  | "advanced"       // Mundo 15 (nuevo)
  | "master";        // Mundo 16 (nuevo)

export type WorldDef = {
  id: WorldId;
  title: string;
  description: string;
  color: string;
  emoji: string;
  /** Skill this world primarily develops */
  primarySkill: SkillId;
  /** All skills exercised */
  skills: SkillId[];
  /** Figures introduced or used */
  figures: Figure[];
  /** Allowed time signatures */
  timeSignatures: TimeSignature[];
  reading?: string[];
  /** BPM range for exercises in this world */
  bpmRange: { min: number; max: number };
  /** Difficulty 1–10 */
  difficulty: number;
  /** World that must be >= "strong" before this unlocks */
  prerequisiteWorld?: WorldId;
  /** Skill level needed to unlock */
  prerequisiteSkillLevel?: SkillLevel;
  /** Fixed lessons (from content.ts) that anchor this world */
  anchorLessonSlugs: string[];
  /** How many generative exercises the world generates per session */
  generativeExercisesPerSession: number;
  /** Domain criteria to complete this world */
  domainCriteria: DomainCriteria;
};

// ─── Reto diario/semanal ─────────────────────────────────────────────────────

export type ChallengeType =
  | "accuracy_target"   // Lograr X% en habilidad Y
  | "session_streak"    // Practicar N días seguidos
  | "speed_push"        // Alcanzar X BPM
  | "weak_skill"        // Practicar habilidad débil N veces
  | "perfect_run"       // Completar ejercicio sin errores
  | "bpm_ladder";       // Completar speed ladder

export type ChallengeDef = {
  type: ChallengeType;
  title: string;
  description: string;
  xpReward: number;
  targetSkill: SkillId;
  targetValue: number;
  /** "daily" | "weekly" */
  cadence: "daily" | "weekly";
};

// ─── Modo práctica libre ─────────────────────────────────────────────────────

export type FreePracticeConfig = {
  skill: SkillId;
  exerciseType: GenerativeExerciseType;
  difficulty: number;       // 1–10
  bpm: number;
  timeSignature: TimeSignature;
  figures: Figure[];
  bars: number;             // length of generated pattern
  withMetronome: boolean;
  withFeedback: boolean;
};

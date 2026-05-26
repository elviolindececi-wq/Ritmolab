/**
 * lib/engine/lifelong-training.ts
 *
 * Capa de producto para que RitmoLab no tenga final.
 * Convierte habilidades, mundos y sesiones reales en recomendaciones diarias,
 * mantenimiento de dominio y sesiones infinitas por mundo.
 */

import type {
  ChallengeDef,
  GenerativeExercise,
  GenerativeExerciseType,
  SkillId,
  SkillState,
  TimeSignature,
  WorldDef,
  WorldId,
} from "./types";
import { generatePattern, generateDistractors } from "./pattern-generator";
import { generateDailyChallenges, generateWeeklyChallenge } from "./challenge-engine";
import { getSkillsDueForReview, getWeakSkills, SKILL_LABELS } from "./skill-system";
import { WORLD_ORDER, WORLDS } from "./worlds";

export type TrainingFocus = "review" | "weakness" | "progression" | "maintenance" | "master";

export type TodayTrainingPlan = {
  title: string;
  subtitle: string;
  focus: TrainingFocus;
  primarySkill: SkillId;
  recommendedWorld: WorldId;
  minutes: number;
  bpm: number;
  difficulty: number;
  exerciseTypes: GenerativeExerciseType[];
  reason: string;
  ctaHref: string;
  dailyChallenges: ChallengeDef[];
  weeklyChallenge: ChallengeDef;
};

export type WorldProgress = {
  world: WorldDef;
  locked: boolean;
  level: "locked" | "not-started" | "active" | "strong" | "mastered";
  progressPercent: number;
  reason: string;
};

export type WorldSessionStep = {
  title: string;
  description: string;
  exercise: GenerativeExercise;
};

const EXERCISE_ROTATION: GenerativeExerciseType[] = [
  "metronome",
  "dictation",
  "sight_reading",
  "call_response",
  "error_detect",
  "fill_blank",
  "speed_ladder",
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function pickOldest(states: SkillState[]) {
  return [...states].sort((a, b) => {
    if (!a.lastPracticed) return -1;
    if (!b.lastPracticed) return 1;
    return new Date(a.lastPracticed).getTime() - new Date(b.lastPracticed).getTime();
  })[0];
}

function worldForSkill(skillId: SkillId): WorldDef {
  return WORLD_ORDER.map(id => WORLDS[id]).find(w => w.primarySkill === skillId || w.skills.includes(skillId)) ?? WORLDS.pulse;
}

function bpmForWorld(world: WorldDef, state?: SkillState) {
  const base = Math.round((world.bpmRange.min + world.bpmRange.max) / 2);
  if (!state) return base;
  if (state.level === "weak" || state.level === "untrained") return world.bpmRange.min;
  if (state.level === "developing") return base;
  return clamp(base + 12, world.bpmRange.min, world.bpmRange.max);
}

export function generateTodayTrainingPlan(states: SkillState[]): TodayTrainingPlan {
  const safeStates = states.length > 0 ? states : [];
  const weak = getWeakSkills(safeStates);
  const due = getSkillsDueForReview(safeStates);
  const mastered = safeStates.filter(s => s.level === "mastered");
  const target = due[0] ?? weak[0] ?? pickOldest(safeStates) ?? { id: "pulse", level: "untrained", accuracy: 0, totalAttempts: 0 } as SkillState;
  const world = worldForSkill(target.id);
  const focus: TrainingFocus = due.length > 0 ? "review" : weak.length > 0 ? "weakness" : mastered.length >= 8 ? "master" : target.level === "mastered" ? "maintenance" : "progression";

  const focusCopy: Record<TrainingFocus, { title: string; subtitle: string; reason: string }> = {
    review: {
      title: "Repaso inteligente de hoy",
      subtitle: `Mantené ${SKILL_LABELS[target.id].name.toLowerCase()} antes de que se enfríe.`,
      reason: "Esta habilidad ya fue practicada, pero el intervalo de repaso venció.",
    },
    weakness: {
      title: "Entrenamiento recomendado",
      subtitle: `Hoy conviene reforzar ${SKILL_LABELS[target.id].name.toLowerCase()}.`,
      reason: "La precisión reciente está por debajo del nivel fuerte.",
    },
    progression: {
      title: "Siguiente paso de progreso",
      subtitle: `Avanzá en ${world.title.replace(/^Mundo \d+: /, "")}.`,
      reason: "La ruta principal todavía tiene habilidades por consolidar.",
    },
    maintenance: {
      title: "Mantenimiento de dominio",
      subtitle: `Dominaste ${SKILL_LABELS[target.id].name.toLowerCase()}, ahora toca sostenerlo.`,
      reason: "Una habilidad dominada debe mantenerse con sesiones periódicas.",
    },
    master: {
      title: "Modo maestro infinito",
      subtitle: "Subí precisión, BPM y lectura con patrones nuevos.",
      reason: "Ya hay varias habilidades dominadas; el objetivo ahora es excelencia sostenida.",
    },
  };

  const bpm = bpmForWorld(world, target);
  const difficulty = clamp(world.difficulty + (focus === "master" ? 1 : 0), 1, 10);
  const dailyChallenges = generateDailyChallenges(safeStates);
  const weeklyChallenge = generateWeeklyChallenge(safeStates);

  return {
    ...focusCopy[focus],
    focus,
    primarySkill: target.id,
    recommendedWorld: world.id,
    minutes: focus === "master" ? 18 : 10,
    bpm,
    difficulty,
    exerciseTypes: focus === "review" ? ["metronome", "dictation", "sight_reading"] : ["metronome", "dictation", "sight_reading", "call_response"],
    ctaHref: `/free-practice?skill=${target.id}`,
    dailyChallenges,
    weeklyChallenge,
  };
}

export function getSkillDecayStatus(state: SkillState): "fresh" | "due" | "stale" | "untrained" {
  if (!state.lastPracticed) return "untrained";
  const days = Math.floor((Date.now() - new Date(state.lastPracticed).getTime()) / 86_400_000);
  if (state.level === "mastered" && days > 30) return "stale";
  if (state.nextReview && new Date(state.nextReview).getTime() <= Date.now()) return "due";
  return "fresh";
}

export function buildWorldProgress(states: SkillState[]): WorldProgress[] {
  return WORLD_ORDER.map((id, index) => {
    const world = WORLDS[id];
    const relevant = states.filter(s => world.skills.includes(s.id));
    const primary = states.find(s => s.id === world.primarySkill);
    const previous = index > 0 ? WORLDS[WORLD_ORDER[index - 1]] : null;
    const previousPrimary = previous ? states.find(s => s.id === previous.primarySkill) : null;
    const locked = Boolean(previous && previousPrimary && ["untrained", "weak"].includes(previousPrimary.level));
    const avg = relevant.length > 0 ? Math.round(relevant.reduce((sum, s) => sum + s.accuracy, 0) / relevant.length) : 0;
    const trained = relevant.reduce((sum, s) => sum + s.totalAttempts, 0);
    const masteredSkills = relevant.filter(s => s.level === "mastered").length;
    const strongSkills = relevant.filter(s => s.level === "strong" || s.level === "mastered").length;

    let level: WorldProgress["level"] = "not-started";
    if (locked) level = "locked";
    else if (masteredSkills >= Math.max(1, Math.ceil(world.skills.length * 0.7))) level = "mastered";
    else if (strongSkills >= Math.max(1, Math.ceil(world.skills.length * 0.5))) level = "strong";
    else if (trained > 0) level = "active";

    const sessionProgress = clamp(Math.round((trained / Math.max(1, world.generativeExercisesPerSession * 4)) * 45), 0, 45);
    const accuracyProgress = clamp(Math.round(avg * 0.35), 0, 35);
    const masteryProgress = clamp(Math.round((strongSkills / Math.max(1, world.skills.length)) * 20), 0, 20);

    return {
      world,
      locked,
      level,
      progressPercent: locked ? 0 : clamp(sessionProgress + accuracyProgress + masteryProgress, 0, level === "mastered" ? 100 : 95),
      reason: locked
        ? `Primero fortalecé ${previous?.title.replace(/^Mundo \d+: /, "")}.`
        : level === "mastered"
          ? "Dominio alto: ahora funciona como mantenimiento y reto permanente."
          : trained === 0
            ? "Nuevo mundo disponible para empezar."
            : `Precisión media ${avg}% en ${trained} intentos vinculados.`,
    };
  });
}

export function generateWorldSession(worldId: WorldId, seedSuffix = "today"): WorldSessionStep[] {
  const world = WORLDS[worldId];
  const count = world.generativeExercisesPerSession;
  const bpmMid = Math.round((world.bpmRange.min + world.bpmRange.max) / 2);

  return Array.from({ length: count }).map((_, index) => {
    const type = EXERCISE_ROTATION[(index + world.difficulty) % EXERCISE_ROTATION.length];
    const timeSignature = world.timeSignatures[index % world.timeSignatures.length] as TimeSignature;
    const bpm = clamp(world.bpmRange.min + index * 6, world.bpmRange.min, world.bpmRange.max) || bpmMid;
    const pattern = generatePattern({
      difficulty: clamp(world.difficulty + (index % 3) - 1, 1, 10),
      timeSignature,
      bpm,
      bars: world.difficulty <= 3 ? 2 : world.difficulty <= 7 ? 3 : 4,
      allowedFigures: world.figures,
      skills: world.skills,
      seed: hashSeed(`${world.id}-${seedSuffix}-${index}`),
    });

    const exercise: GenerativeExercise = {
      type,
      pattern,
      distractors: type === "dictation" || type === "error_detect" ? generateDistractors(pattern, 3) : undefined,
      bpmRange: type === "speed_ladder" ? { start: world.bpmRange.min, target: world.bpmRange.max, step: 8 } : undefined,
      xp: 10 + world.difficulty * 2,
      passScore: world.difficulty >= 8 ? 88 : 80,
      primarySkill: world.primarySkill,
    };

    return {
      title: `${index + 1}. ${labelForExercise(type)}`,
      description: `${pattern.timeSignature} · ${pattern.bpm} BPM · ${pattern.bars ?? 1} compases · ${pattern.syllables.join(" ")}`,
      exercise,
    };
  });
}

export function labelForExercise(type: GenerativeExerciseType): string {
  const labels: Record<GenerativeExerciseType, string> = {
    metronome: "Precisión con metrónomo",
    dictation: "Dictado rítmico",
    call_response: "Call & response",
    sight_reading: "Lectura a primera vista",
    error_detect: "Detectar el error",
    fill_blank: "Completar el patrón",
    speed_ladder: "Escalera de BPM",
  };
  return labels[type];
}

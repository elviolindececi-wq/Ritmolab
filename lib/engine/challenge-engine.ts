/**
 * lib/engine/challenge-engine.ts
 *
 * Generador de retos diarios y semanales conectados a habilidades reales.
 * Los retos NO son aleatorios — se calculan en base a las habilidades débiles.
 */

import type { ChallengeDef, ChallengeType, SkillId } from "./types";
import type { SkillState } from "./types";
import { getWeakSkills } from "./skill-system";

// ─── Plantillas de retos por tipo ─────────────────────────────────────────────

const DAILY_TEMPLATES: Omit<ChallengeDef, "targetSkill">[] = [
  { type: "accuracy_target", cadence: "daily", title: "Precisión hoy",         description: "Lográ 80%+ en 3 ejercicios de @skill",     xpReward: 25, targetValue: 80 },
  { type: "session_streak",  cadence: "daily", title: "Un día más",             description: "Completá 1 sesión hoy para mantener racha", xpReward: 15, targetValue: 1 },
  { type: "weak_skill",      cadence: "daily", title: "Reforzar @skill",        description: "Practicá @skill 3 veces hoy",               xpReward: 30, targetValue: 3 },
  { type: "perfect_run",     cadence: "daily", title: "Sin errores",            description: "Completá 1 ejercicio de @skill sin fallar",  xpReward: 40, targetValue: 1 },
];

const WEEKLY_TEMPLATES: Omit<ChallengeDef, "targetSkill">[] = [
  { type: "accuracy_target", cadence: "weekly", title: "Maestro de la semana",  description: "Lográ 85%+ en @skill 5 veces esta semana",  xpReward: 100, targetValue: 85 },
  { type: "session_streak",  cadence: "weekly", title: "Racha semanal",         description: "Practicá 5 días seguidos esta semana",      xpReward: 75,  targetValue: 5 },
  { type: "speed_push",      cadence: "weekly", title: "Sube el BPM",           description: "Alcanzá tu BPM más alto con 80%+ de precisión", xpReward: 80, targetValue: 80 },
  { type: "bpm_ladder",      cadence: "weekly", title: "Escalera de velocidad", description: "Completá el modo speed ladder",             xpReward: 120, targetValue: 1 },
];

// ─── Selección inteligente de retos ──────────────────────────────────────────

/**
 * Genera los 3 retos diarios para el usuario basados en sus habilidades débiles.
 * Si no hay habilidades débiles, usa las que llevan más tiempo sin practicar.
 */
export function generateDailyChallenges(skillStates: SkillState[]): ChallengeDef[] {
  const weak = getWeakSkills(skillStates);
  const unpracticed = skillStates
    .filter(s => s.lastPracticed === null || s.level === "untrained")
    .slice(0, 3);

  // Priority: weak → unpracticed → any
  const targets: SkillId[] = [
    ...weak.map(s => s.id),
    ...unpracticed.map(s => s.id),
    "pulse", "reading", "dictation",  // fallback
  ].slice(0, 3);

  return [
    buildChallenge(DAILY_TEMPLATES[3], targets[0] ?? "pulse"),  // perfect_run on weakest
    buildChallenge(DAILY_TEMPLATES[0], targets[1] ?? "reading"), // accuracy_target
    buildChallenge(DAILY_TEMPLATES[1], targets[2] ?? "pulse"),   // session_streak (always)
  ];
}

export function generateWeeklyChallenge(skillStates: SkillState[]): ChallengeDef {
  const weak = getWeakSkills(skillStates);
  const targetSkill = weak[0]?.id ?? "pulse";
  // Alternate between accuracy and speed week over week based on current week number
  const weekNum = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
  const template = WEEKLY_TEMPLATES[weekNum % WEEKLY_TEMPLATES.length];
  return buildChallenge(template, targetSkill);
}

function buildChallenge(template: Omit<ChallengeDef, "targetSkill">, skill: SkillId): ChallengeDef {
  return {
    ...template,
    targetSkill: skill,
    title: template.title.replace("@skill", skill),
    description: template.description.replace(/@skill/g, skill),
  };
}

// ─── Track challenge progress ─────────────────────────────────────────────────

export type ChallengeProgress = {
  challenge: ChallengeDef;
  current: number;
  completed: boolean;
};

export function evaluateChallengeProgress(
  challenge: ChallengeDef,
  recentSessions: { skillId: SkillId; accuracy: number; bpm: number; timestamp: string }[]
): ChallengeProgress {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySessions = recentSessions.filter(s => new Date(s.timestamp) >= today);
  const skillSessions = todaySessions.filter(s => s.skillId === challenge.targetSkill);

  let current = 0;

  switch (challenge.type) {
    case "accuracy_target":
      current = skillSessions.filter(s => s.accuracy >= challenge.targetValue).length;
      break;
    case "weak_skill":
      current = skillSessions.length;
      break;
    case "perfect_run":
      current = skillSessions.filter(s => s.accuracy >= 95).length;
      break;
    case "session_streak":
      current = todaySessions.length > 0 ? 1 : 0;
      break;
    case "speed_push":
      current = skillSessions.length > 0 ? Math.max(...skillSessions.map(s => s.bpm)) : 0;
      break;
    default:
      current = 0;
  }

  return {
    challenge,
    current,
    completed: current >= challenge.targetValue,
  };
}

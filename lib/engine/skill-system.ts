/**
 * lib/engine/skill-system.ts
 *
 * Sistema de dominio por habilidad.
 * Calcula el nivel real de cada habilidad basado en historial de práctica.
 * NO depende de Supabase — funciona con cualquier array de sesiones.
 */

import type { SkillId, SkillState, SkillLevel } from "./types";
import { DOMAIN_CRITERIA } from "./types";

// ─── Sesión de práctica (input) ───────────────────────────────────────────────

export type PracticeSession = {
  skillId: SkillId;
  accuracy: number;    // 0–100
  bpm: number;
  timestamp: string;   // ISO
  exerciseType: string;
};

// ─── Calcular nivel de una habilidad ─────────────────────────────────────────

export function computeSkillLevel(sessions: PracticeSession[]): SkillLevel {
  if (sessions.length === 0) return "untrained";

  // Last 10 sessions for this skill
  const recent = sessions.slice(-10);
  const avgAccuracy = recent.reduce((s, p) => s + p.accuracy, 0) / recent.length;

  // Count sessions above each threshold
  const allTime = sessions;
  const passing85 = allTime.filter(s => s.accuracy >= 85).length;
  const passing75 = allTime.filter(s => s.accuracy >= 75).length;
  const bpmValues = new Set(allTime.filter(s => s.accuracy >= 80).map(s => Math.floor(s.bpm / 10) * 10));

  if (passing85 >= DOMAIN_CRITERIA.mastered.passingSessions && bpmValues.size >= DOMAIN_CRITERIA.mastered.bpmVariants) {
    return "mastered";
  }
  if (passing85 >= DOMAIN_CRITERIA.strong.passingSessions && bpmValues.size >= DOMAIN_CRITERIA.strong.bpmVariants) {
    return "strong";
  }
  if (passing75 >= DOMAIN_CRITERIA.developing.passingSessions) {
    return "developing";
  }
  if (allTime.some(s => s.accuracy >= DOMAIN_CRITERIA.weak.minAccuracy)) {
    return "weak";
  }
  return "untrained";
}

// ─── Build SkillState from sessions ──────────────────────────────────────────

export function buildSkillState(skillId: SkillId, sessions: PracticeSession[]): SkillState {
  const skillSessions = sessions.filter(s => s.skillId === skillId);
  const level = computeSkillLevel(skillSessions);
  const recent10 = skillSessions.slice(-10);
  const accuracy = recent10.length > 0
    ? Math.round(recent10.reduce((s, p) => s + p.accuracy, 0) / recent10.length)
    : 0;

  const lastDate = skillSessions.length > 0
    ? skillSessions[skillSessions.length - 1].timestamp
    : null;

  // Next review based on level
  const reviewIntervals: Record<SkillLevel, number> = {
    untrained: 0, weak: 1, developing: 3, strong: 7, mastered: 21
  };
  const intervalDays = reviewIntervals[level];
  let nextReview: string | null = null;
  if (lastDate && intervalDays > 0) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + intervalDays);
    nextReview = d.toISOString();
  }

  return {
    id: skillId,
    level,
    accuracy,
    strongSessions: skillSessions.filter(s => s.accuracy >= 85).length,
    lastPracticed: lastDate,
    totalAttempts: skillSessions.length,
    nextReview,
  };
}

// ─── All skills state ─────────────────────────────────────────────────────────

export const ALL_SKILL_IDS: SkillId[] = [
  "pulse", "reading", "dictation", "subdivision", "silence",
  "syncopation", "meter", "speed", "memory", "independence",
  "sight_reading", "groove",
];

export function buildAllSkillStates(sessions: PracticeSession[]): SkillState[] {
  return ALL_SKILL_IDS.map(id => buildSkillState(id, sessions));
}

// ─── Weak skills (for smart recommendations) ─────────────────────────────────

export function getWeakSkills(states: SkillState[]): SkillState[] {
  return states
    .filter(s => s.level === "weak" || s.level === "developing")
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function getSkillsDueForReview(states: SkillState[]): SkillState[] {
  const now = new Date();
  return states.filter(s => {
    if (!s.nextReview) return false;
    return new Date(s.nextReview) <= now;
  });
}

// ─── Progress toward mastery ──────────────────────────────────────────────────

export type MasteryProgress = {
  current: SkillLevel;
  next: SkillLevel | null;
  sessionsToNextLevel: number;
  percentToNext: number;
};

export function getMasteryProgress(state: SkillState, sessions: PracticeSession[]): MasteryProgress {
  const skillSessions = sessions.filter(s => s.skillId === state.id);
  const levelOrder: SkillLevel[] = ["untrained", "weak", "developing", "strong", "mastered"];
  const currentIdx = levelOrder.indexOf(state.level);
  const nextLevel = currentIdx < levelOrder.length - 1 ? levelOrder[currentIdx + 1] : null;

  if (!nextLevel) return { current: state.level, next: null, sessionsToNextLevel: 0, percentToNext: 100 };

  const criteria = DOMAIN_CRITERIA[nextLevel];
  const passingSessions = skillSessions.filter(s => s.accuracy >= criteria.minAccuracy).length;
  const needed = criteria.passingSessions;
  const sessionsToNext = Math.max(0, needed - passingSessions);
  const pct = Math.min(100, Math.round((passingSessions / Math.max(1, needed)) * 100));

  return {
    current: state.level,
    next: nextLevel,
    sessionsToNextLevel: sessionsToNext,
    percentToNext: pct,
  };
}

// ─── Human-readable labels ────────────────────────────────────────────────────

export const SKILL_LABELS: Record<SkillId, { name: string; emoji: string; description: string }> = {
  pulse:        { name: "Pulso",              emoji: "🥁", description: "Estabilidad temporal interna" },
  reading:      { name: "Lectura",            emoji: "🎼", description: "Decodificar partituras rítmicas" },
  dictation:    { name: "Dictado",            emoji: "👂", description: "Identificar ritmos de oído" },
  subdivision:  { name: "Subdivisión",        emoji: "✂️",  description: "Dividir el pulso con precisión" },
  silence:      { name: "Silencios",          emoji: "🤫", description: "Contar sin tocar" },
  syncopation:  { name: "Síncopa",            emoji: "⚡", description: "Acentos desplazados y contratiempos" },
  meter:        { name: "Compás",             emoji: "📐", description: "Sensación métrica por compás" },
  speed:        { name: "Velocidad",          emoji: "🚀", description: "Precisión a tempos altos" },
  memory:       { name: "Memoria",            emoji: "🧠", description: "Retener y reproducir patrones" },
  independence: { name: "Independencia",      emoji: "🤲", description: "Coordinación bimanual" },
  sight_reading:{ name: "Lectura a 1ª vista", emoji: "👁️",  description: "Leer sin preparación" },
  groove:       { name: "Groove",             emoji: "🎸", description: "Sensación rítmica aplicada" },
};

export const LEVEL_LABELS: Record<SkillLevel, { label: string; color: string; bg: string }> = {
  untrained:  { label: "Sin entrenar", color: "text-zinc-400", bg: "bg-zinc-100" },
  weak:       { label: "Débil",        color: "text-red-600",  bg: "bg-red-50" },
  developing: { label: "En progreso",  color: "text-yellow-700", bg: "bg-yellow-50" },
  strong:     { label: "Fuerte",       color: "text-brand-700", bg: "bg-brand-50" },
  mastered:   { label: "Dominada",     color: "text-purple-700", bg: "bg-purple-50" },
};

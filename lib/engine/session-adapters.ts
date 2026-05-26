/**
 * Adaptadores para alimentar el motor nuevo sin romper el progreso viejo.
 */

import type { SkillId } from "./types";
import type { PracticeSession } from "./skill-system";

type LessonProgressLike = {
  module_slug: string;
  lesson_slug: string;
  score: number;
  completed_at: string | null;
};

const SLUG_SKILL_HINTS: Array<[string, SkillId]> = [
  ["pulso", "pulse"],
  ["negra", "pulse"],
  ["silencio", "silence"],
  ["corchea", "subdivision"],
  ["dictado", "dictation"],
  ["tresillo", "subdivision"],
  ["semicorchea", "subdivision"],
  ["sincopa", "syncopation"],
  ["síncopa", "syncopation"],
  ["compas", "meter"],
  ["compás", "meter"],
  ["memoria", "memory"],
  ["call-response", "memory"],
  ["lectura", "reading"],
];

export function inferSkillFromLessonSlug(slug: string): SkillId {
  const normalized = slug.toLowerCase();
  return SLUG_SKILL_HINTS.find(([hint]) => normalized.includes(hint))?.[1] ?? "reading";
}

export function progressToPracticeSessions(progress: LessonProgressLike[]): PracticeSession[] {
  return progress.flatMap(p => {
    if (!p.completed_at) return [];
    return [{
      skillId: inferSkillFromLessonSlug(p.lesson_slug),
      accuracy: p.score,
      bpm: 80,
      timestamp: p.completed_at,
      exerciseType: "lesson",
    }];
  });
}

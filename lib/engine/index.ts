/**
 * lib/engine/index.ts — Public API of the scalable content engine
 *
 * Import everything from here. Internals stay encapsulated.
 */

export type {
  Figure, TimeSignature, SkillId, SkillLevel, SkillState,
  BeatSlot, RhythmPattern, GenerativeExercise, GenerativeExerciseType,
  DomainCriteria, WorldDef, WorldId, ChallengeDef, ChallengeType,
  FreePracticeConfig,
} from "./types";

export { DOMAIN_CRITERIA } from "./types";

export {
  FIGURE_BEATS, FIGURE_SYLLABLE,
  FIGURES_BY_DIFFICULTY,
  generateBar, figuresToSlots, slotsToHits, slotsToAbc,
  generatePattern, generateDistractors, patternToHits,
} from "./pattern-generator";

export {
  WORLDS, WORLD_ORDER, getWorld, getNextWorld,
} from "./worlds";

export type { PracticeSession, MasteryProgress } from "./skill-system";
export {
  buildSkillState, buildAllSkillStates, computeSkillLevel,
  getWeakSkills, getSkillsDueForReview, getMasteryProgress,
  ALL_SKILL_IDS, SKILL_LABELS, LEVEL_LABELS,
} from "./skill-system";

export type { ChallengeProgress } from "./challenge-engine";
export {
  generateDailyChallenges, generateWeeklyChallenge, evaluateChallengeProgress,
} from "./challenge-engine";

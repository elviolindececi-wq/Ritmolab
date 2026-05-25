"use client";

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export type ProfileStats = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: "student" | "admin";
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  referral_code: string | null;
  last_seen_at?: string | null;
};

export type LessonProgressRow = {
  module_slug: string;
  lesson_slug: string;
  status: "started" | "completed";
  score: number;
  xp_awarded: number;
  completed_at: string | null;
};

export type CompletionAttempt = {
  exercise_key: string;
  exercise_type: string;
  answer: unknown;
  is_correct: boolean;
  score: number;
  xp: number;
  accuracy?: number | null;
  time_ms?: number | null;
};

export type CompletionReward = {
  awarded_xp: number;
  total_xp: number;
  previous_level: number;
  new_level: number;
  level_name: string;
  next_level_name: string | null;
  xp_to_next: number;
  level_progress: number;
  current_streak: number;
  already_completed: boolean;
  leveled_up: boolean;
};

export async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
  window.location.href = "/";
}

export async function markUserActivity(source = "app_open") {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.rpc("mark_user_activity", { p_source: source });
  if (error) return null;
  return data;
}

export async function loadMyStats() {
  if (!isSupabaseConfigured || !supabase) return { user: null, profile: null, progress: [], badges: [] };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { user: null, profile: null, progress: [], badges: [] };
  await markUserActivity("dashboard_open");

  const [{ data: profile }, { data: progress }, { data: userBadges }] = await Promise.all([
    supabase.from("profiles").select("id,email,display_name,role,xp,level,current_streak,longest_streak,referral_code,last_seen_at").eq("id", user.id).maybeSingle(),
    supabase.from("app_lesson_progress").select("module_slug,lesson_slug,status,score,xp_awarded,completed_at").eq("profile_id", user.id),
    supabase.from("user_badges").select("badges(key,name,description,icon)").eq("profile_id", user.id)
  ]);

  return {
    user,
    profile: profile as ProfileStats | null,
    progress: (progress ?? []) as LessonProgressRow[],
    badges: userBadges ?? []
  };
}

export async function completeLesson(input: {
  moduleSlug: string;
  lessonSlug: string;
  score: number;
  xp: number;
  attempts: CompletionAttempt[];
}) {
  if (!isSupabaseConfigured || !supabase) throw new Error("Supabase no está configurado.");
  const { data, error } = await supabase.rpc("complete_lesson", {
    p_module_slug: input.moduleSlug,
    p_lesson_slug: input.lessonSlug,
    p_score: input.score,
    p_xp: input.xp,
    p_attempts: input.attempts
  });
  if (error) throw error;
  return data as CompletionReward;
}

export async function activateDemoPremium() {
  if (!isSupabaseConfigured || !supabase) throw new Error("Supabase no está configurado.");
  const { data, error } = await supabase.rpc("activate_demo_premium");
  if (error) throw error;
  return data;
}

export async function createReferralClick(code: string) {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.rpc("register_referral_click", { p_referral_code: code });
}

export async function createChallenge(title: string, type = "rhythm_quiz") {
  if (!isSupabaseConfigured || !supabase) throw new Error("Supabase no está configurado.");
  const user = await getCurrentUser();
  if (!user) throw new Error("Tenés que iniciar sesión para crear desafíos.");
  const { data, error } = await supabase.from("challenges").insert({ creator_id: user.id, title, type, target_score: 80 }).select("id").single();
  if (error) throw error;
  return data;
}

export async function loadLeaderboard() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.rpc("get_leaderboard");
  if (error) return [];
  return data ?? [];
}

export async function hasPremiumAccess() {
  // El producto queda liberado durante la etapa de prueba.
  return true;
}

// ─── Daily missions ───────────────────────────────────────────────────────────

export type DailyMission = {
  key: "complete_lesson" | "dictation" | "metronome";
  completed: boolean;
  xp_bonus: number;
};

export async function getDailyMissions(): Promise<DailyMission[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.rpc("get_or_create_daily_missions");
  if (error) return [];
  return (data as DailyMission[]) ?? [];
}

export async function completeMission(key: string): Promise<{ ok: boolean; xp_awarded: number; all_complete: boolean }> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, xp_awarded: 0, all_complete: false };
  const { data, error } = await supabase.rpc("complete_mission", { p_mission_key: key });
  if (error) return { ok: false, xp_awarded: 0, all_complete: false };
  return data as { ok: boolean; xp_awarded: number; all_complete: boolean };
}

// ─── Spaced review ────────────────────────────────────────────────────────────

export type ReviewLesson = {
  module_slug: string;
  lesson_slug: string;
  score: number;
  days_since: number;
};

export async function getLessonsToReview(): Promise<ReviewLesson[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.rpc("get_lessons_to_review");
  if (error) return [];
  return (data as ReviewLesson[]) ?? [];
}

export async function markLessonReviewed(moduleSlug: string, lessonSlug: string, score: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.rpc("mark_lesson_reviewed", {
    p_module_slug: moduleSlug,
    p_lesson_slug: lessonSlug,
    p_score: score,
  });
}

// ─── Streak freeze ────────────────────────────────────────────────────────────

export async function useStreakFreeze(): Promise<{ ok: boolean; reason?: string }> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, reason: "not_configured" };
  const { data, error } = await supabase.rpc("use_streak_freeze");
  if (error) return { ok: false, reason: error.message };
  return data as { ok: boolean; reason?: string };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function trackEvent(name: string, props: Record<string, unknown> = {}, session?: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.rpc("track_event", { p_event: name, p_props: props, p_session: session ?? null });
  } catch { /* analytics should never break the app */ }
}

// ─── Skill scores ─────────────────────────────────────────────────────────────

export type SkillScores = {
  pulse: number;
  reading: number;
  subdivision: number;
  independence: number;
  memory: number;
};

export async function getSkillScores(): Promise<SkillScores> {
  if (!isSupabaseConfigured || !supabase) return { pulse: 0, reading: 0, subdivision: 0, independence: 0, memory: 0 };
  const { data, error } = await supabase.rpc("get_skill_scores");
  if (error) return { pulse: 0, reading: 0, subdivision: 0, independence: 0, memory: 0 };
  return data as SkillScores;
}

// ─── Weekly leaderboard ───────────────────────────────────────────────────────

export type WeeklyEntry = { display_name: string; xp_week: number; lessons_week: number };

export async function getWeeklyLeaderboard(): Promise<WeeklyEntry[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.rpc("get_weekly_leaderboard");
  if (error) return [];
  return (data as WeeklyEntry[]) ?? [];
}

// ─── Weekly challenge ─────────────────────────────────────────────────────────

export type WeeklyChallenge = {
  challenge: { id: string; pattern_slug: string; pattern_label: string; bpm: number; target_score: number };
  user_attempt: { score: number; error_ms: number } | null;
  week_start: string;
};

export async function getWeeklyChallenge(): Promise<WeeklyChallenge | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.rpc("get_current_weekly_challenge");
  if (error) return null;
  return data as WeeklyChallenge;
}

export async function submitWeeklyChallengeAttempt(challengeId: string, score: number, errorMs: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from("weekly_challenge_attempts").upsert({
    profile_id: (await supabase.auth.getUser()).data.user?.id,
    challenge_id: challengeId,
    score,
    error_ms: errorMs,
  }, { onConflict: "profile_id,challenge_id" });
}

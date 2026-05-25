/**
 * Analytics hook — tracks events silently without ever breaking the app.
 * Usage: const { track } = useAnalytics();  track("lesson_started", { lesson_slug })
 */
"use client";

import { useCallback, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/progress";

// Session ID — regenerated each page load
function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  if (!window.__ritmolab_session) {
    window.__ritmolab_session = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return window.__ritmolab_session;
}

declare global {
  interface Window { __ritmolab_session?: string; }
}

export function useAnalytics() {
  const sessionId = useRef<string>("");
  useEffect(() => { sessionId.current = getSessionId(); }, []);

  const track = useCallback((event: string, props: Record<string, unknown> = {}) => {
    trackEvent(event, props, sessionId.current).catch(() => {});
  }, []);

  return { track };
}

// ── Key events ────────────────────────────────────────────────────────────────
// lesson_started        { lesson_slug, module_slug }
// lesson_completed      { lesson_slug, module_slug, score, xp, time_ms }
// lesson_abandoned      { lesson_slug, module_slug, step }
// exercise_result       { type, is_correct, score, error_ms? }
// dictation_result      { selected, correct, is_correct }
// metronome_result      { bpm, beats, avg_error_ms, score }
// onboarding_completed  { diagnosed_level, skipped }
// daily_mission_done    { mission_key }
// call_response_result  { taps, expected, score }
// weekly_challenge      { score, error_ms }
// page_view             { path }

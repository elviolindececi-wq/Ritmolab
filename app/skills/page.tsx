"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  buildAllSkillStates, getMasteryProgress, getWeakSkills, getSkillsDueForReview,
  SKILL_LABELS, LEVEL_LABELS, ALL_SKILL_IDS,
  type SkillState, type PracticeSession,
} from "@/lib/engine";
import { loadFreePracticeSessions, loadMyStats } from "@/lib/progress";

// Compatibilidad: las lecciones existentes siguen aportando señal histórica.
// Las sesiones reales de práctica libre llegan desde analytics_events vía Supabase.
function progressToSessions(progress: { module_slug: string; lesson_slug: string; score: number; completed_at: string | null }[]): PracticeSession[] {
  const skillMap: Record<string, typeof ALL_SKILL_IDS[number]> = {
    "pulso": "pulse", "negra": "pulse", "silencios": "silence",
    "corcheas": "subdivision", "dictado": "dictation", "tresillo": "subdivision",
    "semicorcheas": "subdivision", "sincopa": "syncopation", "memoria": "memory",
  };
  return progress.flatMap(p => {
    const skill = skillMap[p.lesson_slug.split("-")[0]] ?? "reading";
    return [{
      skillId: skill,
      accuracy: p.score,
      bpm: 80,
      timestamp: p.completed_at ?? new Date().toISOString(),
      exerciseType: "lesson",
    }] as PracticeSession[];
  });
}

function SkillCard({ state, sessions }: { state: SkillState; sessions: PracticeSession[] }) {
  const meta = SKILL_LABELS[state.id];
  const levelMeta = LEVEL_LABELS[state.level];
  const mastery = getMasteryProgress(state, sessions);

  return (
    <div className={`rounded-3xl border p-5 ${levelMeta.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl">{meta.emoji}</span>
          <h3 className="font-black mt-1">{meta.name}</h3>
          <p className="text-xs text-zinc-500">{meta.description}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${levelMeta.bg} ${levelMeta.color} border border-current/20`}>
          {levelMeta.label}
        </span>
      </div>
      <div className="mb-1 flex justify-between text-xs font-bold text-zinc-500">
        <span>Precisión reciente</span>
        <span>{state.accuracy}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/70">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${state.accuracy}%` }} />
      </div>
      {mastery.next && (
        <p className="mt-2 text-xs font-bold text-zinc-500">
          {mastery.sessionsToNextLevel === 0
            ? `Listo para ${mastery.next}`
            : `${mastery.sessionsToNextLevel} sesiones para "${mastery.next}"`}
        </p>
      )}
      {state.level === "mastered" && (
        <p className="mt-2 text-xs font-black text-purple-700">✨ Dominada</p>
      )}
    </div>
  );
}

export default function SkillsPage() {
  const [states, setStates] = useState<SkillState[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadMyStats(), loadFreePracticeSessions()]).then(([d, freeSessions]) => {
      const lessonSessions = progressToSessions(d.progress ?? []);
      const sess = [...lessonSessions, ...freeSessions]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setSessions(sess);
      setStates(buildAllSkillStates(sess));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const weak = getWeakSkills(states);
  const dueReview = getSkillsDueForReview(states);
  const mastered = states.filter(s => s.level === "mastered");

  return (
    <div className="container-page py-10">
      <p className="pill">Sistema de habilidades</p>
      <h1 className="mt-4 text-5xl font-black">Mapa de habilidades</h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-600">
        Completar lecciones suma XP. Dominar habilidades requiere precisión consistente en múltiples sesiones. Ahora combina lecciones existentes con práctica libre real guardada en Supabase.
      </p>

      {!loading && (
        <>
          {/* Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Habilidades entrenadas", value: states.filter(s => s.level !== "untrained").length, color: "text-brand-700" },
              { label: "En progreso", value: states.filter(s => s.level === "developing").length, color: "text-yellow-700" },
              { label: "Fuertes", value: states.filter(s => s.level === "strong").length, color: "text-brand-600" },
              { label: "Dominadas", value: mastered.length, color: "text-purple-700" },
            ].map(s => (
              <div key={s.label} className="card py-4 text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs font-bold text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Review alerts */}
          {dueReview.length > 0 && (
            <div className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
              <p className="font-black text-yellow-800 mb-2">⏰ {dueReview.length} habilidad{dueReview.length > 1 ? "es" : ""} para repasar hoy</p>
              <div className="flex flex-wrap gap-2">
                {dueReview.map(s => (
                  <Link key={s.id} href={`/free-practice?skill=${s.id}`} className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-black text-yellow-900 hover:bg-yellow-300 transition">
                    {SKILL_LABELS[s.id].emoji} {SKILL_LABELS[s.id].name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Weak skills CTA */}
          {weak.length > 0 && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="font-black text-red-800 mb-2">💪 Habilidades débiles — pracicalas hoy</p>
              <div className="flex flex-wrap gap-2">
                {weak.slice(0, 4).map(s => (
                  <Link key={s.id} href={`/free-practice?skill=${s.id}`}
                    className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-800 hover:bg-red-200 transition">
                    {SKILL_LABELS[s.id].emoji} {SKILL_LABELS[s.id].name} — {s.accuracy}%
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All skills grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {states.map(s => <SkillCard key={s.id} state={s} sessions={sessions} />)}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/free-practice" className="btn-primary">
              Practicar modo libre <ArrowRight className="ml-2" size={18} />
            </Link>
            <Link href="/learn" className="btn-secondary">
              Ver lecciones
            </Link>
          </div>
        </>
      )}

      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SKILL_IDS.map(id => <div key={id} className="skeleton h-44 rounded-3xl" />)}
        </div>
      )}
    </div>
  );
}

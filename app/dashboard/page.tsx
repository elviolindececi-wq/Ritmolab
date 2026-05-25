"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Flame, LogOut, RotateCcw, Share2, Shield, Trophy } from "lucide-react";
import { XpCard } from "@/components/xp-card";
import { ModuleCard } from "@/components/module-card";
import { Mascot } from "@/components/mascot";
import { OnboardingModal } from "@/components/onboarding-modal";
import { badges, modules } from "@/lib/content";
import { getLevelInfo } from "@/lib/gamification";
import {
  completeMission, getDailyMissions, getLessonsToReview, loadMyStats, signOut, useStreakFreeze,
  type DailyMission, type LessonProgressRow, type ProfileStats, type ReviewLesson,
} from "@/lib/progress";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <div className="skeleton h-6 w-2/3 rounded-xl" />
      <div className="skeleton h-4 w-full rounded-xl" />
      <div className="skeleton h-4 w-3/4 rounded-xl" />
      <div className="skeleton h-10 w-full rounded-2xl" />
    </div>
  );
}

// ─── Hero CTA ────────────────────────────────────────────────────────────────

function HeroCTA({ lesson }: { lesson: { moduleSlug: string; title: string; xp: number; minutes: number } | null }) {
  if (!lesson) return (
    <div className="card bg-gradient-to-br from-brand-500 to-brand-600 text-white">
      <div className="flex items-center gap-3 mb-3"><Trophy size={26} className="text-yellow-300" /><p className="text-sm font-black uppercase opacity-80">¡Todo completado!</p></div>
      <h2 className="text-3xl font-black">Todos los módulos terminados</h2>
      <p className="mt-2 opacity-90">Volvé a practicar para mantener el pulso afilado.</p>
      <Link href="/learn" className="mt-5 inline-flex items-center rounded-2xl bg-white px-6 py-3 font-black text-brand-700 hover:bg-brand-50 transition">
        Ver todos los módulos <ArrowRight className="ml-2" size={18} />
      </Link>
    </div>
  );
  return (
    <div className="card bg-gradient-to-br from-brand-500 to-brand-600 text-white">
      <p className="text-sm font-black uppercase opacity-75 tracking-wide">Próxima lección</p>
      <h2 className="mt-1 text-3xl font-black leading-tight md:text-4xl">{lesson.title}</h2>
      <p className="mt-2 text-base opacity-85">{lesson.minutes} min · +{lesson.xp} XP</p>
      <Link href={`/modules/${lesson.moduleSlug}`}
        className="mt-5 inline-flex items-center rounded-2xl bg-white px-6 py-3 font-black text-brand-700 shadow-lg hover:bg-brand-50 active:scale-95 transition">
        Continuar <ArrowRight className="ml-2" size={18} />
      </Link>
    </div>
  );
}

// ─── Daily missions (real tracking) ──────────────────────────────────────────

const MISSION_META: Record<string, { label: string; xp: number; icon: string; route: string }> = {
  complete_lesson: { label: "Completar 1 lección",  xp: 20, icon: "📖", route: "/learn" },
  dictation:       { label: "Hacer un dictado",      xp: 10, icon: "👂", route: "/practice" },
  metronome:       { label: "Entrenar metrónomo",     xp: 10, icon: "⏱️", route: "/metronome" },
};

function DailyMissions({ missions, onComplete }: { missions: DailyMission[]; onComplete: (key: string) => void }) {
  const done = missions.filter(m => m.completed).length;
  const allDone = done === 3;
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Flame className="text-orange-500" size={20} /><h3 className="text-lg font-black">Misiones de hoy</h3></div>
        <span className={`text-sm font-black ${allDone ? "text-brand-700" : "text-zinc-400"}`}>{done}/3</span>
      </div>
      <div className="space-y-2">
        {missions.map((m) => {
          const meta = MISSION_META[m.key];
          if (!meta) return null;
          return (
            <div key={m.key} className={`flex items-center justify-between rounded-2xl px-4 py-3 transition ${m.completed ? "bg-brand-100" : "bg-zinc-50"}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs transition ${m.completed ? "bg-brand-500 border-brand-500 text-white" : "border-zinc-300"}`}>
                  {m.completed ? "✓" : ""}
                </div>
                <span className={`text-sm font-bold truncate ${m.completed ? "text-brand-800 line-through opacity-70" : "text-zinc-700"}`}>
                  {meta.icon} {meta.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className={`text-xs font-black ${m.completed ? "text-brand-600" : "text-zinc-400"}`}>+{meta.xp}</span>
                {!m.completed && (
                  <Link href={meta.route} onClick={() => onComplete(m.key)}
                    className="rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-black text-white hover:bg-brand-600 transition">
                    Ir →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-yellow-50 px-4 py-3">
          <span className="text-xl">🎉</span>
          <p className="text-sm font-black text-yellow-800">¡Misiones completas! Bonus +15 XP</p>
        </div>
      )}
      {!allDone && done > 0 && (
        <p className="mt-3 text-xs font-bold text-zinc-500 text-center">Completá las 3 para ganar +15 XP extra</p>
      )}
    </div>
  );
}

// ─── Spaced review ────────────────────────────────────────────────────────────

function ReviewSection({ reviews }: { reviews: ReviewLesson[] }) {
  if (reviews.length === 0) return null;
  const allLessons = modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleSlug: m.slug })));
  return (
    <div className="card border-l-4 border-l-yellow-400">
      <div className="flex items-center gap-2 mb-3">
        <RotateCcw className="text-yellow-600" size={18} />
        <h3 className="font-black text-zinc-900">Para repasar hoy</h3>
      </div>
      <p className="text-xs font-bold text-zinc-500 mb-3">Lecciones completadas hace {reviews[0].days_since}+ días. Un repaso rápido consolida el aprendizaje.</p>
      <div className="space-y-2">
        {reviews.map((r) => {
          const lesson = allLessons.find(l => l.slug === r.lesson_slug);
          if (!lesson) return null;
          return (
            <Link key={r.lesson_slug} href={`/modules/${r.module_slug}`}
              className="flex items-center justify-between rounded-2xl bg-yellow-50 px-4 py-3 hover:bg-yellow-100 transition">
              <div>
                <p className="text-sm font-black text-zinc-800">{lesson.title}</p>
                <p className="text-xs font-bold text-zinc-500">Score anterior: {r.score}% · hace {r.days_since} días</p>
              </div>
              <span className="text-xs font-black text-yellow-700 bg-yellow-200 rounded-full px-2 py-1">Repasar →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Streak widget with freeze ────────────────────────────────────────────────

function StreakWidget({ streak }: { streak: number }) {
  const [freezeUsed, setFreezeUsed] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleFreeze() {
    const result = await useStreakFreeze();
    if (result.ok) { setFreezeUsed(true); setMsg("Comodín usado — tu racha está protegida por hoy."); }
    else if (result.reason === "already_used_this_week") setMsg("Ya usaste el comodín esta semana.");
    else setMsg("No se pudo usar el comodín.");
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-2xl font-black">{streak} días</p>
            <p className="text-xs font-bold text-zinc-500">racha actual</p>
          </div>
        </div>
        {streak > 0 && !freezeUsed && (
          <button onClick={handleFreeze}
            className="flex items-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 hover:bg-blue-100 transition"
            title="Protege tu racha si no podés entrenar mañana">
            <Shield size={14} /> Comodín
          </button>
        )}
      </div>
      {msg && <p className="mt-3 text-xs font-bold text-zinc-600 rounded-xl bg-zinc-50 p-2">{msg}</p>}
      {streak === 0 && <p className="mt-2 text-xs font-bold text-zinc-500">Practicá hoy para empezar una racha.</p>}
      {streak >= 7 && !msg && <p className="mt-2 text-xs font-bold text-brand-700">¡{streak} días seguidos! Usá el comodín si un día no podés entrenar.</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileStats | null>(null);
  const [progress, setProgress] = useState<LessonProgressRow[]>([]);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [reviews, setReviews] = useState<ReviewLesson[]>([]);

  const completed = useMemo(
    () => new Set(progress.filter(p => p.status === "completed").map(p => `${p.module_slug}/${p.lesson_slug}`)),
    [progress]
  );

  const nextLesson = useMemo(() => {
    for (const m of modules) {
      for (const l of m.lessons) {
        if (!completed.has(`${m.slug}/${l.slug}`)) {
          return { moduleSlug: m.slug, title: l.title, xp: l.xp, minutes: l.estimatedMinutes };
        }
      }
    }
    return null;
  }, [completed]);

  const nextModule = modules.find(m => m.lessons.some(l => !completed.has(`${m.slug}/${l.slug}`))) ?? modules[modules.length - 1];
  const level = getLevelInfo(profile?.xp ?? 0);
  const totalLessons = modules.flatMap(m => m.lessons).length;

  useEffect(() => {
    Promise.all([
      loadMyStats(),
      getDailyMissions(),
      getLessonsToReview(),
    ]).then(([stats, ms, rev]) => {
      setProfile(stats.profile);
      setProgress(stats.progress);
      setMissions(ms);
      setReviews(rev);
      setLoading(false);
    });
  }, []);

  function handleMissionComplete(key: string) {
    completeMission(key);
    setMissions(prev => prev.map(m => m.key === key ? { ...m, completed: true } : m));
  }

  if (loading) return (
    <div className="container-page py-10">
      <OnboardingModal />
      <div className="mb-8"><div className="skeleton h-12 w-1/2 rounded-2xl mb-3" /><div className="skeleton h-5 w-1/3 rounded-xl" /></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_.55fr]">
        <div className="space-y-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        <div className="space-y-6"><SkeletonCard /><SkeletonCard /></div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="container-page grid min-h-[70vh] place-items-center py-10">
      <OnboardingModal />
      <div className="card max-w-xl text-center">
        <h1 className="text-4xl font-black">Entrá para guardar tu progreso</h1>
        <p className="mt-3 text-zinc-600">Necesitás una cuenta para XP, racha, badges, desafíos y ranking.</p>
        <Link href="/auth" className="btn-primary mt-6">Entrar o crear cuenta</Link>
      </div>
    </div>
  );

  return (
    <div className="container-page py-10">
      <OnboardingModal />

      {/* Greeting */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black md:text-5xl">Hola, {profile.display_name ?? "ritmista"} 👋</h1>
          <p className="mt-2 text-zinc-600">
            {profile.current_streak > 0
              ? `${profile.current_streak} día${profile.current_streak > 1 ? "s" : ""} seguido${profile.current_streak > 1 ? "s" : ""} 🔥 No lo rompas.`
              : "Empezá una racha hoy — aunque sean 5 minutos."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/referrals" className="btn-secondary"><Share2 className="mr-2" size={16} /> Invitar</Link>
          <button onClick={signOut} className="btn-secondary"><LogOut className="mr-2" size={16} /> Salir</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_.55fr]">

        {/* ── Left ── */}
        <div className="space-y-6">
          <HeroCTA lesson={nextLesson} />
          <ReviewSection reviews={reviews} />
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black">Progreso general</h3>
              <span className="text-sm font-black text-brand-700">{completed.size}/{totalLessons}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-brand-100">
              <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${Math.min(100, Math.round((completed.size / totalLessons) * 100))}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-brand-50 p-3">
                <p className="text-2xl font-black text-brand-700">{completed.size}</p>
                <p className="text-xs font-bold text-zinc-500 mt-0.5">completadas</p>
              </div>
              <div className="rounded-2xl bg-yellow-50 p-3">
                <p className="text-2xl font-black text-yellow-700">{profile.xp}</p>
                <p className="text-xs font-bold text-zinc-500 mt-0.5">XP total</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-3">
                <p className="text-2xl font-black text-orange-700">{profile.current_streak}</p>
                <p className="text-xs font-bold text-zinc-500 mt-0.5">días racha</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="text-brand-700" size={20} />
              <div>
                <p className="text-xs font-black uppercase text-brand-700">Nivel actual</p>
                <h2 className="text-xl font-black">{level.current.badge} {level.current.name}</h2>
              </div>
            </div>
            <p className="text-sm text-zinc-600 mb-3">{level.current.description}</p>
            <div className="flex justify-between text-xs font-black text-zinc-500 mb-1">
              <span>{level.next ? `Próximo: ${level.next.name}` : "Nivel máximo"}</span>
              <span>{level.remaining} XP</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-brand-100">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${level.progress}%` }} />
            </div>
          </div>
          <ModuleCard module={nextModule} completedLessons={nextModule.lessons.filter(l => completed.has(`${nextModule.slug}/${l.slug}`)).length} />
        </div>

        {/* ── Right ── */}
        <div className="space-y-6">
          <DailyMissions missions={missions} onComplete={handleMissionComplete} />
          <StreakWidget streak={profile.current_streak} />
          <XpCard xp={profile.xp} streak={profile.current_streak} />
          <Mascot message="5 minutos bien hechos cambian tu pulso. La práctica perfecta no existe — existe volver mañana." />
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><BadgeCheck className="text-brand-700" size={20} /><h3 className="text-xl font-black">Badges</h3></div>
            <div className="grid grid-cols-3 gap-2">
              {badges.slice(0, 6).map(b => (
                <div key={b.key} className="rounded-2xl border border-brand-100 p-3 text-center">
                  <div className="text-2xl">{b.icon}</div>
                  <p className="mt-1 text-xs font-black text-zinc-700 leading-tight">{b.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Flame, Infinity, RotateCcw, Target, Trophy } from "lucide-react";
import {
  buildAllSkillStates,
  generateTodayTrainingPlan,
  getSkillDecayStatus,
  progressToPracticeSessions,
  SKILL_LABELS,
  type PracticeSession,
  type SkillState,
} from "@/lib/engine";
import { loadFreePracticeSessions, loadMyStats } from "@/lib/progress";

function ChallengeCard({ title, description, xp }: { title: string; description: string; xp: number }) {
  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-zinc-900">{title}</h3>
          <p className="mt-1 text-sm font-bold text-zinc-600">{description}</p>
        </div>
        <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-black text-yellow-700">+{xp} XP</span>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [states, setStates] = useState<SkillState[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadMyStats(), loadFreePracticeSessions()])
      .then(([stats, free]) => {
        const allSessions = [...progressToPracticeSessions(stats.progress ?? []), ...free]
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setSessions(allSessions);
        setStates(buildAllSkillStates(allSessions));
      })
      .catch(() => {
        setSessions([]);
        setStates(buildAllSkillStates([]));
      })
      .finally(() => setLoading(false));
  }, []);

  const plan = useMemo(() => generateTodayTrainingPlan(states), [states]);
  const decay = useMemo(() => states.map(s => ({ state: s, decay: getSkillDecayStatus(s) })), [states]);
  const due = decay.filter(x => x.decay === "due" || x.decay === "stale");
  const fresh = decay.filter(x => x.decay === "fresh");

  return (
    <div className="container-page py-10">
      <section className="overflow-hidden rounded-[2.25rem] border border-brand-100 bg-white shadow-soft">
        <div className="grid gap-6 bg-gradient-to-br from-zinc-950 via-brand-900 to-brand-600 p-6 text-white md:grid-cols-[1.15fr_.85fr] md:p-8">
          <div>
            <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-black backdrop-blur">
              <CalendarDays className="mr-2" size={16} /> Entrenador diario
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">{plan.title}</h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold text-white/85">{plan.subtitle}</p>
            <p className="mt-3 max-w-xl text-sm font-bold text-white/65">{plan.reason}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={plan.ctaHref} className="inline-flex items-center rounded-2xl bg-white px-5 py-3 font-black text-brand-700 shadow-lg transition hover:bg-brand-50">
                Empezar sesión de {plan.minutes} min <ArrowRight className="ml-2" size={18} />
              </Link>
              <Link href={`/worlds/${plan.recommendedWorld}`} className="inline-flex items-center rounded-2xl border border-white/30 bg-white/10 px-5 py-3 font-black text-white backdrop-blur transition hover:bg-white/20">
                Ver mundo recomendado
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            {[
              { icon: Target, label: "Habilidad foco", value: SKILL_LABELS[plan.primarySkill].name },
              { icon: Flame, label: "Intensidad", value: `Dificultad ${plan.difficulty}/10` },
              { icon: RotateCcw, label: "Tempo sugerido", value: `${plan.bpm} BPM` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-3xl bg-white/12 p-5 backdrop-blur">
                <Icon size={22} className="opacity-85" />
                <p className="mt-3 text-2xl font-black">{value}</p>
                <p className="text-sm font-bold text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <main className="space-y-6">
          <section className="card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-brand-700">Bloque recomendado</p>
                <h2 className="text-3xl font-black">Sesión breve, medible e infinita</h2>
              </div>
              <Infinity className="text-brand-700" size={28} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {plan.exerciseTypes.map((type, index) => (
                <div key={type} className="rounded-3xl bg-brand-50 p-4">
                  <p className="text-xs font-black uppercase text-brand-700">Paso {index + 1}</p>
                  <h3 className="mt-1 font-black text-zinc-900">
                    {type === "metronome" && "Precisión con metrónomo"}
                    {type === "dictation" && "Dictado rítmico"}
                    {type === "sight_reading" && "Lectura a primera vista"}
                    {type === "call_response" && "Memoria / respuesta"}
                    {type === "error_detect" && "Detectar errores"}
                    {type === "fill_blank" && "Completar patrón"}
                    {type === "speed_ladder" && "Escalera de BPM"}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-zinc-600">Nuevo patrón, misma habilidad foco.</p>
                </div>
              ))}
            </div>
            <Link href={plan.ctaHref} className="btn-primary mt-5 w-full justify-center">Practicar ahora <ArrowRight className="ml-2" size={18} /></Link>
          </section>

          <section className="card">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-600" size={22} />
              <h2 className="text-2xl font-black">Retos generados</h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {plan.dailyChallenges.map((challenge, i) => (
                <ChallengeCard key={`${challenge.title}-${i}`} title={challenge.title} description={challenge.description} xp={challenge.xpReward} />
              ))}
              <ChallengeCard title={plan.weeklyChallenge.title} description={plan.weeklyChallenge.description} xp={plan.weeklyChallenge.xpReward} />
            </div>
          </section>
        </main>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card">
            <h2 className="text-xl font-black">Estado de mantenimiento</h2>
            <p className="mt-1 text-sm font-bold text-zinc-600">Una habilidad dominada no queda fija para siempre: se mantiene con repasos.</p>
            <div className="mt-4 space-y-2">
              {(due.length > 0 ? due : fresh.slice(0, 5)).map(({ state, decay }) => (
                <Link key={state.id} href={`/free-practice?skill=${state.id}`} className="flex items-center justify-between rounded-2xl bg-zinc-50 p-3 transition hover:bg-brand-50">
                  <span className="font-black text-zinc-800">{SKILL_LABELS[state.id].emoji} {SKILL_LABELS[state.id].name}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-black ${decay === "fresh" ? "bg-brand-100 text-brand-700" : "bg-yellow-100 text-yellow-800"}`}>
                    {decay === "fresh" ? "Fresca" : decay === "stale" ? "Fría" : "Repasar"}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-brand-700" size={22} />
              <h2 className="text-xl font-black">Datos usados</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-brand-50 p-3">
                <p className="text-2xl font-black text-brand-700">{loading ? "…" : sessions.length}</p>
                <p className="text-xs font-bold text-zinc-500">sesiones</p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-3">
                <p className="text-2xl font-black text-purple-700">{states.filter(s => s.level === "mastered").length}</p>
                <p className="text-xs font-bold text-zinc-500">dominadas</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

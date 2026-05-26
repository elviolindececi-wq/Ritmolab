"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Infinity, Lock, Map, Sparkles, Target } from "lucide-react";
import {
  buildAllSkillStates,
  buildWorldProgress,
  generateTodayTrainingPlan,
  progressToPracticeSessions,
  SKILL_LABELS,
  type PracticeSession,
  type SkillState,
  type WorldProgress,
} from "@/lib/engine";
import { loadFreePracticeSessions, loadMyStats } from "@/lib/progress";

function levelCopy(level: WorldProgress["level"]) {
  const map: Record<WorldProgress["level"], { label: string; className: string }> = {
    locked: { label: "Bloqueado", className: "bg-zinc-100 text-zinc-500" },
    "not-started": { label: "Disponible", className: "bg-sky-50 text-skybeat" },
    active: { label: "Activo", className: "bg-yellow-50 text-yellow-700" },
    strong: { label: "Fuerte", className: "bg-brand-50 text-brand-700" },
    mastered: { label: "Dominio", className: "bg-purple-50 text-purple-700" },
  };
  return map[level];
}

function WorldCard({ item }: { item: WorldProgress }) {
  const badge = levelCopy(item.level);
  return (
    <Link
      href={item.locked ? "/skills" : `/worlds/${item.world.id}`}
      className="group card flex h-full flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className={`${item.world.color} relative min-h-28 p-5 text-white`}>
        <div className="absolute right-4 top-4 text-5xl opacity-30">{item.world.emoji}</div>
        <div className="relative flex items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-black ${badge.className}`}>{badge.label}</span>
          {item.locked ? <Lock size={18} /> : <ArrowRight size={18} className="transition group-hover:translate-x-1" />}
        </div>
        <h2 className="relative mt-5 text-2xl font-black leading-tight">{item.world.title}</h2>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-bold text-zinc-600">{item.world.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.world.skills.slice(0, 4).map(skill => (
            <span key={skill} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-black text-brand-700">
              {SKILL_LABELS[skill].emoji} {SKILL_LABELS[skill].name}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-5">
          <div className="mb-1 flex justify-between text-xs font-black text-zinc-500">
            <span>Dominio del mundo</span>
            <span>{item.progressPercent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-brand-100">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${item.progressPercent}%` }} />
          </div>
          <p className="mt-3 text-xs font-bold text-zinc-500">{item.reason}</p>
        </div>
      </div>
    </Link>
  );
}

export default function WorldsPage() {
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

  const worlds = useMemo(() => buildWorldProgress(states), [states]);
  const today = useMemo(() => generateTodayTrainingPlan(states), [states]);
  const mastered = worlds.filter(w => w.level === "mastered").length;
  const active = worlds.filter(w => w.level === "active" || w.level === "strong").length;

  return (
    <div className="container-page py-10">
      <div className="overflow-hidden rounded-[2.25rem] border border-brand-100 bg-white shadow-soft">
        <div className="grid gap-6 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-900 p-6 text-white md:grid-cols-[1.2fr_.8fr] md:p-8">
          <div>
            <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-black backdrop-blur">Ruta viva de RitmoLab</p>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">Mundos que no se terminan.</h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-white/85">
              Las lecciones enseñan. Los mundos entrenan. Cada mundo combina contenido fijo, sesiones generativas, dominio por habilidad y mantenimiento permanente.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/today" className="inline-flex items-center rounded-2xl bg-white px-5 py-3 font-black text-brand-700 shadow-lg transition hover:bg-brand-50">
                Plan de hoy <CalendarCheck className="ml-2" size={18} />
              </Link>
              <Link href="/free-practice" className="inline-flex items-center rounded-2xl border border-white/30 bg-white/10 px-5 py-3 font-black text-white backdrop-blur transition hover:bg-white/20">
                Práctica infinita <Infinity className="ml-2" size={18} />
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {[
              { icon: Map, label: "Mundos", value: worlds.length || 16 },
              { icon: Sparkles, label: "Dominados", value: mastered },
              { icon: Target, label: "Sesiones reales", value: sessions.length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-3xl bg-white/12 p-5 backdrop-blur">
                <Icon size={22} className="opacity-85" />
                <p className="mt-3 text-3xl font-black">{loading ? "…" : value}</p>
                <p className="text-sm font-bold text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="card flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-brand-700">Recomendación inteligente</p>
            <h2 className="mt-1 text-2xl font-black">{today.title}</h2>
            <p className="text-sm font-bold text-zinc-600">{today.subtitle}</p>
          </div>
          <Link href={today.ctaHref} className="btn-primary">Entrenar ahora <ArrowRight className="ml-2" size={18} /></Link>
        </div>
        <div className="card">
          <p className="text-xs font-black uppercase text-zinc-500">Sistema de por vida</p>
          <p className="mt-2 text-sm font-bold text-zinc-700">
            Aunque completes la ruta, los mundos siguen generando variantes, repasos, BPM nuevos y retos de mantenimiento.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => <div key={i} className="skeleton h-80 rounded-[2rem]" />)
          : worlds.map(item => <WorldCard key={item.world.id} item={item} />)}
      </div>

      <div className="mt-8 rounded-[2rem] border border-dashed border-brand-200 bg-brand-50 p-6 text-center">
        <p className="text-3xl">♾️</p>
        <h3 className="mt-2 text-2xl font-black">Después del Mundo Maestro, no hay final.</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-bold text-zinc-600">
          El objetivo pasa de “terminar contenido” a sostener precisión, velocidad, lectura y groove con sesiones nuevas todos los días.
        </p>
      </div>
    </div>
  );
}

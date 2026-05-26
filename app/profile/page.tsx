"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LogOut, Share2 } from "lucide-react";
import { SkillRadar } from "@/components/skill-radar";
import { getLevelInfo } from "@/lib/gamification";
import { loadMyStats, signOut, type ProfileStats, type LessonProgressRow } from "@/lib/progress";
import { modules } from "@/lib/content";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileStats | null>(null);
  const [progress, setProgress] = useState<LessonProgressRow[]>([]);

  useEffect(() => {
    loadMyStats().then(d => { setProfile(d.profile); setProgress(d.progress); setLoading(false); });
  }, []);

  if (loading) return <div className="container-page py-10"><div className="skeleton h-64 w-full rounded-3xl" /></div>;
  if (!profile) return (
    <div className="container-page grid min-h-[60vh] place-items-center py-10">
      <div className="card max-w-md text-center">
        <h1 className="text-3xl font-black">Perfil no disponible</h1>
        <p className="mt-2 text-zinc-600">Necesitás iniciar sesión para ver tu perfil.</p>
        <Link href="/auth" className="btn-primary mt-4">Entrar</Link>
      </div>
    </div>
  );

  const level = getLevelInfo(profile.xp);
  const completed = new Set(progress.filter(p => p.status === "completed").map(p => `${p.module_slug}/${p.lesson_slug}`));
  const totalLessons = modules.flatMap(m => m.lessons).length;
  const completionPct = Math.round((completed.size / totalLessons) * 100);
  const avgScore = progress.length > 0 ? Math.round(progress.reduce((s, p) => s + (p.score ?? 0), 0) / progress.length) : 0;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="pill">Tu perfil</p>
          <h1 className="mt-3 text-4xl font-black">{profile.display_name ?? "Ritmista"}</h1>
          <p className="text-zinc-600 mt-1">{level.current.badge} {level.current.name}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigator.share?.({ title: `Mi perfil en RitmoLab`, text: `Soy ${level.current.name} con ${profile.xp} XP`, url: location.href })}
            className="btn-secondary"><Share2 className="mr-2" size={16} /> Compartir</button>
          <button onClick={signOut} className="btn-secondary"><LogOut className="mr-2" size={16} /> Salir</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "XP total", value: profile.xp, color: "text-brand-700" },
              { label: "Racha", value: `${profile.current_streak}d`, color: "text-orange-600" },
              { label: "Completadas", value: `${completed.size}/${totalLessons}`, color: "text-blue-700" },
              { label: "Score prom", value: `${avgScore}%`, color: "text-purple-700" },
            ].map(s => (
              <div key={s.label} className="card text-center p-4">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs font-bold text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Level progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black">Nivel {level.current.level} — {level.current.name}</h3>
              <span className="text-xl">{level.current.badge}</span>
            </div>
            <p className="text-sm text-zinc-600 mb-3">{level.current.description}</p>
            <div className="h-3 overflow-hidden rounded-full bg-brand-100">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${level.progress}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold text-zinc-500">
              <span>{level.current.minXp} XP</span>
              <span>{level.next ? `${level.next.name} — ${level.next.minXp} XP` : "Nivel máximo"}</span>
            </div>
          </div>

          {/* Module progress */}
          <div className="card">
            <h3 className="font-black mb-4">Progreso por módulo</h3>
            <div className="space-y-3">
              {modules.map(m => {
                const done = m.lessons.filter(l => completed.has(`${m.slug}/${l.slug}`)).length;
                const pct = Math.round((done / m.lessons.length) * 100);
                return (
                  <div key={m.slug}>
                    <div className="flex justify-between mb-1">
                      <Link href={`/modules/${m.slug}`} className="text-sm font-black text-zinc-800 hover:text-brand-700">{m.title}</Link>
                      <span className="text-xs font-bold text-zinc-500">{done}/{m.lessons.length}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div className={`h-full rounded-full ${pct === 100 ? "bg-brand-500" : "bg-brand-300"} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <SkillRadar />
          <div className="card">
            <h3 className="font-black mb-3">Progreso general</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0">
                <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#58cc02" strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - completionPct / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xl font-black text-brand-700">{completionPct}%</p>
                </div>
              </div>
              <div>
                <p className="font-black text-zinc-900">{completed.size} de {totalLessons} lecciones</p>
                <p className="text-sm text-zinc-600 mt-1">Completaste el {completionPct}% del camino total.</p>
                <Link href="/learn" className="mt-3 inline-flex items-center text-sm font-black text-brand-700 hover:text-brand-900">
                  Continuar aprendiendo <ArrowRight className="ml-1" size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

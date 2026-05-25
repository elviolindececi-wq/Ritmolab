"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Dumbbell, Headphones, Music2, RotateCcw, Timer, Trophy } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { AbcStaff } from "@/components/rhythm/abc-staff";
import { modules, rhythmBank } from "@/lib/content";
import { loadMyStats, type LessonProgressRow } from "@/lib/progress";
import { playRhythmPattern, hitsFromSyllables } from "@/lib/rhythm-engine";

// ─── Quick Dictation (integrated from /rhythm, no separate route needed) ──────

function QuickDictation() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * rhythmBank.length));
  const [selected, setSelected] = useState<number | null>(null);

  const correct = rhythmBank[idx];
  const options = useMemo(() => {
    const pool = rhythmBank.filter((_, i) => i !== idx);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
    const pos = Math.floor(Math.random() * 4);
    return [...shuffled.slice(0, pos), correct, ...shuffled.slice(pos)];
  }, [idx, correct]);
  const correctPos = options.indexOf(correct);
  const ok = selected === correctPos;

  function play() {
    const hits = correct.hits?.length ? correct.hits : hitsFromSyllables(correct.syllables, correct.defaultNote ?? "C4");
    playRhythmPattern(hits, 82, correct.defaultNote ?? "C4");
  }

  function next() {
    setSelected(null);
    setIdx(i => (i + 1) % rhythmBank.length);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-sm font-black uppercase text-brand-700">Dictado rítmico libre</p>
          <h3 className="text-xl font-black mt-0.5">Ritmo #{idx + 1}</h3>
        </div>
        <button onClick={play} className="btn-primary px-4 py-2 text-sm">
          <Headphones className="mr-2" size={16} /> Escuchar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt, i) => (
          <button key={`${opt.label}-${i}`} onClick={() => setSelected(i)}
            disabled={selected !== null}
            className={`rounded-2xl border-2 p-3 text-left transition ${
              selected !== null && i === correctPos ? "border-brand-500 bg-brand-50"
              : selected === i ? "border-red-400 bg-red-50"
              : "border-brand-100 bg-zinc-50 hover:bg-brand-50 disabled:cursor-default"
            }`}>
            <p className="text-xs font-black text-zinc-500 mb-1">Opción {i + 1}</p>
            <AbcStaff abc={opt.abc} />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {opt.syllables.map((s, j) => <span key={j} className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black text-brand-800">{s}</span>)}
            </div>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className={`mt-4 rounded-2xl p-4 font-bold flex items-start justify-between gap-3 ${ok ? "bg-brand-100 text-brand-800" : "bg-red-50 text-red-800"}`}>
          <span>{ok ? `✓ Correcto — era ${correct.label}.` : `Era la opción ${correctPos + 1}: ${correct.label}. Escuchá de nuevo.`}</span>
          <button onClick={next} className="shrink-0 flex items-center gap-1 text-xs font-black underline">
            Siguiente <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Next lesson CTA ──────────────────────────────────────────────────────────

function NextLessonCard({ progress }: { progress: LessonProgressRow[] }) {
  const completed = new Set(progress.filter(p => p.status === "completed").map(p => `${p.module_slug}/${p.lesson_slug}`));
  let next: { moduleSlug: string; title: string; xp: number } | null = null;
  for (const m of modules) {
    for (const l of m.lessons) {
      if (!completed.has(`${m.slug}/${l.slug}`)) { next = { moduleSlug: m.slug, title: l.title, xp: l.xp }; break; }
    }
    if (next) break;
  }
  if (!next) return null;
  return (
    <Link href={`/modules/${next.moduleSlug}`}
      className="card group flex items-center gap-5 transition hover:-translate-y-1 bg-gradient-to-br from-brand-50 to-white">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-brand-500 text-white">
        <Music2 size={28} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black uppercase text-brand-700">Continuar ruta</p>
        <h2 className="text-xl font-black truncate">{next.title}</h2>
        <p className="text-sm text-zinc-600">+{next.xp} XP · teoría + video + ejercicios</p>
      </div>
      <ArrowRight className="shrink-0 transition group-hover:translate-x-1 text-brand-700" size={22} />
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const [progress, setProgress] = useState<LessonProgressRow[]>([]);

  useEffect(() => {
    loadMyStats().then(d => setProgress(d.progress ?? []));
  }, []);

  const activities = [
    { href: "/metronome", color: "bg-brand-500", icon: <Timer size={26} />, label: "Metrónomo humano", sub: "Calentamiento de pulso — 2 min" },
    { href: "/bimanual", color: "bg-green-600", icon: <Dumbbell size={26} />, label: "Coordinación bimanual", sub: "Independencia de manos — 5 min" },
    { href: "/leaderboard", color: "bg-purple-600", icon: <Trophy size={26} />, label: "Ver ranking semanal", sub: "¿Quién entrenó más esta semana?" },
  ];

  return (
    <div className="container-page py-10">
      <p className="pill">Práctica diaria</p>
      <h1 className="mt-4 text-5xl font-black">Entrená 5 minutos</h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-600">La rutina diaria mezcla pulso, dictado y bimanual. Todo suma XP y racha.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.55fr]">
        <div className="space-y-4">
          {/* Next lesson hero */}
          <NextLessonCard progress={progress} />

          {/* Quick dictation — integrated */}
          <QuickDictation />

          {/* Other activities */}
          <div className="grid gap-3">
            {activities.map(a => (
              <Link key={a.href} href={a.href}
                className="card group flex items-center gap-4 transition hover:-translate-y-0.5">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-3xl text-white ${a.color}`}>{a.icon}</span>
                <div>
                  <h3 className="text-lg font-black">{a.label}</h3>
                  <p className="text-sm text-zinc-600">{a.sub}</p>
                </div>
                <ArrowRight className="ml-auto shrink-0 text-zinc-400 transition group-hover:translate-x-1" size={18} />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <Mascot message="5 minutos bien hechos cambian tu pulso. No hace falta una hora." />
          <div className="card bg-zinc-950 text-white">
            <h3 className="text-xl font-black">La regla del día</h3>
            <p className="mt-2 text-white/75 text-sm leading-relaxed">Completá una actividad. Si volvés mañana, tu racha sube. La consistencia diaria vale más que una sesión larga una vez por semana.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

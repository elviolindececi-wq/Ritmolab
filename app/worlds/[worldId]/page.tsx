"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Dumbbell,
  Gauge,
  Infinity,
  Music2,
  Target,
  Volume2,
} from "lucide-react";
import {
  generateWorldSession,
  getWorld,
  labelForExercise,
  patternToHits,
  SKILL_LABELS,
  WORLD_ORDER,
  WORLDS,
  type GenerativeExerciseType,
  type SkillId,
  type WorldId,
} from "@/lib/engine";
import { modules } from "@/lib/content";
import { playRhythmPattern } from "@/lib/rhythm-engine";
import { AbcStaff } from "@/components/rhythm/abc-staff";

function isWorldId(value: string): value is WorldId {
  return value in WORLDS;
}

const allLessons = modules.flatMap(module =>
  module.lessons.map(lesson => ({
    ...lesson,
    moduleSlug: module.slug,
    moduleTitle: module.title,
  }))
);

const instructionByType: Record<GenerativeExerciseType, string> = {
  metronome: "Escuchá la referencia, después tocá el ritmo en el piano manteniendo el pulso estable.",
  dictation: "Escuchá el patrón sin mirar la respuesta y elegí cuál partitura coincide.",
  call_response: "Escuchá primero, retené el ritmo en la memoria y repetilo en el piano.",
  sight_reading: "Leé el patrón en pantalla y tocá las notas en el piano siguiendo el pulso.",
  error_detect: "Compará lo que escuchás con la partitura y detectá qué parte no coincide.",
  fill_blank: "Observá el patrón y completá mentalmente la parte que falta antes de practicar.",
  speed_ladder: "Repetí el patrón subiendo BPM sin perder precisión rítmica ni nota objetivo.",
};

const actionByType: Record<GenerativeExerciseType, string> = {
  metronome: "Practicar pulso con piano",
  dictation: "Practicar dictado",
  call_response: "Practicar respuesta",
  sight_reading: "Practicar lectura con piano",
  error_detect: "Detectar errores",
  fill_blank: "Completar patrón",
  speed_ladder: "Practicar velocidad",
};

function skillForExercise(type: GenerativeExerciseType, fallback: SkillId): SkillId {
  if (type === "dictation") return "dictation";
  if (type === "sight_reading") return "sight_reading";
  if (type === "speed_ladder") return "speed";
  if (type === "call_response") return "memory";
  return fallback;
}

export default function WorldDetailPage() {
  const params = useParams<{ worldId: string }>();
  const worldId = params.worldId;
  const world = isWorldId(worldId) ? getWorld(worldId) : null;

  const session = useMemo(
    () => (world ? generateWorldSession(world.id, new Date().toISOString().slice(0, 10)) : []),
    [world]
  );
  const anchors = world ? allLessons.filter(lesson => world.anchorLessonSlugs.includes(lesson.slug)) : [];
  const index = world ? WORLD_ORDER.indexOf(world.id) : -1;
  const previous = index > 0 ? WORLDS[WORLD_ORDER[index - 1]] : null;
  const next = index >= 0 && index < WORLD_ORDER.length - 1 ? WORLDS[WORLD_ORDER[index + 1]] : null;

  if (!world) {
    return (
      <div className="container-page grid min-h-[70vh] place-items-center py-10">
        <div className="card max-w-lg text-center">
          <p className="text-5xl">🥁</p>
          <h1 className="mt-4 text-3xl font-black">Mundo no encontrado</h1>
          <Link href="/worlds" className="btn-primary mt-6">Volver a mundos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <Link href="/worlds" className="mb-5 inline-flex items-center text-sm font-black text-brand-700 hover:text-brand-900">
        <ArrowLeft className="mr-2" size={16} /> Todos los mundos
      </Link>

      <section className={`${world.color} overflow-hidden rounded-[2.25rem] p-6 text-white shadow-soft md:p-8`}>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-black backdrop-blur">{world.emoji} Mundo {index + 1}</p>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">{world.title.replace(/^Mundo \d+: /, "")}</h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold text-white/85">{world.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/free-practice?skill=${world.primarySkill}&world=${world.id}&bpm=${world.bpmRange.min}&difficulty=${world.difficulty}`} className="inline-flex items-center rounded-2xl bg-white px-5 py-3 font-black text-brand-700 shadow-lg transition hover:bg-brand-50">
                Comenzar práctica de este mundo <ArrowRight className="ml-2" size={18} />
              </Link>
              <Link href="/today" className="inline-flex items-center rounded-2xl border border-white/30 bg-white/10 px-5 py-3 font-black text-white backdrop-blur transition hover:bg-white/20">
                Plan inteligente
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Target, label: "Habilidad foco", value: SKILL_LABELS[world.primarySkill].name },
              { icon: Gauge, label: "BPM", value: `${world.bpmRange.min}–${world.bpmRange.max}` },
              { icon: Music2, label: "Compases", value: world.timeSignatures.join(", ") },
              { icon: Infinity, label: "Sesión", value: `${world.generativeExercisesPerSession} ejercicios` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-3xl bg-white/14 p-5 backdrop-blur">
                <Icon size={20} className="opacity-85" />
                <p className="mt-3 text-lg font-black">{value}</p>
                <p className="text-xs font-bold text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <main className="space-y-6">
          <section className="card">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-brand-700">Plan de entrenamiento de hoy</p>
                <h2 className="mt-1 text-3xl font-black">Escuchá, practicá y tocá</h2>
                <p className="mt-2 max-w-2xl text-sm font-bold text-zinc-600">
                  Cada ejercicio tiene una acción clara. Primero podés escuchar la referencia; después abrís la práctica con piano para tocar ritmo y nota.
                </p>
              </div>
              <span className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-black text-brand-700">
                Dificultad {world.difficulty}/10 · {session.length} ejercicios
              </span>
            </div>

            <div className="mt-5 rounded-3xl border border-brand-100 bg-brand-50/70 p-4">
              <p className="text-sm font-black text-brand-900">Cómo funciona</p>
              <p className="mt-1 text-sm font-bold text-brand-800/80">
                1. Tocá “Escuchar piano + clic”. 2. El clic del metrónomo marca todos los pulsos, incluso en silencios. 3. Abrí “Practicar con piano” y respondé con ritmo + nota.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {session.map((step, i) => {
                const exerciseLabel = labelForExercise(step.exercise.type);
                const practiceSkill = skillForExercise(step.exercise.type, world.primarySkill);
                const href = `/free-practice?skill=${practiceSkill}&type=${step.exercise.type}&world=${world.id}&bpm=${step.exercise.pattern.bpm}&difficulty=${world.difficulty}&timeSig=${encodeURIComponent(step.exercise.pattern.timeSignature)}&bars=${step.exercise.pattern.bars ?? 2}`;

                return (
                  <div key={`${step.exercise.pattern.id}-${i}`} className="rounded-3xl border border-brand-100 bg-zinc-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase text-brand-700">Ejercicio {i + 1} de {session.length}</p>
                        <h3 className="mt-1 text-lg font-black">{exerciseLabel}</h3>
                        <p className="mt-1 text-sm font-bold text-zinc-500">{step.description}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-600">+{step.exercise.xp} XP · pasa con {step.exercise.passScore}%</span>
                    </div>

                    <div className="mt-4 rounded-2xl border border-brand-100 bg-white p-4">
                      <p className="text-xs font-black uppercase text-zinc-500">Qué tenés que hacer</p>
                      <p className="mt-1 text-sm font-black text-zinc-800">{instructionByType[step.exercise.type]}</p>
                    </div>

                    <div className="mt-3 rounded-2xl bg-white p-3">
                      <AbcStaff abc={step.exercise.pattern.abc} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-black text-brand-700">{exerciseLabel}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-zinc-600">{step.exercise.pattern.timeSignature}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-zinc-600">{step.exercise.pattern.bpm} BPM</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-zinc-600">{step.exercise.pattern.bars ?? 1} compases</span>
                        {step.exercise.pattern.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-zinc-600">
                            {SKILL_LABELS[skill].emoji} {SKILL_LABELS[skill].name}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => playRhythmPattern(patternToHits(step.exercise.pattern), step.exercise.pattern.bpm, (step.exercise.pattern.slots.find(slot => slot.note)?.note ?? "C4") as any, { totalBeats: step.exercise.pattern.totalBeats, metronome: true, timeSignature: step.exercise.pattern.timeSignature, countInBars: 1 })}
                          className="inline-flex items-center rounded-2xl border border-brand-200 bg-white px-4 py-2 text-sm font-black text-brand-700 transition hover:bg-brand-50"
                        >
                          <Volume2 className="mr-2" size={16} /> Escuchar piano + clic de metrónomo
                        </button>
                        <Link href={href} className="inline-flex items-center rounded-2xl bg-brand-600 px-4 py-2 text-sm font-black text-white shadow-soft transition hover:bg-brand-700">
                          🎹 {actionByType[step.exercise.type]}
                          <ArrowRight className="ml-2" size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card">
            <div className="flex items-center gap-2">
              <Dumbbell className="text-brand-700" size={20} />
              <h2 className="text-xl font-black">Criterio de dominio</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm font-bold text-zinc-600">
              <p>Precisión mínima: <strong className="text-zinc-900">{world.domainCriteria.minAccuracy}%</strong></p>
              <p>Sesiones exitosas: <strong className="text-zinc-900">{world.domainCriteria.passingSessions}</strong></p>
              <p>Rangos de BPM: <strong className="text-zinc-900">{world.domainCriteria.bpmVariants}</strong></p>
              <p>Repaso posterior: <strong className="text-zinc-900">{world.domainCriteria.reviewAfterDays} días</strong></p>
            </div>
          </section>

          <section className="card">
            <h2 className="text-xl font-black">Habilidades entrenadas</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {world.skills.map(skill => (
                <Link key={skill} href={`/free-practice?skill=${skill}`} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-700 transition hover:bg-brand-100">
                  {SKILL_LABELS[skill].emoji} {SKILL_LABELS[skill].name}
                </Link>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="flex items-center gap-2">
              <BookOpen className="text-brand-700" size={20} />
              <h2 className="text-xl font-black">Lecciones ancla</h2>
            </div>
            {anchors.length > 0 ? (
              <div className="mt-4 space-y-2">
                {anchors.map(lesson => (
                  <Link key={lesson.slug} href={`/modules/${lesson.moduleSlug}`} className="block rounded-2xl bg-zinc-50 p-3 transition hover:bg-brand-50">
                    <p className="font-black text-zinc-800">{lesson.title}</p>
                    <p className="text-xs font-bold text-zinc-500">{lesson.moduleTitle} · {lesson.estimatedMinutes} min</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-bold text-zinc-600">Este mundo es 100% generativo: no necesita lecciones manuales para seguir creciendo.</p>
            )}
          </section>

          <section className="grid grid-cols-2 gap-3">
            {previous && <Link href={`/worlds/${previous.id}`} className="btn-secondary px-3 text-sm">← Mundo anterior</Link>}
            {next && <Link href={`/worlds/${next.id}`} className="btn-primary px-3 text-sm">Siguiente mundo →</Link>}
          </section>
        </aside>
      </div>
    </div>
  );
}

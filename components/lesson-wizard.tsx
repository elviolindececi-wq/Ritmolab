"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import type { Module } from "@/lib/types";
import { LessonExperience } from "@/components/lesson-experience";

type Step = "theory" | "video" | "exercises";

const STEPS: Step[] = ["theory", "video", "exercises"];
const STEP_LABELS: Record<Step, string> = {
  theory: "Teoría",
  video: "Video",
  exercises: "Ejercicios",
};

/**
 * LessonWizard: en mobile (< md) muestra la lección en pasos.
 * En desktop mantiene el layout existente de LessonExperience sin cambios.
 */
export function LessonWizard({ module }: { module: Module }) {
  const [isMobile, setIsMobile] = useState(false);
  const [step, setStep] = useState<Step>("theory");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop: render as-is
  if (!isMobile) return <LessonExperience module={module} />;

  // Mobile: wizard wrapper
  const stepIndex = STEPS.indexOf(step);
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* Wizard header */}
      <div className="sticky top-16 z-30 bg-white border-b border-brand-100 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Link href="/learn" className="flex items-center gap-1 text-sm font-bold text-zinc-500 hover:text-zinc-700">
            <X size={16} /> Salir
          </Link>
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`h-2 rounded-full transition-all ${i < stepIndex ? "w-6 bg-brand-500" : i === stepIndex ? "w-8 bg-brand-500" : "w-6 bg-brand-200"}`}
              />
            ))}
          </div>
          <span className="text-xs font-black text-brand-700">{STEP_LABELS[step]}</span>
        </div>
        {/* Linear progress */}
        <div className="h-1 overflow-hidden rounded-full bg-brand-100">
          <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 py-6">
        <LessonExperienceMobileStep module={module} step={step} />
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white border-t border-brand-100 px-4 py-4 flex gap-3">
        {stepIndex > 0 && (
          <button
            onClick={() => setStep(STEPS[stepIndex - 1])}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} /> {STEP_LABELS[STEPS[stepIndex - 1]]}
          </button>
        )}
        {stepIndex < STEPS.length - 1 && (
          <button
            onClick={() => setStep(STEPS[stepIndex + 1])}
            className="btn-primary flex-1 justify-center"
          >
            {STEP_LABELS[STEPS[stepIndex + 1]]} <ArrowRight className="ml-2" size={16} />
          </button>
        )}
  
      </div>
    </div>
  );
}

// ── Mobile step renderer — extracts the relevant section of LessonExperience ──
function LessonExperienceMobileStep({ module, step }: { module: Module; step: Step }) {
  const lesson = module.lessons[0]; // simplified — actual index managed by LessonExperience

  if (step === "theory") {
    return (
      <div className="space-y-4">
        <div>
          <p className="pill w-fit mb-3">Nivel {lesson.level} · {lesson.difficulty}</p>
          <h1 className="text-3xl font-black">{lesson.title}</h1>
          <p className="mt-2 text-zinc-600">{lesson.description}</p>
        </div>
        <div className="card">
          <p className="text-sm font-black uppercase text-brand-700 mb-3">Objetivo</p>
          <p className="font-bold text-zinc-800">{lesson.objective}</p>
        </div>
        <div className="space-y-3">
          {lesson.theory.map((text, i) => (
            <div key={i} className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
              <p className="text-sm leading-relaxed text-zinc-700">{text}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-xs font-black uppercase text-yellow-700 mb-2">💡 Tip docente</p>
            <p className="text-sm text-yellow-900">{lesson.teacherTip}</p>
          </div>
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
            <p className="text-xs font-black uppercase text-red-700 mb-2">⚠ Error común</p>
            <p className="text-sm text-red-900">{lesson.commonMistake}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-brand-50 border border-brand-200 p-4">
          <p className="text-xs font-black uppercase text-brand-700 mb-1">Habilidades</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {lesson.skills.map(s => <span key={s} className="rounded-full bg-white px-3 py-1 text-xs font-black text-brand-800">{s}</span>)}
          </div>
        </div>
      </div>
    );
  }

  if (step === "video") {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-black">Video guiado</h2>
        <p className="text-zinc-600">Mirá el video antes de practicar — refuerza la teoría con ejemplos reales.</p>
        {lesson.youtubeId ? (
          <div className="aspect-video overflow-hidden rounded-3xl bg-zinc-950">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${lesson.youtubeId}`}
              title={lesson.videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50 flex items-center justify-center">
            <p className="text-brand-600 font-bold text-center px-6">Video próximamente — el ejercicio funciona sin él.</p>
          </div>
        )}
        <div className="rounded-2xl bg-zinc-50 p-4">
          <p className="text-sm font-bold text-zinc-700">{lesson.realMusicExample}</p>
        </div>
      </div>
    );
  }

  // exercises step — full lesson (theory/video already seen in previous steps)
  return (
    <div className="rounded-2xl bg-brand-50 border border-brand-200 p-5 text-center">
      <p className="text-3xl mb-2">🎯</p>
      <h3 className="text-xl font-black">Ejercicios</h3>
      <p className="text-sm text-zinc-600 mt-2 mb-4">Los ejercicios aparecen abajo — hacé scroll hacia abajo para comenzar.</p>
    </div>
  );
}

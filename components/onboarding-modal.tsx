"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Music2, BookOpen, Trophy, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { modules } from "@/lib/content";

const STORAGE_KEY = "ritmolab_onboarding_done";
const LEVEL_KEY = "ritmolab_start_level";

// ─── Diagnóstico de nivel ─────────────────────────────────────────────────────

type DiagQuestion = {
  question: string;
  a: string;
  b: string;
  aLevel: number; // nivel si elige A
  bLevel: number; // nivel si elige B
};

const diagQuestions: DiagQuestion[] = [
  {
    question: "¿Tocás o tocaste algún instrumento?",
    a: "Sí, tengo algo de experiencia",
    b: "No, soy principiante total",
    aLevel: 1,
    bLevel: 0,
  },
  {
    question: "¿Podés leer corcheas en partitura?",
    a: "Sí, leo figuras básicas",
    b: "No, no leo partituras",
    aLevel: 2,
    bLevel: 0,
  },
  {
    question: "¿Sabés qué es un tresillo?",
    a: "Sí, y puedo tocarlo",
    b: "No, no lo conozco",
    aLevel: 2,
    bLevel: 0,
  },
];

function getLevelFromAnswers(answers: ("a" | "b")[]): { level: number; moduleIndex: number; label: string } {
  const score = answers.reduce((sum, ans, i) => sum + (ans === "a" ? diagQuestions[i].aLevel : diagQuestions[i].bLevel), 0);
  if (score >= 5) return { level: 5, moduleIndex: 3, label: "Intermedio" };
  if (score >= 3) return { level: 3, moduleIndex: 2, label: "Básico" };
  return { level: 1, moduleIndex: 0, label: "Inicial" };
}

// ─── Pasos del onboarding ─────────────────────────────────────────────────────

const infoSteps = [
  {
    icon: <Music2 size={32} className="text-brand-600" />,
    title: "Aprendé ritmo como un juego",
    body: "RitmoLab combina teoría musical real, videos, dictado con partitura, metrónomo humano y coordinación bimanual. Sesiones de 5 minutos por día.",
  },
  {
    icon: <BookOpen size={32} className="text-brand-600" />,
    title: "Una ruta pedagógica real",
    body: "Avanzás de negras y pulso hasta polirritmia avanzada. Cada lección tiene objetivo claro, teoría profunda, video guiado y ejercicios evaluados.",
  },
  {
    icon: <Trophy size={32} className="text-brand-600" />,
    title: "XP, rachas y ranking",
    body: "Ganás XP por cada ejercicio completado. Las rachas diarias multiplican tu progreso. El ranking premia a quienes más entrenan.",
  },
];

export function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"info" | "diag" | "result">("info");
  const [infoStep, setInfoStep] = useState(0);
  const [diagStep, setDiagStep] = useState(0);
  const [answers, setAnswers] = useState<("a" | "b")[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  function nextInfo() {
    if (infoStep < infoSteps.length - 1) setInfoStep((s) => s + 1);
    else setPhase("diag");
  }

  function answerDiag(ans: "a" | "b") {
    const next = [...answers, ans];
    setAnswers(next);
    if (diagStep < diagQuestions.length - 1) setDiagStep((s) => s + 1);
    else setPhase("result");
  }

  if (!visible) return null;

  const result = getLevelFromAnswers(answers);
  const recommendedModule = modules[result.moduleIndex] ?? modules[0];

  // ── Pantalla de info ──
  if (phase === "info") {
    const current = infoSteps[infoStep];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 px-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md animate-[pop_.2s_ease-out] rounded-[2rem] border border-brand-100 bg-white p-8 shadow-2xl">
          <button onClick={dismiss} className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-brand-50" aria-label="Cerrar">
            <X size={18} />
          </button>
          <div className="mb-5 flex gap-2">
            {infoSteps.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${i === infoStep ? "w-6 bg-brand-500" : i < infoStep ? "w-2 bg-brand-300" : "w-2 bg-brand-100"}`} />
            ))}
          </div>
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50">{current.icon}</div>
          <h2 className="text-2xl font-black text-zinc-900">{current.title}</h2>
          <p className="mt-3 leading-relaxed text-zinc-600">{current.body}</p>
          <div className="mt-8 flex items-center justify-between">
            <button onClick={dismiss} className="text-sm font-bold text-zinc-400 hover:text-zinc-600">Saltear</button>
            <button onClick={nextInfo} className="btn-primary">
              {infoStep < infoSteps.length - 1 ? "Siguiente" : "Diagnóstico"} <ArrowRight className="ml-2" size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Diagnóstico de nivel ──
  if (phase === "diag") {
    const q = diagQuestions[diagStep];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 px-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md animate-[pop_.2s_ease-out] rounded-[2rem] border border-brand-100 bg-white p-8 shadow-2xl">
          <button onClick={dismiss} className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-brand-50" aria-label="Cerrar">
            <X size={18} />
          </button>
          <p className="text-sm font-black uppercase text-brand-700 mb-1">Diagnóstico · {diagStep + 1}/{diagQuestions.length}</p>
          <div className="mb-5 flex gap-2">
            {diagQuestions.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < diagStep ? "bg-brand-500" : i === diagStep ? "bg-brand-300" : "bg-brand-100"}`} />
            ))}
          </div>
          <h2 className="text-2xl font-black text-zinc-900">{q.question}</h2>
          <div className="mt-6 space-y-3">
            <button onClick={() => answerDiag("a")}
              className="w-full rounded-2xl border-2 border-brand-100 bg-white p-4 text-left font-bold text-zinc-700 transition hover:border-brand-400 hover:bg-brand-50 active:scale-98">
              <ChevronRight className="inline mr-2 text-brand-500" size={16} />{q.a}
            </button>
            <button onClick={() => answerDiag("b")}
              className="w-full rounded-2xl border-2 border-brand-100 bg-white p-4 text-left font-bold text-zinc-700 transition hover:border-brand-400 hover:bg-brand-50 active:scale-98">
              <ChevronRight className="inline mr-2 text-brand-500" size={16} />{q.b}
            </button>
          </div>
          <button onClick={dismiss} className="mt-6 text-sm font-bold text-zinc-400 hover:text-zinc-600">Saltear diagnóstico</button>
        </div>
      </div>
    );
  }

  // ── Resultado del diagnóstico ──
  if (phase === "result") {
    localStorage.setItem(LEVEL_KEY, String(result.moduleIndex));
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 px-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md animate-[pop_.2s_ease-out] rounded-[2rem] border border-brand-100 bg-white p-8 shadow-2xl">
          <div className="text-center">
            <div className="text-5xl mb-4">🥁</div>
            <p className="text-sm font-black uppercase text-brand-700">Tu punto de partida</p>
            <h2 className="mt-2 text-3xl font-black text-zinc-900">Nivel {result.label}</h2>
            <p className="mt-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-black text-sky-800">Ruta sugerida: {recommendedModule.title}</p>
            <p className="mt-3 text-zinc-600 leading-relaxed">
              {result.level === 1 && "Vas a empezar desde el pulso — la base de todo. En 3 semanas vas a leer corcheas sin pensar."}
              {result.level === 3 && "Tenés base. Vas a trabajar corcheas, tresillos y dictado rítmico con un nivel de detalle que probablemente no viste antes."}
              {result.level === 5 && "Nivel intermedio confirmado. Vas directo a síncopa, compases compuestos y coordinación bimanual."}
            </p>
            <div className="mt-6 rounded-2xl bg-brand-50 p-4">
              <p className="text-sm font-bold text-brand-800">No te preocupés — podés avanzar más rápido o ir más lento según como vayas. Todo el contenido está desbloqueado.</p>
            </div>
          </div>
          <Link href={`/modules/${recommendedModule.slug}`} onClick={dismiss} className="btn-primary mt-6 w-full justify-center">
            Empezar en mi nivel <ArrowRight className="ml-2" size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

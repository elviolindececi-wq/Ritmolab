"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Share2, Trophy, RotateCcw, Star } from "lucide-react";
import Link from "next/link";
import type { Module, Lesson } from "@/lib/types";

type Props = {
  lesson: Lesson;
  module: Module;
  score: number;
  xp: number;
  onRetry: () => void;
  onNext: () => void;
  hasNext: boolean;
};

function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <span>{current}</span>;
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 90 ? "text-brand-600" : score >= 75 ? "text-yellow-600" : "text-orange-600";
  const label = score >= 90 ? "¡Excelente!" : score >= 75 ? "Muy bien" : "Buen intento";
  return (
    <div className="flex flex-col items-center">
      <div className={`text-7xl font-black ${color}`}>
        <CountUp target={score} />%
      </div>
      <p className={`mt-2 text-lg font-black ${color}`}>{label}</p>
    </div>
  );
}

export function ResultsScreen({ lesson, module, score, xp, onRetry, onNext, hasNext }: Props) {
  const [showXp, setShowXp] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowXp(true), 600);
    return () => clearTimeout(t);
  }, []);

  function share() {
    navigator.share?.({
      title: `Completé ${lesson.title} en RitmoLab`,
      text: `Score: ${score}% · +${xp} XP. Entrenando ritmo con RitmoLab 🎵`,
      url: location.href,
    });
  }

  const stars = score >= 90 ? 3 : score >= 75 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-900/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-[pop_.25s_ease-out] rounded-[2rem] bg-white p-8 shadow-2xl text-center">

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              size={32}
              className={`transition-all duration-300 ${s <= stars ? "text-yellow-400 fill-yellow-400 scale-110" : "text-zinc-200 fill-zinc-200"}`}
              style={{ transitionDelay: `${s * 150}ms` }}
            />
          ))}
        </div>

        <p className="text-sm font-black uppercase text-brand-700 mb-2">Lección completada</p>
        <h2 className="text-2xl font-black text-zinc-900 mb-6">{lesson.title}</h2>

        <ScoreCircle score={score} />

        {/* XP badge */}
        <div className={`mt-6 inline-flex items-center gap-2 rounded-2xl bg-yellow-50 px-6 py-3 transition-all duration-500 ${showXp ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
          <Trophy className="text-yellow-600" size={20} />
          <span className="text-2xl font-black text-yellow-700">+{xp} XP</span>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-zinc-50 p-3">
            <p className="text-xs font-black uppercase text-zinc-500 mb-1">Score</p>
            <p className="text-xl font-black text-zinc-800">{score}%</p>
          </div>
          <div className="rounded-2xl bg-brand-50 p-3">
            <p className="text-xs font-black uppercase text-brand-700 mb-1">XP ganado</p>
            <p className="text-xl font-black text-brand-800">+{xp}</p>
          </div>
        </div>


        <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-left">
          <p className="text-xs font-black uppercase tracking-wide text-sky-700">Feedback formativo</p>
          <div className="mt-3 grid gap-2 text-sm font-bold text-zinc-700">
            <p><strong className="text-zinc-900">Lo que hiciste bien:</strong> completaste todos los ejercicios y sostuviste la atención hasta el cierre.</p>
            <p><strong className="text-zinc-900">A mejorar:</strong> {score >= 85 ? "subí 5–10 BPM o probá lectura a primera vista." : score >= 70 ? "repetí la lección buscando más precisión antes de subir dificultad." : "repasá el patrón lentamente con metrónomo antes de volver a intentarlo."}</p>
            <p><strong className="text-zinc-900">Próximo paso:</strong> {score >= 75 ? "seguí con la siguiente lección o hacé 5 minutos de práctica libre." : "reintentá ahora para consolidar el error."}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {hasNext && (
            <button onClick={onNext} className="btn-primary w-full justify-center">
              Siguiente lección <ArrowRight className="ml-2" size={18} />
            </button>
          )}
          <div className="flex gap-3">
            <button onClick={onRetry} className="btn-secondary flex-1 justify-center">
              <RotateCcw className="mr-2" size={16} /> Repetir
            </button>
            <button onClick={share} aria-label="Compartir resultado" className="btn-secondary flex-1 justify-center">
              <Share2 className="mr-2" size={16} /> Compartir
            </button>
          </div>
          <Link href="/learn" className="block text-sm font-bold text-zinc-500 hover:text-zinc-700 py-2">
            Volver a los módulos
          </Link>
        </div>
      </div>
    </div>
  );
}

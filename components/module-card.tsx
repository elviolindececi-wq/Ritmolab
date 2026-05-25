import Link from "next/link";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import type { Module } from "@/lib/types";
import { cn } from "@/lib/utils";

const mascotEmoji: Record<string, string> = {
  "Compasito":    "🥁",
  "Duro":         "🎵",
  "Taka":         "🎼",
  "Oído Activo":  "👂",
  "Dimi":         "🎶",
  "Sincopín":     "⚡",
  "Memo":         "🧠",
  "Maestro Pulso":"🏆",
};

export function ModuleCard({ module, completedLessons = 0 }: { module: Module; completedLessons?: number }) {
  const total = Math.max(1, module.lessons.length);
  const percent = Math.round((completedLessons / total) * 100);
  const isComplete = percent === 100;

  return (
    <Link href={`/modules/${module.slug}`}
      className={cn("card group block transition hover:-translate-y-1 hover:shadow-xl", isComplete && "border-brand-300 bg-brand-50/30")}>
      <div className="flex items-start justify-between gap-4">
        <div className={cn("grid h-16 w-16 place-items-center rounded-3xl text-3xl text-white shadow-button relative", module.color)}>
          {mascotEmoji[module.mascot] ?? "🎵"}
          {isComplete && (
            <div className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-500 border-2 border-white">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="pill text-xs"><Star size={12} /> {module.xp} XP</span>
          {isComplete && <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-black text-brand-700">✓ Completo</span>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-700">{module.difficulty}</span>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-700">Nivel {module.level}</span>
      </div>

      <h3 className="mt-4 text-2xl font-black">{module.title}</h3>
      <p className="mt-2 text-sm text-zinc-600">{module.description}</p>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-black text-zinc-600">
          <span>{completedLessons}/{total} lecciones</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-brand-100">
          <div className={cn("h-full rounded-full transition-all duration-700", isComplete ? "bg-brand-500" : "bg-brand-400")} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs font-black text-zinc-400">{module.mascot} te guía</p>
        <span className="flex items-center gap-1.5 text-sm font-black text-brand-700">
          {isComplete ? "Repasar" : "Continuar"}
          <ArrowRight className="transition group-hover:translate-x-1" size={16} />
        </span>
      </div>
    </Link>
  );
}

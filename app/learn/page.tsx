"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ModuleCard } from "@/components/module-card";
import { OnboardingModal } from "@/components/onboarding-modal";
import { modules } from "@/lib/content";
import { loadMyStats, type LessonProgressRow } from "@/lib/progress";

function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-72 rounded-[2rem]" />)}
    </div>
  );
}

export default function LearnPage() {
  const [progress, setProgress] = useState<LessonProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyStats()
      .then(d => setProgress(d.progress ?? []))
      .finally(() => setLoading(false));
  }, []);

  const completed = useMemo(
    () => new Set(progress.filter(p => p.status === "completed").map(p => `${p.module_slug}/${p.lesson_slug}`)),
    [progress]
  );

  const totalLessons = modules.flatMap(m => m.lessons).length;
  const completedCount = completed.size;
  const overallPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="container-page py-10">
      <OnboardingModal />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="pill">Curso guiado · {totalLessons} lecciones base</p>
          <h1 className="mt-4 text-5xl font-black">Curso guiado de ritmo</h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-600">
            Estas lecciones enseñan los fundamentos. Después seguís entrenando con mundos vivos, práctica libre, retos y repasos inteligentes.
          </p>
        </div>
        {completedCount > 0 && (
          <div className="card py-3 px-5 flex items-center gap-4 min-w-[200px]">
            <div>
              <p className="text-xs font-black uppercase text-brand-700">Tu progreso</p>
              <p className="text-2xl font-black">{overallPct}%</p>
            </div>
            <div className="flex-1">
              <div className="h-3 overflow-hidden rounded-full bg-brand-100">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${overallPct}%` }} />
              </div>
              <p className="text-xs font-bold text-zinc-500 mt-1">{completedCount}/{totalLessons} lecciones</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map(m => (
              <ModuleCard
                key={m.slug}
                module={m}
                completedLessons={m.lessons.filter(l => completed.has(`${m.slug}/${l.slug}`)).length}
              />
            ))}
          </div>

          {completedCount === 0 && (
            <div className="mt-10 rounded-3xl bg-brand-50 border border-brand-200 p-8 text-center">
              <p className="text-4xl mb-3">🥁</p>
              <h3 className="text-2xl font-black">Empezá por el Mundo 1</h3>
              <p className="mt-2 text-zinc-600 max-w-md mx-auto">El pulso es la base de todo. 5 minutos por día y en 3 semanas vas a leer corcheas sin pensar.</p>
              <Link href={`/modules/${modules[0].slug}`} className="btn-primary mt-5">
                Empezar ahora <ArrowRight className="ml-2" size={18} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

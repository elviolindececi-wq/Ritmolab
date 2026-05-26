import { getLevelInfo } from "@/lib/gamification";

export function XpCard({ xp = 0, streak = 0 }: { xp?: number; streak?: number }) {
  const level = getLevelInfo(xp);
  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-brand-700">Nivel {level.current.level}</p>
          <h2 className="text-3xl font-black">{level.current.badge} {level.current.name}</h2>
          <p className="mt-1 text-sm font-bold text-zinc-600">{level.next ? `Faltan ${level.remaining} XP para ${level.next.name}` : "Nivel máximo actual"}</p>
        </div>
        <div className="rounded-3xl bg-[#ffd43b] px-5 py-3 text-center font-black">🔥 {streak}<br /><span className="text-xs">días</span></div>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm font-bold text-zinc-600"><span>{xp} XP</span><span>{level.progress}%</span></div>
        <div className="h-5 overflow-hidden rounded-full bg-brand-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${level.progress}%` }} /></div>
      </div>
    </div>
  );
}

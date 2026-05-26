"use client";

import { useEffect, useState } from "react";
import { Flame, Star, Trophy, Zap } from "lucide-react";
import { loadLeaderboard, getWeeklyLeaderboard, getWeeklyChallenge, type WeeklyChallenge } from "@/lib/progress";

type Tab = "total" | "weekly" | "streak";

const MEDALS = ["🥇", "🥈", "🥉"];

function LeaderRow({ rank, name, value, sub, highlight }: { rank: number; name: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-4 rounded-3xl p-4 transition ${highlight ? "bg-brand-500 text-white" : rank <= 3 ? "bg-brand-50" : "bg-zinc-50"}`}>
      <span className="text-2xl w-8 text-center shrink-0">{rank <= 3 ? MEDALS[rank - 1] : `#${rank}`}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-black truncate ${highlight ? "text-white" : "text-zinc-900"}`}>{name}</p>
        {sub && <p className={`text-xs font-bold ${highlight ? "text-white/80" : "text-zinc-500"}`}>{sub}</p>}
      </div>
      <p className={`font-black shrink-0 ${highlight ? "text-white" : "text-brand-700"}`}>{value}</p>
    </div>
  );
}

function WeeklyChallengeCard({ challenge }: { challenge: WeeklyChallenge }) {
  const c = challenge.challenge;
  const attempt = challenge.user_attempt;
  const weekStart = new Date(challenge.week_start);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("es", { day: "numeric", month: "short" });

  return (
    <div className="card border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="text-yellow-500" size={20} />
            <p className="text-sm font-black uppercase text-brand-700">Reto de la semana</p>
          </div>
          <h2 className="text-2xl font-black">{c.pattern_label}</h2>
          <p className="text-sm text-zinc-600 mt-1">{fmt(weekStart)} – {fmt(weekEnd)} · Meta: {c.target_score}%</p>
        </div>
        {attempt ? (
          <div className={`rounded-2xl px-4 py-3 text-center ${attempt.score >= c.target_score ? "bg-brand-100" : "bg-zinc-100"}`}>
            <p className={`text-3xl font-black ${attempt.score >= c.target_score ? "text-brand-700" : "text-zinc-600"}`}>{attempt.score}%</p>
            <p className="text-xs font-bold text-zinc-500">tu resultado</p>
          </div>
        ) : (
          <a href="/metronome" className="btn-primary">Participar →</a>
        )}
      </div>
      {!attempt && (
        <div className="mt-4 rounded-2xl bg-white p-4">
          <p className="text-sm font-bold text-zinc-700">Completá el reto de metrónomo esta semana y aparecé en el ranking semanal. El mejor resultado de la semana gana el badge <strong>Ritmista de la semana 🏅</strong>.</p>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("total");
  const [total, setTotal] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadLeaderboard(),
      getWeeklyLeaderboard(),
      getWeeklyChallenge(),
    ]).then(([t, w, c]) => {
      setTotal(t ?? []);
      setWeekly(w ?? []);
      setChallenge(c);
      setLoading(false);
    });
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "total", label: "XP total", icon: <Trophy size={15} /> },
    { key: "weekly", label: "Esta semana", icon: <Zap size={15} /> },
    { key: "streak", label: "Rachas", icon: <Flame size={15} /> },
  ];

  const rows = tab === "total"
    ? total.map(u => ({ name: u.display_name ?? "Ritmista", value: `${u.xp ?? 0} XP`, sub: `🔥 ${u.current_streak ?? 0} días` }))
    : tab === "weekly"
    ? weekly.map(u => ({ name: u.display_name ?? "Ritmista", value: `${u.xp_week ?? 0} XP`, sub: `${u.lessons_week ?? 0} lecciones esta semana` }))
    : total.slice().sort((a, b) => (b.current_streak ?? 0) - (a.current_streak ?? 0))
            .map(u => ({ name: u.display_name ?? "Ritmista", value: `${u.current_streak ?? 0} días`, sub: `${u.xp ?? 0} XP total` }));

  return (
    <div className="container-page py-10">
      <p className="pill">Comunidad</p>
      <h1 className="mt-4 text-5xl font-black">Ranking</h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-600">El ranking no premia el talento — premia quién entrena más. Consistencia sobre velocidad.</p>

      {challenge && <div className="mt-8"><WeeklyChallengeCard challenge={challenge} /></div>}

      {/* Tabs */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition ${tab === t.key ? "bg-brand-500 text-white" : "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 card">
        {loading && <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>}
        {!loading && rows.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">🥁</p>
            <p className="font-black text-zinc-700">Nadie en el ranking todavía.</p>
            <p className="text-sm text-zinc-500 mt-1">Completá una lección y aparecés acá.</p>
          </div>
        )}
        {!loading && rows.length > 0 && (
          <div className="space-y-2">
            {rows.map((row, i) => (
              <LeaderRow key={i} rank={i + 1} name={row.name} value={row.value} sub={row.sub} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

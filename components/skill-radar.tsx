"use client";

import { useEffect, useState } from "react";
import { getSkillScores, type SkillScores } from "@/lib/progress";

const SKILLS = [
  { key: "pulse",         label: "Pulso",         emoji: "🥁", color: "#58cc02", desc: "Precisión en metrónomo humano" },
  { key: "reading",       label: "Lectura",        emoji: "🎼", color: "#1cb0f6", desc: "Aciertos en dictado rítmico" },
  { key: "subdivision",   label: "Subdivisión",    emoji: "✂️",  color: "#ff9600", desc: "Tresillos y semicorcheas" },
  { key: "independence",  label: "Independencia",  emoji: "🤲", color: "#ce82ff", desc: "Coordinación bimanual" },
  { key: "memory",        label: "Memoria",        emoji: "🧠", color: "#ff4b4b", desc: "Call & Response" },
] as const;

type SkillKey = keyof SkillScores;

function RadarSVG({ scores }: { scores: SkillScores }) {
  const cx = 130; const cy = 130; const r = 100;
  const n = SKILLS.length;
  const angles = SKILLS.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2);
  const pt = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });
  const rings = [20, 40, 60, 80, 100];
  const dataPoints = SKILLS.map((s, i) => {
    const v = (scores[s.key as SkillKey] ?? 0) / 100;
    return pt(angles[i], v * r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 260 260" width="100%" className="max-w-[280px] mx-auto">
      {/* Rings */}
      {rings.map(ring => {
        const pts = angles.map(a => pt(a, ring * r / 100));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
        return <path key={ring} d={path} fill="none" stroke="#e5e7eb" strokeWidth="0.8" />;
      })}
      {/* Axes */}
      {angles.map((a, i) => {
        const end = pt(a, r);
        return <line key={i} x1={cx} y1={cy} x2={end.x.toFixed(1)} y2={end.y.toFixed(1)} stroke="#e5e7eb" strokeWidth="0.8" />;
      })}
      {/* Data area */}
      <path d={dataPath} fill="#58cc02" fillOpacity="0.18" stroke="#58cc02" strokeWidth="2" strokeLinejoin="round" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="5" fill={SKILLS[i].color} stroke="white" strokeWidth="1.5" />
      ))}
      {/* Labels */}
      {SKILLS.map((s, i) => {
        const labelPt = pt(angles[i], r + 22);
        return (
          <text key={i} x={labelPt.x.toFixed(1)} y={labelPt.y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontWeight="700" fill="#374151">
            {s.emoji} {s.label}
          </text>
        );
      })}
      {/* Center */}
      <circle cx={cx} cy={cy} r="3" fill="#9ca3af" />
    </svg>
  );
}

export function SkillRadar() {
  const [scores, setScores] = useState<SkillScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkillScores().then(s => { setScores(s); setLoading(false); });
  }, []);

  const hasData = scores && Object.values(scores).some(v => v > 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black">Mapa de habilidades</h3>
        <span className="text-xs font-bold text-zinc-500">datos reales</span>
      </div>

      {loading && <div className="skeleton h-64 w-full rounded-2xl" />}

      {!loading && !hasData && (
        <div className="rounded-2xl bg-zinc-50 p-6 text-center">
          <p className="text-3xl mb-2">🗺️</p>
          <p className="font-black text-zinc-700">Completá algunas lecciones para ver tu mapa.</p>
          <p className="text-sm text-zinc-500 mt-1">Cada tipo de ejercicio alimenta una habilidad distinta.</p>
        </div>
      )}

      {!loading && hasData && scores && (
        <>
          <RadarSVG scores={scores} />
          <div className="mt-4 grid gap-2">
            {SKILLS.map(s => {
              const val = scores[s.key as SkillKey] ?? 0;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm">{s.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs font-black text-zinc-700">{s.label}</span>
                      <span className="text-xs font-black text-zinc-500">{val}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${val}%`, backgroundColor: s.color }} />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

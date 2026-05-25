"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { rhythmBank } from "@/lib/content";
import { AbcStaff } from "@/components/rhythm/abc-staff";
import { audibleHits, evaluateRhythmTaps, hitsFromSyllables, playNote, playRhythmPattern } from "@/lib/rhythm-engine";

export default function MetronomePage() {
  const [bpm, setBpm] = useState(80);
  const [patternIndex, setPatternIndex] = useState(0);
  const [taps, setTaps] = useState<number[]>([]);
  const pattern = rhythmBank[patternIndex] ?? rhythmBank[0];
  const hits = useMemo(() => pattern.hits?.length ? audibleHits(pattern.hits) : audibleHits(hitsFromSyllables(pattern.syllables, pattern.defaultNote ?? "C4")), [pattern]);
  const evaluation = evaluateRhythmTaps(taps, hits, bpm);
  const done = taps.length >= hits.length;
  const accuracy = evaluation.accuracy;

  function tap() {
    if (done) return;
    playNote(pattern.defaultNote ?? "C4", 0.18, 0.1);
    setTaps((current) => [...current, Date.now()]);
  }

  return (
    <div className="container-page py-10">
      <p className="pill">Metrónomo humano</p>
      <h1 className="mt-4 text-5xl font-black">Tocá la figura, no solo el tiempo</h1>
      <p className="mt-3 max-w-3xl text-lg text-zinc-600">
        Escuchá una referencia, mirá la partitura y tocá cada ataque de la figura. Si aparece un tresillo,
        el objetivo son 3 taps dentro del pulso.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.7fr]">
        <div className="card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-brand-700">Patrón actual</p>
              <h2 className="text-2xl font-black">{pattern.label}</h2>
            </div>
            <select
              value={patternIndex}
              onChange={(event) => { setPatternIndex(Number(event.target.value)); setTaps([]); }}
              className="rounded-2xl border-2 border-brand-100 bg-white px-4 py-3 font-black"
            >
              {rhythmBank.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}
            </select>
          </div>

          <AbcStaff abc={pattern.abc} />

          <div className="mt-4 flex flex-wrap gap-2">
            {hits.map((hit, index) => (
              <span key={`${hit.beat}-${index}`} className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-black text-brand-800">
                {hit.label ?? `beat ${hit.beat}`}
              </span>
            ))}
          </div>

          <button
            disabled={done}
            onClick={tap}
            className="mt-5 w-full rounded-[2rem] bg-brand-500 px-10 py-20 text-6xl font-black text-white shadow-duo active:translate-y-1 active:shadow-none disabled:opacity-70"
          >
            TAP
            <span className="mt-4 block text-lg">{taps.length}/{hits.length} ataques</span>
            <span className="mt-1 block text-xs font-bold opacity-80">cada tap suena como {pattern.defaultNote ?? "C4"}</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="card">
            <label className="text-sm font-black uppercase text-brand-700">BPM</label>
            <input min="50" max="140" type="range" value={bpm} onChange={(e) => { setBpm(Number(e.target.value)); setTaps([]); }} className="mt-4 w-full" />
            <p className="mt-3 text-4xl font-black">{bpm}</p>
            <button onClick={() => playRhythmPattern(hits, bpm, pattern.defaultNote ?? "C4")} className="btn-secondary mt-4">
              <Volume2 className="mr-2" /> Escuchar figura
            </button>
          </div>

          <div className="card">
            <h2 className="text-2xl font-black">Resultado</h2>
            <p className="mt-3 text-zinc-600">Precisión estimada:</p>
            <p className={`mt-2 text-5xl font-black ${accuracy >= 85 ? "text-brand-700" : accuracy >= 70 ? "text-yellow-700" : "text-[#ff4b4b]"}`}>{accuracy}%</p>
            <p className="mt-2 text-sm font-bold text-zinc-500">
              Error promedio: {evaluation.averageErrorMs} ms · objetivo recomendado: 85%.
            </p>
            <button onClick={() => setTaps([])} className="btn-primary mt-5">
              <RotateCcw className="mr-2" /> Reiniciar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

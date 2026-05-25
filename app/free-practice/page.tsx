"use client";

import { useState, useCallback, useEffect } from "react";
import { RotateCcw, Play, Volume2, Zap } from "lucide-react";
import {
  generatePattern, generateDistractors, patternToHits,
  FIGURES_BY_DIFFICULTY, SKILL_LABELS,
  type Figure, type TimeSignature, type SkillId, type RhythmPattern,
} from "@/lib/engine";
import { AbcStaff } from "@/components/rhythm/abc-staff";
import { playRhythmPattern, playNote, evaluateRhythmTaps } from "@/lib/rhythm-engine";

// ─── Config panel ─────────────────────────────────────────────────────────────

const SKILLS_FOR_FREE: SkillId[] = ["pulse", "reading", "dictation", "subdivision", "memory", "sight_reading", "groove"];
const TIME_SIGS: TimeSignature[] = ["4/4", "3/4", "2/4", "6/8"];

function ConfigPanel({
  difficulty, bpm, timeSig, skill, exerciseType,
  onChange
}: {
  difficulty: number; bpm: number; timeSig: TimeSignature; skill: SkillId; exerciseType: string;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="card space-y-5">
      <h3 className="font-black text-lg">Configurar práctica</h3>

      <div>
        <label className="text-xs font-black uppercase text-zinc-500 block mb-2">Habilidad</label>
        <div className="flex flex-wrap gap-2">
          {SKILLS_FOR_FREE.map(s => (
            <button key={s} onClick={() => onChange("skill", s)}
              className={`rounded-2xl px-3 py-1.5 text-xs font-black transition ${skill === s ? "bg-brand-500 text-white" : "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50"}`}>
              {SKILL_LABELS[s].emoji} {SKILL_LABELS[s].name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-black uppercase text-zinc-500 block mb-2">Tipo de ejercicio</label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "metronome",    label: "🥁 Metrónomo" },
            { key: "dictation",    label: "👂 Dictado" },
            { key: "call_response",label: "🧠 Call & Response" },
            { key: "sight_reading",label: "👁 Lectura a 1ª vista" },
          ].map(t => (
            <button key={t.key} onClick={() => onChange("exerciseType", t.key)}
              className={`rounded-2xl px-3 py-1.5 text-xs font-black transition ${exerciseType === t.key ? "bg-brand-500 text-white" : "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-black uppercase text-zinc-500 block mb-2">BPM: {bpm}</label>
          <input type="range" min={50} max={180} step={2} value={bpm}
            onChange={e => onChange("bpm", Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-xs font-black uppercase text-zinc-500 block mb-2">Dificultad: {difficulty}/10</label>
          <input type="range" min={1} max={10} step={1} value={difficulty}
            onChange={e => onChange("difficulty", Number(e.target.value))} className="w-full" />
        </div>
      </div>

      <div>
        <label className="text-xs font-black uppercase text-zinc-500 block mb-2">Compás</label>
        <div className="flex gap-2">
          {TIME_SIGS.map(ts => (
            <button key={ts} onClick={() => onChange("timeSig", ts)}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${timeSig === ts ? "bg-brand-500 text-white" : "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50"}`}>
              {ts}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Metronome exercise ───────────────────────────────────────────────────────

function MetronomeExercise({ pattern, onScore }: { pattern: RhythmPattern; onScore: (s: number) => void }) {
  const [taps, setTaps] = useState<number[]>([]);
  const hits = patternToHits(pattern);
  const done = taps.length >= hits.length;
  const evaluation = evaluateRhythmTaps(taps, hits, pattern.bpm);

  const tap = useCallback(() => {
    if (done) return;
    playNote("C4", 0.18, 0.1);
    setTaps(prev => {
      const next = [...prev, Date.now()];
      if (next.length >= hits.length) {
        const ev = evaluateRhythmTaps(next, hits, pattern.bpm);
        setTimeout(() => onScore(ev.accuracy), 100);
      }
      return next;
    });
  }, [done, hits, pattern.bpm, onScore]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === "Space" && !e.repeat) { e.preventDefault(); tap(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [tap]);

  return (
    <div className="space-y-4">
      <button onClick={() => playRhythmPattern(hits, pattern.bpm, "C4")}
        className="btn-secondary w-full justify-center"><Volume2 className="mr-2" size={16} /> Escuchar referencia</button>
      <button
        onClick={tap} disabled={done}
        onTouchStart={e => { e.preventDefault(); tap(); }}
        style={{ touchAction: "none" }}
        className="w-full rounded-[2rem] bg-brand-500 py-16 text-3xl font-black text-white shadow-button active:scale-95 transition disabled:opacity-50">
        TAP
        <span className="mt-2 block text-sm">{taps.length}/{hits.length}</span>
      </button>
      {done && (
        <div className={`rounded-2xl p-4 font-black ${evaluation.accuracy >= 75 ? "bg-brand-100 text-brand-800" : "bg-red-50 text-red-800"}`}>
          Precisión: {evaluation.accuracy}% · Error prom: {evaluation.averageErrorMs}ms
        </div>
      )}
    </div>
  );
}

// ─── Dictation exercise ───────────────────────────────────────────────────────

function DictationExercise({ pattern, onScore }: { pattern: RhythmPattern; onScore: (s: number) => void }) {
  const [options] = useState(() => {
    const distractors = generateDistractors(pattern, 3);
    const pos = Math.floor(Math.random() * 4);
    return [...distractors.slice(0, pos), pattern, ...distractors.slice(pos)];
  });
  const correctIdx = options.indexOf(pattern);
  const [selected, setSelected] = useState<number | null>(null);

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    onScore(i === correctIdx ? 100 : 0);
  }

  return (
    <div className="space-y-4">
      <button onClick={() => playRhythmPattern(patternToHits(pattern), pattern.bpm, "C4")}
        className="btn-primary w-full justify-center"><Volume2 className="mr-2" size={16} /> Escuchar patrón</button>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <button key={opt.id} onClick={() => choose(i)}
            className={`rounded-2xl border-2 p-3 text-left transition ${
              selected !== null && i === correctIdx ? "border-brand-500 bg-brand-50"
              : selected === i ? "border-red-400 bg-red-50"
              : "border-brand-100 bg-zinc-50 hover:bg-brand-50 disabled:cursor-default"}`}
            disabled={selected !== null}>
            <p className="text-[10px] font-black text-zinc-400 mb-1">Opción {i + 1}</p>
            <AbcStaff abc={opt.abc} />
            <p className="text-[10px] mt-1 text-zinc-500">{opt.syllables.join(" ")}</p>
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className={`rounded-2xl p-3 font-black text-sm ${selected === correctIdx ? "bg-brand-100 text-brand-800" : "bg-red-50 text-red-800"}`}>
          {selected === correctIdx ? "✓ Correcto" : `Era la opción ${correctIdx + 1}: ${pattern.label}`}
        </div>
      )}
    </div>
  );
}

// ─── Sight reading exercise ───────────────────────────────────────────────────

function SightReadingExercise({ pattern, onScore }: { pattern: RhythmPattern; onScore: (s: number) => void }) {
  const [taps, setTaps] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const hits = patternToHits(pattern);
  const done = taps.length >= hits.length;
  const ev = evaluateRhythmTaps(taps, hits, pattern.bpm);

  const tap = useCallback(() => {
    if (done || !revealed) return;
    playNote("C4", 0.18, 0.1);
    setTaps(prev => {
      const next = [...prev, Date.now()];
      if (next.length >= hits.length) {
        const e = evaluateRhythmTaps(next, hits, pattern.bpm);
        setTimeout(() => onScore(e.accuracy), 100);
      }
      return next;
    });
  }, [done, revealed, hits, pattern.bpm, onScore]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === "Space" && !e.repeat) { e.preventDefault(); tap(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [tap]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-zinc-50 p-4">
        <p className="text-xs font-black uppercase text-zinc-500 mb-2">Partitura — leé antes de tocar</p>
        <AbcStaff abc={pattern.abc} />
        <div className="flex flex-wrap gap-2 mt-2">
          {pattern.syllables.map((s, i) => <span key={i} className="rounded-lg bg-white px-2 py-1 text-xs font-black text-brand-800">{s}</span>)}
        </div>
      </div>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="btn-primary w-full justify-center">
          <Play className="mr-2" size={16} /> Listo — empezar
        </button>
      ) : (
        <>
          <button onClick={tap} disabled={done}
            onTouchStart={e => { e.preventDefault(); tap(); }}
            style={{ touchAction: "none" }}
            className="w-full rounded-[2rem] bg-brand-500 py-14 text-2xl font-black text-white shadow-button active:scale-95 transition disabled:opacity-50">
            TAP · {taps.length}/{hits.length}
          </button>
          {done && (
            <div className={`rounded-2xl p-4 font-black ${ev.accuracy >= 75 ? "bg-brand-100 text-brand-800" : "bg-red-50 text-red-800"}`}>
              Precisión: {ev.accuracy}%
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FreePracticePage() {
  const [config, setConfig] = useState({
    skill: "pulse" as SkillId,
    exerciseType: "metronome",
    bpm: 80,
    difficulty: 3,
    timeSig: "4/4" as TimeSignature,
  });
  const [pattern, setPattern] = useState<RhythmPattern | null>(null);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [exerciseCount, setExerciseCount] = useState(0);

  function generate() {
    const p = generatePattern({
      difficulty: config.difficulty,
      timeSignature: config.timeSig,
      bpm: config.bpm,
      bars: config.difficulty <= 3 ? 1 : 2,
      skills: [config.skill],
    });
    setPattern(p);
    setExerciseCount(c => c + 1);
  }

  function handleScore(score: number) {
    setSessionScores(prev => [...prev, score]);
  }

  function handleChange(key: string, value: unknown) {
    setConfig(prev => ({ ...prev, [key]: value }));
    setPattern(null);
  }

  const avgScore = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : null;

  return (
    <div className="container-page py-10">
      <p className="pill">Modo libre</p>
      <h1 className="mt-4 text-5xl font-black">Práctica libre</h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-600">
        Sin ruta, sin puntos. Elegís la habilidad, la dificultad y el tipo de ejercicio. El motor genera variaciones infinitas.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">

        {/* Config */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ConfigPanel {...config} onChange={handleChange} />

          {sessionScores.length > 0 && (
            <div className="card">
              <p className="text-sm font-black uppercase text-brand-700 mb-3">Sesión</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-brand-50 p-3">
                  <p className="text-2xl font-black text-brand-700">{exerciseCount}</p>
                  <p className="text-xs font-bold text-zinc-500">ejercicios</p>
                </div>
                <div className="rounded-2xl bg-yellow-50 p-3">
                  <p className="text-2xl font-black text-yellow-700">{avgScore}%</p>
                  <p className="text-xs font-bold text-zinc-500">promedio</p>
                </div>
                <div className="rounded-2xl bg-green-50 p-3">
                  <p className="text-2xl font-black text-green-700">{sessionScores.filter(s => s >= 80).length}</p>
                  <p className="text-xs font-bold text-zinc-500">al 80%+</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {sessionScores.slice(-20).map((s, i) => (
                  <div key={i} className={`h-3 w-3 rounded-full ${s >= 80 ? "bg-brand-500" : s >= 60 ? "bg-yellow-400" : "bg-red-400"}`} />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Exercise area */}
        <main>
          {!pattern ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <p className="text-5xl mb-4">🎵</p>
              <h2 className="text-2xl font-black">Configurá y generá</h2>
              <p className="mt-2 text-zinc-600 mb-6">Elegí la habilidad y el tipo de ejercicio, luego generá un patrón nuevo.</p>
              <button onClick={generate} className="btn-primary text-lg px-8 py-4">
                <Zap className="mr-2" size={20} /> Generar ejercicio
              </button>
            </div>
          ) : (
            <div className="card space-y-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="pill w-fit mb-2">Ejercicio #{exerciseCount} · dificultad {config.difficulty}/10 · {config.bpm} BPM</p>
                  <h2 className="text-2xl font-black">{SKILL_LABELS[config.skill].emoji} {SKILL_LABELS[config.skill].name}</h2>
                  <p className="text-zinc-600 text-sm mt-1">Patrón: {pattern.label}</p>
                </div>
                <button onClick={generate} className="btn-secondary">
                  <RotateCcw className="mr-2" size={16} /> Nuevo patrón
                </button>
              </div>

              {config.exerciseType === "metronome" && (
                <MetronomeExercise pattern={pattern} onScore={s => { handleScore(s); setTimeout(generate, 1500); }} />
              )}
              {config.exerciseType === "dictation" && (
                <DictationExercise pattern={pattern} onScore={s => { handleScore(s); setTimeout(generate, 1500); }} />
              )}
              {config.exerciseType === "sight_reading" && (
                <SightReadingExercise pattern={pattern} onScore={s => { handleScore(s); setTimeout(generate, 1500); }} />
              )}
              {config.exerciseType === "call_response" && (
                <div className="rounded-2xl bg-brand-50 p-6 text-center">
                  <p className="font-black text-brand-800">Call & Response generativo próximamente.</p>
                  <p className="text-sm text-zinc-600 mt-1">Por ahora usá el Mundo 7 para call & response.</p>
                  <button onClick={() => handleChange("exerciseType", "metronome")} className="btn-secondary mt-4">
                    Cambiar a metrónomo
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

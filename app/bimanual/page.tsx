"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Brain, CheckCircle2, Keyboard, RotateCcw, Save, Share2, SlidersHorizontal, Sparkles, Volume2 } from "lucide-react";
import { bimanualExercises } from "@/lib/bimanual-content";
import type { BimanualTap, Hand } from "@/lib/rhythm-engine";
import { audibleBimanualHits, evaluateBimanualTaps, playBimanualPattern, playNote } from "@/lib/rhythm-engine";
import { completeLesson, type CompletionReward } from "@/lib/progress";
import { RewardModal } from "@/components/reward-modal";

// ─── Tiny SVG note figures (16×36 viewBox) ───────────────────────────────────

function NoteQ({ c }: { c: string }) {
  return <svg width="14" height="32" viewBox="0 0 14 32"><line x1="10" y1="4" x2="10" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><ellipse cx="6" cy="24" rx="6" ry="4.5" transform="rotate(-18 6 24)" fill={c}/></svg>;
}
function NoteE({ c }: { c: string }) {
  return <svg width="22" height="32" viewBox="0 0 22 32"><line x1="6" y1="4" x2="6" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><line x1="15" y1="3" x2="15" y2="21" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><line x1="6" y1="4" x2="15" y2="3" stroke={c} strokeWidth="2.2" strokeLinecap="round"/><ellipse cx="3" cy="24" rx="5" ry="3.5" transform="rotate(-18 3 24)" fill={c}/><ellipse cx="12" cy="23" rx="5" ry="3.5" transform="rotate(-18 12 23)" fill={c}/></svg>;
}
function NoteTriplet({ c }: { c: string }) {
  return <svg width="30" height="34" viewBox="0 0 30 34"><line x1="4" y1="4" x2="4" y2="22" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><line x1="15" y1="3" x2="15" y2="21" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><line x1="26" y1="4" x2="26" y2="22" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><line x1="4" y1="4" x2="26" y2="4" stroke={c} strokeWidth="2.2" strokeLinecap="round"/><ellipse cx="1" cy="24" rx="4.5" ry="3.5" transform="rotate(-18 1 24)" fill={c}/><ellipse cx="12" cy="23" rx="4.5" ry="3.5" transform="rotate(-18 12 23)" fill={c}/><ellipse cx="23" cy="24" rx="4.5" ry="3.5" transform="rotate(-18 23 24)" fill={c}/><text x="15" y="33" textAnchor="middle" fontSize="8" fontWeight="bold" fill={c}>3</text></svg>;
}
function NoteSixteenth({ c }: { c: string }) {
  return <svg width="32" height="32" viewBox="0 0 32 32"><line x1="3" y1="4" x2="3" y2="22" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="3" x2="12" y2="21" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><line x1="21" y1="4" x2="21" y2="22" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><line x1="30" y1="3" x2="30" y2="21" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><line x1="3" y1="4" x2="30" y2="3" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="8" x2="30" y2="7" stroke={c} strokeWidth="2" strokeLinecap="round"/><ellipse cx="1" cy="24" rx="4" ry="3" transform="rotate(-18 1 24)" fill={c}/><ellipse cx="10" cy="23" rx="4" ry="3" transform="rotate(-18 10 23)" fill={c}/><ellipse cx="19" cy="24" rx="4" ry="3" transform="rotate(-18 19 24)" fill={c}/><ellipse cx="28" cy="23" rx="4" ry="3" transform="rotate(-18 28 23)" fill={c}/></svg>;
}
function NoteRest({ c }: { c: string }) {
  return <svg width="14" height="32" viewBox="0 0 14 32"><path d="M9 8 L5 14 L9 18 L4 26 Q2 30 6 31 Q9 32 10 29" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function NoteSyncope({ c }: { c: string }) {
  return <svg width="22" height="32" viewBox="0 0 22 32"><rect x="2" y="12" width="8" height="5" rx="1.5" fill={c} opacity="0.4"/><line x1="17" y1="4" x2="17" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M17 4 Q24 9 20 18" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/><ellipse cx="13" cy="24" rx="5" ry="3.5" transform="rotate(-18 13 24)" fill={c}/></svg>;
}
function NoteDotted({ c }: { c: string }) {
  return <svg width="18" height="32" viewBox="0 0 18 32"><line x1="12" y1="4" x2="12" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><ellipse cx="6" cy="24" rx="6" ry="4.5" transform="rotate(-18 6 24)" fill={c}/><circle cx="16" cy="22" r="2" fill={c}/></svg>;
}
function NotePolyDot({ label, c }: { label: string; c: string }) {
  return <svg width="14" height="32" viewBox="0 0 14 32"><line x1="7" y1="4" x2="7" y2="20" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><circle cx="7" cy="26" r="6" fill={c}/><text x="7" y="29" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">{label}</text></svg>;
}

function NoteSVG({ pattern, color }: { pattern: string; color: string }) {
  const n = pattern.trim().toUpperCase();
  if (n === "—" || n === "-" || n === "SILENCIO") return <NoteRest c={color} />;
  if (n === "—KA" || n === "-KA") return <NoteSyncope c={color} />;
  if (n.includes("TA-KI-TA")) return <NoteTriplet c={color} />;
  if (n.includes("TA-KA-DI-MI")) return <NoteSixteenth c={color} />;
  if (n.includes("TA-KA")) return <NoteE c={color} />;
  if (n.includes("TA.")) return <NoteDotted c={color} />;
  if (/^[0-9]+$/.test(n)) return <NotePolyDot label={n} c={color} />;
  return <NoteQ c={color} />;
}

function figureLabel(pattern: string): string {
  const n = pattern.trim().toUpperCase();
  if (n === "—" || n === "-" || n === "SILENCIO") return "—";
  if (n === "—KA" || n === "-KA") return "sinc";
  if (n.includes("TA-KI-TA")) return "ta-ki-ta";
  if (n.includes("TA-KA-DI-MI")) return "ta-ka-di-mi";
  if (n.includes("TA-KA")) return "ta-ka";
  if (n.includes("TA.")) return "ta.";
  if (/^[0-9]+$/.test(n)) return n;
  return "ta";
}

// ─── Two-column vertical score (mobile-first) ────────────────────────────────

function ScoreColumns({ leftPatterns, rightPatterns }: { leftPatterns: string[]; rightPatterns: string[] }) {
  const maxLen = Math.max(leftPatterns.length, rightPatterns.length);
  const lc = "#16a34a";
  const rc = "#2563eb";

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-zinc-300">
        {/* Left column */}
        <div className="flex flex-col items-center py-3 px-2">
          <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: lc }}>✋ Izquierda</p>
          {Array.from({ length: maxLen }).map((_, i) => {
            const pat = leftPatterns[i] ?? "—";
            const isBarLine = i > 0 && i % 4 === 0;
            return (
              <div key={i} className="flex flex-col items-center w-full">
                {isBarLine && <div className="w-3/4 h-px bg-zinc-300 my-1" />}
                <div className="flex flex-col items-center py-0.5">
                  <NoteSVG pattern={pat} color={lc} />
                  <span className="text-[8px] font-bold mt-0.5" style={{ color: lc }}>{figureLabel(pat)}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Right column */}
        <div className="flex flex-col items-center py-3 px-2">
          <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: rc }}>🤚 Derecha</p>
          {Array.from({ length: maxLen }).map((_, i) => {
            const pat = rightPatterns[i] ?? "—";
            const isBarLine = i > 0 && i % 4 === 0;
            return (
              <div key={i} className="flex flex-col items-center w-full">
                {isBarLine && <div className="w-3/4 h-px bg-zinc-300 my-1" />}
                <div className="flex flex-col items-center py-0.5">
                  <NoteSVG pattern={pat} color={rc} />
                  <span className="text-[8px] font-bold mt-0.5" style={{ color: rc }}>{figureLabel(pat)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Polyrhythm grid (for 2v3, 3v4 etc) ─────────────────────────────────────

function PolyrhythmGrid({ grid }: { grid: { left: number[]; right: number[]; totalBeats: number } }) {
  const cells = Array.from({ length: grid.totalBeats }, (_, i) => i);
  const leftSet = new Set(grid.left);
  const rightSet = new Set(grid.right);
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">Grilla de coincidencias</p>
      <div className="overflow-x-auto">
        <div className="grid gap-1 min-w-max" style={{ gridTemplateColumns: `repeat(${grid.totalBeats}, minmax(2rem, 1fr))` }}>
          {cells.map((i) => {
            const both = leftSet.has(i) && rightSet.has(i);
            return (
              <div key={i} className="text-center">
                <div className={`h-7 w-7 rounded-full border-2 text-xs font-black flex items-center justify-center mx-auto ${both ? "border-brand-500 bg-brand-500 text-white" : leftSet.has(i) ? "border-green-500 bg-green-100 text-green-800" : rightSet.has(i) ? "border-blue-500 bg-blue-100 text-blue-800" : "border-zinc-200 bg-zinc-50 text-zinc-300"}`}>{i}</div>
                <div className="mt-1 flex flex-col gap-0.5">
                  {leftSet.has(i) && <div className="h-1 rounded-full bg-green-500" />}
                  {rightSet.has(i) && <div className="h-1 rounded-full bg-blue-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-brand-500 inline-block" /> Ambas</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" /> Solo izq</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" /> Solo der</span>
      </div>
    </div>
  );
}

export default function BimanualPage() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const exercise = bimanualExercises[exerciseIndex] ?? bimanualExercises[0];
  const [bpm, setBpm] = useState(exercise.recommendedBpm);
  const [taps, setTaps] = useState<BimanualTap[]>([]);
  const [reward, setReward] = useState<CompletionReward | null>(null);
  const [saving, setSaving] = useState(false);

  const hits = useMemo(() => audibleBimanualHits(exercise.hits), [exercise]);
  const done = taps.length >= hits.length;
  const evaluation = evaluateBimanualTaps(taps, exercise.hits, bpm, exercise.difficulty === "Inicial" ? 0.36 : exercise.difficulty === "Básico" ? 0.32 : 0.26);
  const passed = done && evaluation.score >= exercise.passScore;

  useEffect(() => { setBpm(exercise.recommendedBpm); setTaps([]); }, [exercise]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.key.toLowerCase() === "a") tap("left");
      if (e.key.toLowerCase() === "l") tap("right");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function tap(hand: Hand) {
    if (done) return;
    playNote(hand === "left" ? "C3" : "C4", hand === "left" ? 0.24 : 0.2, hand === "left" ? 0.13 : 0.1);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(25);
    setTaps((cur) => [...cur, { hand, at: performance.now() }]);
  }

  async function save() {
    setSaving(true);
    try {
      const data = await completeLesson({
        moduleSlug: "coordinacion-bimanual", lessonSlug: exercise.slug,
        score: evaluation.score, xp: passed ? exercise.xp : Math.round(exercise.xp * 0.35),
        attempts: [{ exercise_key: `bimanual-${exercise.slug}`, exercise_type: "bimanual_coordination", answer: { bpm, taps: taps.map(t => ({ hand: t.hand })), expected: hits.map(h => ({ hand: h.hand, beat: h.beat, label: h.label })) }, is_correct: passed, score: evaluation.score, xp: passed ? exercise.xp : Math.round(exercise.xp * 0.35), accuracy: evaluation.score }]
      });
      setReward(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally { setSaving(false); }
  }

  // Tap dots indicator
  const totalDots = Math.min(hits.length, 16);
  const tappedDots = Math.min(taps.length, totalDots);

  return (
    <div className="container-page py-8">
      <p className="pill">Módulo avanzado</p>
      <h1 className="mt-4 text-4xl font-black md:text-5xl">Coordinación bimanual</h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-600">De negras juntas hasta polirritmia. Cada ejercicio trabaja independencia real entre manos.</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[320px_1fr_280px]">

        {/* ── Sidebar: exercise list ── */}
        <aside className="xl:sticky xl:top-24 xl:self-start space-y-4">
          <div className="card">
            <p className="text-sm font-black uppercase text-brand-700 mb-3">Progresión</p>
            <div className="space-y-1.5">
              {bimanualExercises.map((item, idx) => (
                <button key={item.slug} onClick={() => setExerciseIndex(idx)}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition ${idx === exerciseIndex ? "bg-brand-500 text-white shadow-button" : "bg-brand-50 text-brand-900 hover:bg-brand-100"}`}>
                  <div className="text-[10px] font-black uppercase opacity-75">{item.difficulty} · {item.levelName}</div>
                  <div className="mt-0.5 text-sm font-black">{idx + 1}. {item.title}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="space-y-5">

          {/* Header */}
          <section className="card bg-gradient-to-br from-brand-50 to-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="pill">{exercise.difficulty} · +{exercise.xp} XP · objetivo {exercise.passScore}%</p>
                <h2 className="mt-3 text-3xl font-black">{exercise.title}</h2>
                <p className="mt-2 text-zinc-600">{exercise.description}</p>
                <p className="mt-1 font-bold text-zinc-700">Objetivo: {exercise.objective}</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button className="btn-primary" onClick={() => playBimanualPattern(exercise.hits, bpm)}><Volume2 className="mr-2" size={16}/> Escuchar</button>
                <button className="btn-secondary" onClick={() => navigator.share?.({ title: exercise.title, text: `Practicando ${exercise.title} en RitmoLab`, url: location.href })}><Share2 size={16}/></button>
              </div>
            </div>
          </section>

          {/* Theory */}
          <section className="card">
            <div className="flex items-center gap-3 mb-4"><BookOpen className="text-brand-700" size={20}/><div><p className="text-xs font-black uppercase text-brand-700">Teoría</p><h3 className="text-xl font-black">{exercise.title}</h3></div></div>
            <div className="space-y-3">
              {exercise.theory.map((t, i) => <p key={i} className="rounded-2xl bg-zinc-50 p-4 leading-relaxed text-zinc-700 text-sm">{t}</p>)}
            </div>
            <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
              <div className="flex items-center gap-2 mb-1"><Brain className="text-brand-700" size={16}/><p className="font-black text-brand-700 text-xs uppercase tracking-wide">Estrategia cognitiva</p></div>
              <p className="text-sm text-zinc-700 font-bold">{exercise.cognitiveStrategy}</p>
            </div>
            {exercise.polyrhythmGrid && <PolyrhythmGrid grid={exercise.polyrhythmGrid} />}
          </section>

          {/* Score — two vertical columns */}
          <section className="card">
            <p className="text-sm font-black uppercase text-brand-700 mb-3">Partitura</p>
            <ScoreColumns leftPatterns={exercise.leftPattern} rightPatterns={exercise.rightPattern} />
          </section>

          {/* Tap section */}
          <section className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-black uppercase text-brand-700">Tocá el ejercicio</p>
                <h3 className="text-2xl font-black">{taps.length}/{hits.length} ataques</h3>
              </div>
              <button className="btn-secondary" onClick={() => setTaps([])}><RotateCcw size={16} className="mr-2"/>Reiniciar</button>
            </div>

            {/* Dot progress */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {Array.from({ length: totalDots }).map((_, i) => (
                <div key={i} className={`h-3 w-3 rounded-full transition-all ${i < tappedDots ? "bg-brand-500 scale-110" : "bg-brand-100"}`} />
              ))}
            </div>

            {/* Big tap buttons — touchstart para multitouch en mobile */}
            <div className="grid grid-cols-2 gap-4" style={{ touchAction: "none" }}>
              <button
                disabled={done}
                onTouchStart={(e) => { e.preventDefault(); if (!done) tap("left"); }}
                onClick={() => tap("left")}
                className="rounded-[2rem] bg-green-600 py-14 text-2xl font-black text-white shadow-button active:translate-y-1 active:shadow-none disabled:opacity-50 transition"
                style={{ touchAction: "none", userSelect: "none" }}
              >
                ✋ Izquierda
                <span className="mt-2 block text-xs font-bold opacity-80">pulgar izquierdo</span>
              </button>
              <button
                disabled={done}
                onTouchStart={(e) => { e.preventDefault(); if (!done) tap("right"); }}
                onClick={() => tap("right")}
                className="rounded-[2rem] bg-blue-600 py-14 text-2xl font-black text-white shadow-button active:translate-y-1 active:shadow-none disabled:opacity-50 transition"
                style={{ touchAction: "none", userSelect: "none" }}
              >
                🤚 Derecha
                <span className="mt-2 block text-xs font-bold opacity-80">pulgar derecho</span>
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-zinc-50 p-3 text-sm font-bold text-zinc-600">
              <Keyboard size={16}/> Podés tocar los dos botones a la vez con ambos pulgares
            </div>
          </section>

        </main>

        {/* ── Right sidebar: score & BPM ── */}
        <aside className="xl:sticky xl:top-24 xl:self-start space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3"><SlidersHorizontal className="text-brand-700" size={18}/><h3 className="text-xl font-black">Tempo</h3></div>
            <input type="range" min={exercise.minBpm} max={exercise.maxBpm} step="1" value={bpm} onChange={(e) => { setBpm(Number(e.target.value)); setTaps([]); }} className="w-full"/>
            <p className="mt-2 text-4xl font-black">{bpm}</p>
            <p className="text-sm font-bold text-zinc-500">Rango: {exercise.minBpm}–{exercise.maxBpm} BPM</p>
          </div>

          <div className="card">
            <p className="text-sm font-black uppercase text-brand-700 mb-2">Resultado</p>
            <p className={`text-5xl font-black ${evaluation.score >= 85 ? "text-brand-700" : evaluation.score >= 70 ? "text-yellow-700" : "text-red-600"}`}>{evaluation.score}%</p>
            <div className="mt-4 space-y-2 text-sm font-bold">
              <div className="flex justify-between rounded-xl bg-green-50 px-3 py-2"><span>Izquierda</span><b>{evaluation.leftAccuracy}%</b></div>
              <div className="flex justify-between rounded-xl bg-blue-50 px-3 py-2"><span>Derecha</span><b>{evaluation.rightAccuracy}%</b></div>
              <div className="flex justify-between rounded-xl bg-brand-50 px-3 py-2"><span>Coordinación</span><b>{evaluation.coordinationAccuracy}%</b></div>
              <div className="flex justify-between rounded-xl bg-zinc-50 px-3 py-2"><span>Error prom.</span><b>{evaluation.averageErrorMs} ms</b></div>
            </div>
            {done && <div className={`mt-3 rounded-2xl p-3 font-black text-sm ${passed ? "bg-brand-100 text-brand-800" : "bg-yellow-50 text-yellow-800"}`}>{passed ? "¡Aprobado! Guardá tu XP." : "Casi. Bajá el BPM y repetí."}</div>}
            <button onClick={save} disabled={!done || saving} className="btn-primary mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Guardando..." : <><Save size={16} className="mr-2"/> Guardar XP</>}
            </button>
          </div>

          <div className="card bg-zinc-950 text-white">
            <Sparkles className="text-yellow-300" size={20}/>
            <h3 className="mt-2 text-lg font-black">Por qué es difícil</h3>
            <p className="mt-2 text-sm text-white/75">Evalúa mano correcta, tiempo, independencia y cantidad de ataques. El tresillo y la semicorchea evalúan cada subdivisión interna.</p>
          </div>
        </aside>

      </div>
      <RewardModal reward={reward} onClose={() => setReward(null)} />
    </div>
  );
}

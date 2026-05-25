"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CheckCircle2, Headphones, RotateCcw, XCircle } from "lucide-react";
import type { Lesson, LessonExercise } from "@/lib/types";
import { playNote, playRhythmPattern, hitsFromSyllables } from "@/lib/rhythm-engine";
import type { CompletionAttempt } from "@/lib/progress";

type Props = {
  lesson: Lesson;
  exercise: LessonExercise;
  index: number;
  onResult: (key: string, result: CompletionAttempt) => void;
};

type Phase = "idle" | "playing" | "waiting" | "responding" | "done";

export function ExerciseCallResponse({ lesson, exercise, index, onResult }: Props) {
  const key = `${lesson.slug}-${index}-call_response`;
  const bpm = exercise.bpm ?? 80;
  const rhythm = exercise.rhythm;
  const targetHits = rhythm?.hits?.length
    ? rhythm.hits
    : hitsFromSyllables(rhythm?.syllables ?? ["TA", "TA", "TA", "TA"]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [taps, setTaps] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const patternDurationMs = (Math.max(...targetHits.map(h => h.beat), 0) + 1) * (60000 / bpm);

  function clearCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current);
  }

  function startCall() {
    setPhase("playing");
    setTaps([]);
    setScore(null);
    playRhythmPattern(targetHits, bpm, rhythm?.defaultNote ?? "C4");
    setTimeout(() => {
      setPhase("waiting");
      setCountdown(3);
      let c = 3;
      countdownRef.current = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearCountdown();
          setPhase("responding");
          startTimeRef.current = Date.now();
          setTimeout(() => finishResponse(), 5000);
        }
      }, 1000);
    }, patternDurationMs + 600);
  }

  const tap = useCallback(() => {
    if (phase !== "responding") return;
    playNote(rhythm?.defaultNote ?? "C4", 0.15, 0.09);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(25);
    setTaps(prev => [...prev, Date.now() - startTimeRef.current]);
  }, [phase, rhythm]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" && !e.repeat) { e.preventDefault(); tap(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tap]);

  function finishResponse() {
    setPhase("done");
    clearCountdown();
    const expectedBeats = targetHits.length;
    const actualBeats = taps.length;
    const countScore = actualBeats === expectedBeats ? 50 : Math.max(0, 50 - Math.abs(actualBeats - expectedBeats) * 15);
    const timingScore = taps.length >= 2
      ? Math.max(0, 50 - (taps.slice(1).reduce((s, t, i) => s + Math.abs((t - taps[i]) - (60000 / bpm)), 0) / (taps.length - 1)) / (60000 / bpm) * 50)
      : (taps.length === 1 && expectedBeats === 1 ? 40 : 0);
    const finalScore = Math.round(countScore + timingScore);
    setScore(finalScore);
    onResult(key, {
      exercise_key: key, exercise_type: "call_response",
      answer: { taps: actualBeats, expected: expectedBeats },
      is_correct: finalScore >= 60, score: finalScore,
      xp: finalScore >= 60 ? exercise.xp : Math.round(exercise.xp * 0.3),
    });
  }

  function retry() { clearCountdown(); setPhase("idle"); setTaps([]); setScore(null); setCountdown(0); }

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-5">
      <p className="font-black text-brand-700">{exercise.title || "Call & Response"} · +{exercise.xp} XP</p>
      <h4 className="mt-2 text-xl font-black">{exercise.prompt}</h4>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { n: "1", label: "Escuchá", active: phase === "playing" },
          { n: "2", label: "Preparate", active: phase === "waiting" },
          { n: "3", label: "Reproducí", active: phase === "responding" },
        ].map(s => (
          <div key={s.n} className={`rounded-2xl p-3 transition ${s.active ? "bg-brand-500 text-white" : "bg-zinc-50 text-zinc-600"}`}>
            <p className="text-lg font-black">{s.n}</p>
            <p className="text-xs font-bold mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        {phase === "idle" && (
          <button onClick={startCall} className="btn-primary w-full justify-center py-5 text-lg">
            <Headphones className="mr-3" size={22} /> Escuchar patrón
          </button>
        )}
        {phase === "playing" && (
          <div className="rounded-3xl bg-brand-500 p-6 text-center text-white animate-pulse">
            <p className="text-2xl font-black">🎵 Escuchando...</p>
            <p className="mt-2 text-sm opacity-80">Prestá atención al ritmo completo</p>
          </div>
        )}
        {phase === "waiting" && (
          <div className="rounded-3xl bg-yellow-400 p-6 text-center">
            <p className="text-6xl font-black text-zinc-900">{countdown}</p>
            <p className="mt-2 text-sm font-black text-zinc-800">Preparate para reproducir</p>
          </div>
        )}
        {phase === "responding" && (
          <div className="space-y-3">
            <button
              onClick={tap}
              onTouchStart={(e) => { e.preventDefault(); tap(); }}
              style={{ touchAction: "none", userSelect: "none" }}
              className="w-full rounded-[2rem] bg-green-600 py-16 text-3xl font-black text-white transition shadow-button active:scale-95"
            >
              TAP
              <span className="mt-2 block text-base">{taps.length} golpes</span>
            </button>
            <button onClick={finishResponse} className="btn-secondary w-full justify-center">Terminé</button>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: targetHits.length }).map((_, i) => (
                <div key={i} className={`h-4 w-4 rounded-full ${i < taps.length ? "bg-green-500" : "bg-zinc-200"}`} />
              ))}
            </div>
          </div>
        )}
        {phase === "done" && score !== null && (
          <div className={`rounded-3xl p-5 ${score >= 60 ? "bg-brand-100" : "bg-red-50"}`}>
            <div className="flex items-center gap-3 mb-3">
              {score >= 60 ? <CheckCircle2 className="text-brand-700" size={24} /> : <XCircle className="text-red-600" size={24} />}
              <div>
                <p className={`text-2xl font-black ${score >= 60 ? "text-brand-800" : "text-red-800"}`}>{score}%</p>
                <p className={`text-sm font-bold ${score >= 60 ? "text-brand-700" : "text-red-700"}`}>
                  {score >= 80 ? "¡Memoria rítmica sólida!" : score >= 60 ? "Bien. Seguí practicando." : "El patrón tuvo diferencias."}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <p className="text-xs font-bold text-zinc-700">
                Esperado: {targetHits.length} golpes · Reproduciste: {taps.length}.
                {taps.length !== targetHits.length && ` Diferencia de ${Math.abs(taps.length - targetHits.length)} golpe${Math.abs(taps.length - targetHits.length) !== 1 ? "s" : ""}.`}
                {taps.length === targetHits.length && " Cantidad exacta — el timing se mejora con repetición."}
              </p>
            </div>
            <button onClick={retry} className="btn-secondary mt-3 w-full justify-center"><RotateCcw className="mr-2" size={16} /> Intentar de nuevo</button>
          </div>
        )}
      </div>
    </div>
  );
}

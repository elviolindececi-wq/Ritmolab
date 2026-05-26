"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CirclePlay, Headphones, Lightbulb, Loader2, MessageCircleQuestion, Music2, RotateCcw, Share2, Sparkles, Target, Trophy, Volume2, XCircle, ArrowRight } from "lucide-react";
import type { Lesson, LessonExercise, Module, RhythmOption } from "@/lib/types";
import { completeLesson, type CompletionAttempt, type CompletionReward } from "@/lib/progress";
import { RewardModal } from "@/components/reward-modal";
import { ExerciseCallResponse } from "@/components/exercises/exercise-call-response";
import { ResultsScreen } from "@/components/results-screen";
import { useAnalytics } from "@/lib/analytics";
import { AbcStaff } from "@/components/rhythm/abc-staff";
import { audibleHits, evaluateRhythmTaps, hitsFromAbc, hitsFromSyllables, playNote, playRhythmPattern, timeSignatureFromAbc, totalQuarterBeatsFromAbc } from "@/lib/rhythm-engine";

type Result = CompletionAttempt;
type Props = { module: Module };

function exerciseKey(lesson: Lesson, exercise: LessonExercise, index: number) {
  return `${lesson.slug}-${index}-${exercise.type}`;
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return hash >>> 0;
}

function seededRandom(seed: string) {
  let state = hashString(seed);

  return function random() {
    state += 0x6d2b79f5;

    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const random = seededRandom(seed);
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function YoutubeBlock({ lesson }: { lesson: Lesson }) {
  return (
    <section className="card overflow-hidden">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600"><CirclePlay /></span>
        <div><p className="text-sm font-black uppercase tracking-wide text-red-600">Video guiado</p><h3 className="text-xl font-black">{lesson.videoTitle}</h3></div>
      </div>
      {lesson.youtubeId ? (
        <div className="aspect-video overflow-hidden rounded-3xl border border-brand-100 bg-zinc-950 shadow-soft">
          <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${lesson.youtubeId}`} title={lesson.videoTitle} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        </div>
      ) : <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50 p-6 font-bold text-brand-800">Agregá un video definitivo desde <code>lib/content.ts</code>.</div>}
    </section>
  );
}

// ─── PatternBoard mejorado con jerarquía visual y animación de beat ──────────
function PatternBoard({ pattern, bpm, playing }: { pattern: string[]; bpm?: number; playing?: boolean }) {
  const [activeBeat, setActiveBeat] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing && bpm) {
      const ms = (60 / bpm) * 1000;
      let i = 0;
      setActiveBeat(0);
      intervalRef.current = setInterval(() => {
        i = (i + 1) % pattern.length;
        setActiveBeat(i);
      }, ms);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setActiveBeat(null);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, bpm, pattern.length]);

  const isAccent = (item: string) => item === item.toUpperCase() && item.trim() !== "";
  const isSubdiv = (item: string) => ["y", "la", "li", "KA", "KI", "DI", "MI", "ka", "ki", "di", "mi"].includes(item);

  return (
    <section className="card">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Music2 /></span><div><p className="text-sm font-black uppercase tracking-wide text-brand-700">Miralo</p><h3 className="text-xl font-black">Mapa visual del ritmo</h3></div></div>
      <div className="mt-5 flex flex-wrap gap-3">
        {pattern.map((item, index) => {
          const accent = isAccent(item) && !isSubdiv(item);
          const subdiv = isSubdiv(item);
          const isActive = activeBeat === index;
          return (
            <span
              key={`${item}-${index}`}
              className={`grid place-items-center rounded-2xl border-2 text-center font-black transition-all duration-100
                ${accent ? "min-h-16 min-w-16 border-brand-500 bg-brand-100 px-4 text-lg text-brand-800" : subdiv ? "min-h-10 min-w-10 border-brand-200 bg-brand-50 px-2 text-sm text-brand-600" : "min-h-14 min-w-14 border-brand-100 bg-white px-4 text-base text-zinc-600"}
                ${isActive ? "scale-110 border-brand-600 bg-brand-200 shadow-md" : ""}
              `}
            >
              {item}
            </span>
          );
        })}
      </div>
      <p className="mt-4 text-sm font-bold text-zinc-600">Bloques grandes = pulso principal. Bloques pequeños = subdivisión. Leelo en voz alta antes de tocar.</p>
    </section>
  );
}

function Feedback({ ok, text, hint }: { ok: boolean; text?: string; hint?: string }) {
  return (
    <div className={`mt-4 rounded-2xl p-4 ${ok ? "bg-brand-100 text-brand-800" : "bg-red-50 text-red-800"}`}>
      <div className="flex items-start gap-3 font-bold">
        {ok ? <CheckCircle2 className="mt-0.5 shrink-0" size={18} /> : <XCircle className="mt-0.5 shrink-0" size={18} />}
        <span>{ok ? (text ?? "Correcto.") : (text ?? "No era esa.")}</span>
      </div>
      {hint && (
        <div className="mt-2 flex items-start gap-2 rounded-xl bg-white/60 p-3">
          <Lightbulb size={14} className="mt-0.5 shrink-0 text-yellow-600" />
          <p className="text-sm font-bold">{hint}</p>
        </div>
      )}
    </div>
  );
}

function QuizExercise({ lesson, exercise, index, onResult }: { lesson: Lesson; exercise: LessonExercise; index: number; onResult: (key: string, result: Result) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const key = exerciseKey(lesson, exercise, index);
  const ok = selected === exercise.answer;
  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    onResult(key, { exercise_key: key, exercise_type: exercise.type, answer: { option }, is_correct: option === exercise.answer, score: option === exercise.answer ? 100 : 0, xp: option === exercise.answer ? exercise.xp : 0 });
  }
  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-5">
      <p className="font-black text-brand-700">{exercise.title} · +{exercise.xp} XP</p><h4 className="mt-2 text-xl font-black">{exercise.prompt}</h4>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{exercise.options?.map((option) => <button key={option} onClick={() => choose(option)} className={`rounded-2xl border-2 p-4 text-left font-bold transition ${selected === option ? (ok ? "border-brand-500 bg-brand-50 text-brand-900" : "border-red-400 bg-red-50 text-red-800") : selected ? "cursor-default border-brand-100 bg-white text-zinc-400" : "border-brand-100 bg-white hover:bg-brand-50"}`}>{option}</button>)}</div>
      {selected && (
        <Feedback
          ok={ok}
          text={ok ? `Correcto.` : `No exactamente.`}
          hint={ok
            ? exercise.explanation
            : `La respuesta correcta es: "${exercise.answer}". ${exercise.explanation ?? ""}`}
        />
      )}
    </div>
  );
}

// ─── Metrónomo humano mejorado con feedback por tap y zona grande ─────────────
function HumanMetronomeExercise({ lesson, exercise, index, onResult }: { lesson: Lesson; exercise: LessonExercise; index: number; onResult: (key: string, result: Result) => void }) {
  const [taps, setTaps] = useState<number[]>([]);
  const [tapFeedback, setTapFeedback] = useState<Array<"ok" | "early" | "late" | null>>([]);
  const [tapAnim, setTapAnim] = useState(false);
  const key = exerciseKey(lesson, exercise, index);
  const bpm = exercise.bpm ?? 80;
  const rhythm = exercise.rhythm;
  const targetHits = rhythm?.abc
    ? audibleHits(hitsFromAbc(rhythm.abc, rhythm.defaultNote ?? "C4"))
    : rhythm?.hits?.length
    ? audibleHits(rhythm.hits)
    : hitsFromSyllables(rhythm?.syllables ?? ["TA", "TA", "TA", "TA"], rhythm?.defaultNote ?? "C4");
  const target = Math.max(1, targetHits.length);
  const passScore = exercise.passScore ?? 72;
  const evaluation = evaluateRhythmTaps(taps, targetHits, bpm);
  const accuracy = evaluation.accuracy;
  const completed = taps.length >= target;
  const ok = completed && accuracy >= passScore;
  const beatMs = (60 / bpm) * 1000;
  const tolerance = beatMs * 0.2;

  const tap = useCallback(() => {
    if (completed) return;
    playNote(rhythm?.defaultNote ?? "C4", 0.18, 0.1);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
    const now = Date.now();
    const next = [...taps, now];
    setTaps(next);
    setTapAnim(true);
    setTimeout(() => setTapAnim(false), 120);

    // Feedback visual de timing del tap
    const tapIndex = next.length - 1;
    if (tapIndex < targetHits.length) {
      const expectedMs = targetHits[tapIndex].beat * beatMs;
      const actualMs = tapIndex === 0 ? 0 : (now - next[0]);
      const diff = actualMs - expectedMs;
      let fb: "ok" | "early" | "late" = "ok";
      if (tapIndex > 0) {
        if (diff < -tolerance) fb = "early";
        else if (diff > tolerance) fb = "late";
      }
      setTapFeedback((prev) => { const arr = [...prev]; arr[tapIndex] = fb; return arr; });
    }

    if (next.length >= target) {
      const finalEvaluation = evaluateRhythmTaps(next, targetHits, bpm);
      onResult(key, {
        exercise_key: key, exercise_type: exercise.type,
        answer: { taps: next.length, bpm, rhythm: rhythm?.label, expectedEvents: targetHits.map((hit) => ({ beat: hit.beat, label: hit.label })) },
        is_correct: finalEvaluation.accuracy >= passScore,
        score: finalEvaluation.accuracy,
        xp: finalEvaluation.accuracy >= passScore ? exercise.xp : Math.round(exercise.xp * 0.35),
        accuracy: finalEvaluation.accuracy
      });
    }
  }, [taps, completed, beatMs, tolerance, bpm, exercise, key, rhythm, passScore, target, targetHits]);

  // Soporte teclado (barra espaciadora)
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.code === "Space" && !e.repeat) { e.preventDefault(); tap(); } }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tap]);

  function reset() {
    setTaps([]); setTapFeedback([]);
    onResult(key, { exercise_key: key, exercise_type: exercise.type, answer: { reset: true }, is_correct: false, score: 0, xp: 0, accuracy: 0 });
  }

  const fbColors = { ok: "bg-brand-400", early: "bg-yellow-400", late: "bg-orange-400" };

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-black text-brand-700">{exercise.title} · +{exercise.xp} XP</p>
          <h4 className="mt-2 text-xl font-black">{exercise.prompt}</h4>
        </div>
        <button onClick={() => playRhythmPattern(targetHits, bpm, rhythm?.defaultNote ?? "C4", { metronome: true, timeSignature: timeSignatureFromAbc(rhythm?.abc), totalBeats: rhythm?.abc ? totalQuarterBeatsFromAbc(rhythm.abc) : undefined, countInBars: 1 })} className="btn-audio">
          <Volume2 className="mr-2" /> Cuenta + referencia
        </button>
      </div>

      {/* Feedback visual de taps */}
      <div className="mt-4 flex flex-wrap gap-2">
        {targetHits.map((hit, i) => {
          const fb = tapFeedback[i];
          const tapped = i < taps.length;
          return (
            <div key={`${hit.beat}-${i}`} className="flex flex-col items-center gap-1">
              <div className={`h-8 w-8 rounded-full border-2 transition-all ${tapped ? (fb ? `${fbColors[fb]} border-transparent` : "bg-brand-400 border-transparent") : "border-brand-200 bg-brand-50"}`} />
              <span className="text-xs font-black text-zinc-500">{hit.label ?? `${hit.beat}`}</span>
            </div>
          );
        })}
      </div>
      {taps.length > 0 && !completed && (
        <p className="mt-1 text-xs font-bold text-zinc-500">
          Verde = en tiempo · Amarillo = adelantado · Naranja = atrasado
        </p>
      )}

      {/* Zona de tap grande */}
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_.75fr]">
        <button
          onClick={tap}
          disabled={completed}
          className={`rounded-[2rem] bg-brand-500 px-8 py-14 text-4xl font-black text-white shadow-duo transition active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 ${tapAnim ? "scale-95" : ""}`}
        >
          TAP
          <span className="mt-3 block text-base">{taps.length}/{target} ataques</span>
          <span className="mt-1 block text-xs font-bold opacity-80">Espacio o click · {rhythm?.defaultNote ?? "C4"}</span>
        </button>

        <div className="rounded-3xl bg-brand-50 p-5">
          <p className="text-sm font-black uppercase tracking-wide text-brand-700">Metrónomo humano</p>
          <p className="mt-2 text-3xl font-black">{bpm} BPM</p>
          <p className="mt-2 text-sm text-zinc-600">Primero escuchá la referencia. Después tocá la figura completa, no solo el pulso.</p>
          {completed ? (
            <div className={`mt-4 rounded-2xl border p-4 ${ok ? "state-success" : "state-error"}`}>
              <p className="font-black">Intento terminado · precisión {accuracy}%</p>
              <p className="text-sm font-bold">Error prom: {evaluation.averageErrorMs} ms · meta: {passScore}%</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={reset} className="btn-secondary px-4 py-2 text-sm"><RotateCcw className="mr-2" size={16} /> Reintentar</button>
                <button onClick={() => playRhythmPattern(targetHits, bpm, rhythm?.defaultNote ?? "C4", { metronome: true, timeSignature: timeSignatureFromAbc(rhythm?.abc), totalBeats: rhythm?.abc ? totalQuarterBeatsFromAbc(rhythm.abc) : undefined, countInBars: 1 })} className="btn-audio px-4 py-2 text-sm"><Volume2 className="mr-2" size={16} /> Escuchar referencia</button>
              </div>
              {!ok && (
                <div className="mt-3 rounded-xl bg-white/70 p-3">
                  <p className="text-xs font-bold leading-relaxed">
                    {evaluation.averageErrorMs > 100
                      ? "Desvío alto. Marcá el pulso con el pie antes de tapear: eso ancla el cuerpo al metrónomo."
                      : evaluation.averageErrorMs > 60
                      ? "Vas bien. Anticipá el clic en lugar de reaccionar a él: tapea justo antes de escucharlo."
                      : "Muy cerca. Bajá 5 BPM y repetí hasta que se sienta automático, después subís."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button onClick={reset} className="mt-4 flex items-center gap-2 font-black text-brand-700">
              <RotateCcw size={18} /> Reiniciar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChoicePatternExercise({ lesson, exercise, index, onResult }: { lesson: Lesson; exercise: LessonExercise; index: number; onResult: (key: string, result: Result) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const key = exerciseKey(lesson, exercise, index);
  const ok = selected === exercise.answer;
  function choose(value: string) {
    setSelected(value);
    onResult(key, { exercise_key: key, exercise_type: exercise.type, answer: { pattern: value }, is_correct: value === exercise.answer, score: value === exercise.answer ? 100 : 0, xp: value === exercise.answer ? exercise.xp : 0 });
  }
  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-5"><p className="font-black text-brand-700">{exercise.title} · +{exercise.xp} XP</p><h4 className="mt-2 text-xl font-black">{exercise.prompt}</h4><div className="mt-4 grid gap-3">{(exercise.choices ?? []).map((choice) => { const value = choice.join(" "); return <button key={value} onClick={() => choose(value)} className={`flex flex-wrap gap-2 rounded-2xl border-2 p-4 transition ${selected === value ? (ok ? "border-brand-500 bg-brand-50" : "border-red-400 bg-red-50") : "border-brand-100 bg-white hover:bg-brand-50"}`}>{choice.map((item, i) => <span key={`${item}-${i}`} className="rounded-xl bg-brand-100 px-3 py-2 font-black text-brand-800">{item}</span>)}</button>; })}</div>{selected && <Feedback ok={ok} text={exercise.explanation} />}</div>
  );
}

function shuffleWithCorrect(options: RhythmOption[], correctIndex: number, seed: string): { shuffled: RhythmOption[]; newCorrect: number } {
  const correct = options[correctIndex];
  const others = options.filter((_, i) => i !== correctIndex);
  const random = seededRandom(seed);
  const shuffledOthers = shuffleWithSeed(others, `${seed}-others`);
  const newCorrectPos = Math.floor(random() * (shuffledOthers.length + 1));
  const shuffled = [
    ...shuffledOthers.slice(0, newCorrectPos),
    correct,
    ...shuffledOthers.slice(newCorrectPos),
  ];

  return { shuffled, newCorrect: newCorrectPos };
}

function DictationExercise({ lesson, exercise, index, onResult }: { lesson: Lesson; exercise: LessonExercise; index: number; onResult: (key: string, result: Result) => void }) {
  const key = exerciseKey(lesson, exercise, index);
  const rawOptions = exercise.rhythmOptions ?? [];
  const rawCorrect = exercise.correctIndex ?? 0;
  const bpm = lesson.level > 4 ? 88 : 78;

  // Orden estable entre servidor y cliente para evitar errores de hidratación en Next.
  // La respuesta correcta sigue cambiando de posición según la lección/ejercicio, pero no usa Math.random durante el render.
  const { shuffled: options, newCorrect: correctIndex } = useMemo(
    () => shuffleWithCorrect(rawOptions, rawCorrect, `${lesson.slug}-${index}-${exercise.type}-dictation-options`),
    [rawOptions, rawCorrect, lesson.slug, index, exercise.type]
  );
  const [selected, setSelected] = useState<number | null>(null);
  const ok = selected === correctIndex;

  function hitsFor(option?: RhythmOption) {
    if (option?.abc) return hitsFromAbc(option.abc, option.defaultNote ?? "C4");
    return option?.hits?.length ? option.hits : hitsFromSyllables(option?.syllables ?? ["TA"], option?.defaultNote ?? "C4");
  }

  function playOption(option?: RhythmOption) {
    playRhythmPattern(hitsFor(option), bpm, option?.defaultNote ?? "C4", {
      metronome: true,
      timeSignature: timeSignatureFromAbc(option?.abc),
      totalBeats: option?.abc ? totalQuarterBeatsFromAbc(option.abc) : undefined,
      countInBars: 1,
    });
  }

  function choose(i: number, option: RhythmOption) {
    if (selected !== null) return;
    setSelected(i);
    onResult(key, { exercise_key: key, exercise_type: exercise.type, answer: { selectedIndex: i, label: option.label, abc: option.abc }, is_correct: i === correctIndex, score: i === correctIndex ? 100 : 0, xp: i === correctIndex ? exercise.xp : Math.round(exercise.xp * 0.15) });
  }

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-black text-brand-700">{exercise.title} · +{exercise.xp} XP</p>
          <h4 className="mt-2 text-xl font-black">{exercise.prompt}</h4>
          <p className="mt-2 max-w-2xl text-sm font-bold text-zinc-600">
            Escuchá el patrón con piano y clic de metrónomo. El clic sigue sonando durante los silencios; ahí no tenés que tocar ninguna nota.
          </p>
        </div>
        <button onClick={() => playOption(options[correctIndex])} className="btn-audio w-full sm:w-auto">
          <Headphones className="mr-2" size={16} /> Escuchar dictado con piano + clic
        </button>
      </div>

      {/* Options: one column on mobile for readable partituras, 2 columns from small screens up. */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          const isCorrect = selected !== null && i === correctIndex;
          const isWrong = selected === i && i !== correctIndex;

          return (
            <div
              key={`${option.label}-${i}`}
              className={`rounded-2xl border-2 p-4 text-left transition ${isCorrect ? "border-brand-500 bg-brand-50" : isWrong ? "border-red-400 bg-red-50" : "border-brand-100 bg-zinc-50 hover:bg-brand-50"}`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-1">
                <span className="text-xs font-black text-zinc-700">Opción {i + 1}</span>
                <span className="max-w-[100px] truncate rounded-full bg-white px-1.5 py-px text-[10px] font-black text-zinc-500">{option.label}</span>
              </div>

              <AbcStaff abc={option.abc} />

              <div className="mt-1.5 flex flex-wrap gap-1">
                {option.syllables.map((s, j) => (
                  <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black text-brand-800" key={`${s}-${j}`}>{s}</span>
                ))}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => playOption(option)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100"
                >
                  <Volume2 className="mr-2" size={14} /> Escuchar opción
                </button>
                <button
                  type="button"
                  onClick={() => choose(i, option)}
                  disabled={selected !== null}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-3 py-2 text-xs font-black text-white transition hover:bg-brand-700 disabled:cursor-default disabled:opacity-60"
                >
                  Elegir esta partitura
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {selected !== null && (
        <Feedback
          ok={ok}
          text={ok
            ? `Correcto — era ${options[correctIndex]?.label}.`
            : `La correcta era la opción ${correctIndex + 1}: ${options[correctIndex]?.label}.`}
          hint={ok
            ? `Escuchaste la densidad rítmica correcta. Eso es el oído activo funcionando.`
            : `Reproducí el ritmo de nuevo y fijate en cuántos sonidos hay por pulso. ${options[selected ?? 0]?.label} tiene ${options[selected ?? 0]?.syllables?.length ?? "?"} sílabas; ${options[correctIndex]?.label} tiene ${options[correctIndex]?.syllables?.length ?? "?"}.`}
        />
      )}
    </div>
  );
}

function TakadimiExercise({ lesson, exercise, index, onResult }: { lesson: Lesson; exercise: LessonExercise; index: number; onResult: (key: string, result: Result) => void }) {
  const [done, setDone] = useState(false);
  const key = exerciseKey(lesson, exercise, index);
  function complete() { setDone(true); onResult(key, { exercise_key: key, exercise_type: exercise.type, answer: { read: true, pattern: exercise.pattern }, is_correct: true, score: 100, xp: exercise.xp }); }
  return <div className="rounded-3xl border border-brand-100 bg-white p-5"><p className="font-black text-brand-700">{exercise.title} · +{exercise.xp} XP</p><h4 className="mt-2 text-xl font-black">{exercise.prompt}</h4><div className="mt-4 flex flex-wrap gap-3">{exercise.pattern?.map((p, i) => <span key={`${p}-${i}`} className="rounded-2xl border-2 border-brand-500 bg-brand-100 px-4 py-3 text-lg font-black text-brand-800">{p}</span>)}</div><button onClick={complete} className="btn-primary mt-5"><Sparkles className="mr-2" /> Lo dije y lo toqué</button>{done && <Feedback ok text="El paso vocal conecta teoría, lectura y cuerpo." />}</div>;
}

function ExerciseRenderer(props: { lesson: Lesson; exercise: LessonExercise; index: number; onResult: (key: string, result: Result) => void }) {
  if (props.exercise.type === "quiz") return <QuizExercise {...props} />;
  if (props.exercise.type === "human_metronome" || props.exercise.type === "tap_pulse") return <HumanMetronomeExercise {...props} />;
  if (props.exercise.type === "dictation") return <DictationExercise {...props} />;
  if (props.exercise.type === "takadimi") return <TakadimiExercise {...props} />;
  if (props.exercise.type === "listen_choose" || props.exercise.type === "complete_bar") return <ChoicePatternExercise {...props} />;
  if (props.exercise.type === "call_response") return <ExerciseCallResponse {...props} />;
  return null;
}

export function LessonExperience({ module }: Props) {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [saving, setSaving] = useState(false);
  const [reward, setReward] = useState<CompletionReward | null>(null);
  const [showResults, setShowResults] = useState(false);
  const lesson = module.lessons[lessonIndex];
  const attempts = useMemo(() => Object.values(results).filter((r) => r.exercise_key.startsWith(lesson.slug)), [results, lesson.slug]);
  const score = attempts.length ? Math.round(attempts.reduce((sum, result) => sum + result.score, 0) / attempts.length) : 0;
  const earnedXp = attempts.reduce((sum, result) => sum + result.xp, 0) + (attempts.length >= lesson.exercises.length ? lesson.xp : 0);
  const completedAll = attempts.length >= lesson.exercises.length;
  const hasNext = lessonIndex < module.lessons.length - 1;

  const { track } = useAnalytics();
  // Track lesson start
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function setResult(key: string, result: Result) {
    setResults((current) => ({ ...current, [key]: result }));
    track("exercise_result", { type: result.exercise_type, is_correct: result.is_correct, score: result.score, lesson_slug: lesson.slug });
  }

  async function save() {
    setSaving(true);
    try {
      const data = await completeLesson({ moduleSlug: module.slug, lessonSlug: lesson.slug, score, xp: earnedXp, attempts });
      setReward(data);
      setShowResults(true);
      track("lesson_completed", { lesson_slug: lesson.slug, module_slug: module.slug, score, xp: earnedXp });
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally { setSaving(false); }
  }

  function goNextLesson() {
    if (hasNext) {
      setLessonIndex((i) => i + 1);
      setResults({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[.42fr_1fr]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card"><p className="pill">{module.title}</p><h2 className="mt-4 text-3xl font-black">Camino progresivo</h2><p className="mt-2 text-zinc-600">Cada lección combina teoría, video, dictado, metrónomo humano y práctica vocal.</p><div className="mt-5 space-y-2">{module.lessons.map((item, i) => <button key={item.slug} onClick={() => { setLessonIndex(i); setResults({}); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full rounded-2xl p-4 text-left font-black transition ${i === lessonIndex ? "bg-brand-500 text-white shadow-duo" : "bg-brand-50 text-brand-900 hover:bg-brand-100"}`}><span className="mr-2">{i + 1}.</span>{item.title}<span className="ml-2 text-xs opacity-80">{item.difficulty}</span></button>)}</div></div>
        <div className="card"><p className="text-sm font-black uppercase text-brand-700">Progreso de la lección</p><div className="mt-3 h-4 overflow-hidden rounded-full bg-brand-100"><div className="h-full bg-brand-500 transition-all" style={{ width: `${Math.round((attempts.length / Math.max(1, lesson.exercises.length)) * 100)}%` }} /></div><div className="mt-4 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-brand-50 p-3 font-black text-brand-800">Score {score}%</div><div className="rounded-2xl bg-yellow-50 p-3 font-black text-yellow-800">+{earnedXp} XP</div></div></div>
      </aside>
      <main className="space-y-6">
        <section className="card bg-gradient-to-br from-brand-50 to-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="pill">Nivel {lesson.level} · {lesson.difficulty} · {lesson.estimatedMinutes} min</p><h1 className="mt-4 text-4xl font-black md:text-5xl">{lesson.title}</h1><p className="mt-3 max-w-2xl text-lg text-zinc-600">{lesson.description}</p></div><button className="btn-secondary" onClick={() => navigator.share?.({ title: lesson.title, text: `Estoy practicando ${lesson.title} en RitmoLab`, url: location.href })}><Share2 className="mr-2" /> Compartir</button></div><div className="mt-5 flex flex-wrap gap-2">{lesson.skills.map((skill) => <span key={skill} className="rounded-full bg-white px-3 py-1 text-sm font-black text-brand-800">{skill}</span>)}</div></section>
        <section className="card"><div className="flex items-center gap-3"><Target className="text-brand-700" /><div><p className="text-sm font-black uppercase text-brand-700">Objetivo</p><h3 className="text-xl font-black">{lesson.objective}</h3></div></div><div className="mt-5 grid gap-3">{lesson.theory.map((text, i) => <p key={i} className="rounded-2xl bg-zinc-50 p-4 leading-relaxed text-zinc-700">{text}</p>)}</div></section>
        <YoutubeBlock lesson={lesson} />
        <PatternBoard pattern={lesson.visualPattern} bpm={lesson.exercises.find(e => e.bpm)?.bpm} />
        <section className="grid gap-4 md:grid-cols-2"><div className="card"><div className="flex items-center gap-3"><Lightbulb className="text-yellow-600" /><h3 className="text-xl font-black">Tip docente</h3></div><p className="mt-3 text-zinc-700">{lesson.teacherTip}</p></div><div className="card"><div className="flex items-center gap-3"><MessageCircleQuestion className="text-[#ff4b4b]" /><h3 className="text-xl font-black">Error común</h3></div><p className="mt-3 text-zinc-700">{lesson.commonMistake}</p></div></section>
        <section className="card"><div className="mb-5 flex items-center gap-3"><Trophy className="text-brand-700" /><div><p className="text-sm font-black uppercase text-brand-700">Juegos rítmicos</p><h3 className="text-2xl font-black">Demostrá que lo entendiste</h3></div></div><div className="space-y-5">{lesson.exercises.map((exercise, index) => <ExerciseRenderer key={`${lesson.slug}-${index}`} lesson={lesson} exercise={exercise} index={index} onResult={setResult} />)}</div></section>
        <section className="card"><h3 className="text-2xl font-black">Aplicación musical</h3><p className="mt-3 text-zinc-700">{lesson.realMusicExample}</p><div className="mt-4 rounded-2xl bg-brand-50 p-4 font-bold text-brand-900">Reflexión: {lesson.reflection}</div></section>
        <div className="card flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-black uppercase text-brand-700">Cierre</p><h3 className="text-2xl font-black">{completedAll ? "Listo para guardar" : "Completá todos los juegos"}</h3><p className="mt-1 text-zinc-600">Score {score}% · XP potencial {earnedXp}</p></div>
          <div className="flex flex-wrap gap-3">
            <button onClick={save} disabled={!completedAll || saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">{saving ? <Loader2 className="mr-2 animate-spin" /> : <CheckCircle2 className="mr-2" />} Completar y guardar XP</button>
            {completedAll && hasNext && (
              <button onClick={goNextLesson} className="btn-secondary">
                Siguiente lección <ArrowRight className="ml-2" size={18} />
              </button>
            )}
          </div>
        </div>
      </main>
      {showResults && (
        <ResultsScreen
          lesson={lesson}
          module={module}
          score={score}
          xp={earnedXp}
          hasNext={hasNext}
          onRetry={() => { setShowResults(false); setResults({}); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onNext={() => { setShowResults(false); goNextLesson(); }}
        />
      )}
      <RewardModal reward={reward} onClose={() => setReward(null)} />
    </div>
  );
}

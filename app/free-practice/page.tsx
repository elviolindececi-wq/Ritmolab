"use client";

import { useState, useCallback, useEffect } from "react";
import { RotateCcw, Play, Volume2, Zap, CheckCircle2 } from "lucide-react";
import {
  generatePattern,
  generateDistractors,
  patternToHits,
  SKILL_LABELS,
  type TimeSignature,
  type SkillId,
  type RhythmPattern,
} from "@/lib/engine";
import { AbcStaff } from "@/components/rhythm/abc-staff";
import { PianoKeyboard, type PianoNoteEvent } from "@/components/audio/piano-keyboard";
import { playRhythmPattern, evaluateRhythmTaps, type NoteName, primeAudioEngine } from "@/lib/rhythm-engine";
import { saveFreePracticeSession } from "@/lib/progress";

const SKILLS_FOR_FREE: SkillId[] = ["pulse", "reading", "dictation", "subdivision", "memory", "sight_reading", "groove"];
const TIME_SIGS: TimeSignature[] = ["4/4", "3/4", "2/4", "3/8", "6/8"];

type PianoAttempt = PianoNoteEvent;

type PracticeResult = {
  accuracy: number;
  timingAccuracy?: number;
  noteAccuracy?: number;
  averageErrorMs?: number;
};

type ExerciseProps = {
  pattern: RhythmPattern;
  onScore: (score: number) => void;
  onNewPattern: () => void;
};

function targetNoteFor(pattern: RhythmPattern): NoteName {
  return (pattern.slots.find(slot => !slot.figure.includes("rest") && slot.note)?.note ?? "C4") as NoteName;
}

function evaluatePianoAttempt(events: PianoAttempt[], pattern: RhythmPattern) {
  const hits = patternToHits(pattern);
  const audibleHits = hits.filter(hit => !hit.rest);
  const timing = evaluateRhythmTaps(events.map(event => event.at), hits, pattern.bpm);

  if (events.length === 0 || audibleHits.length === 0) {
    return {
      accuracy: 0,
      timingAccuracy: timing.accuracy,
      noteAccuracy: 0,
      averageErrorMs: timing.averageErrorMs,
      expectedCount: audibleHits.length,
      receivedCount: events.length,
    };
  }

  const count = Math.min(events.length, audibleHits.length);
  const correctNotes = Array.from({ length: count }, (_, index): number => {
    const expectedNote = (audibleHits[index].note ?? "C4") as NoteName;
    return events[index].note === expectedNote ? 1 : 0;
  }).reduce<number>((sum, value) => sum + value, 0);

  const noteAccuracy = Math.round((correctNotes / audibleHits.length) * 100);
  const accuracy = Math.round(timing.accuracy * 0.7 + noteAccuracy * 0.3);

  return {
    accuracy,
    timingAccuracy: timing.accuracy,
    noteAccuracy,
    averageErrorMs: timing.averageErrorMs,
    expectedCount: audibleHits.length,
    receivedCount: events.length,
  };
}

function ResultActions({ result, onRetry, onNewPattern }: { result: PracticeResult; onRetry: () => void; onNewPattern: () => void }) {
  const good = result.accuracy >= 75;

  return (
    <div className={`rounded-3xl border p-4 ${good ? "border-brand-100 bg-brand-50 text-brand-900" : "border-rose-100 bg-rose-50 text-rose-900"}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">
            <CheckCircle2 size={16} /> Intento terminado
          </p>
          <p className="mt-1 text-lg font-black">
            Precisión total: {result.accuracy}%
            {typeof result.timingAccuracy === "number" && <> · Ritmo: {result.timingAccuracy}%</>}
            {typeof result.noteAccuracy === "number" && <> · Nota: {result.noteAccuracy}%</>}
          </p>
          {typeof result.averageErrorMs === "number" && (
            <p className="mt-1 text-sm font-bold opacity-80">Error promedio: {result.averageErrorMs}ms</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onRetry} className="btn-secondary px-4 py-2 text-sm">
            Reintentar
          </button>
          <button type="button" onClick={onNewPattern} className="btn-primary px-4 py-2 text-sm">
            Nuevo patrón
          </button>
        </div>
      </div>
    </div>
  );
}

function SilenceAndMetronomeHint({ pattern }: { pattern: RhythmPattern }) {
  const hasRests = pattern.slots.some(slot => slot.figure.includes("rest") || slot.label === "—");

  return (
    <div className="rounded-3xl border border-sky-100 bg-sky-50/80 p-4 text-sm font-bold text-sky-950">
      <p className="font-black">Cómo tocar silencios y usar el metrónomo</p>
      <p className="mt-1">
        El metrónomo marca el pulso durante todo el ejercicio. Cuando aparece un silencio, no toques ninguna tecla: mantené el pulso internamente y volvé a entrar en la siguiente nota.
      </p>
      {hasRests && (
        <p className="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-black text-sky-900">
          Este patrón tiene silencios: el acierto también depende de no tocar en esos espacios.
        </p>
      )}
    </div>
  );
}


function ConfigPanel({
  difficulty,
  bpm,
  timeSig,
  skill,
  exerciseType,
  onChange,
}: {
  difficulty: number;
  bpm: number;
  timeSig: TimeSignature;
  skill: SkillId;
  exerciseType: string;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="card space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-brand-700">Modo libre</p>
        <h3 className="mt-1 text-lg font-black">Configurar práctica</h3>
      </div>

      <div>
        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">Habilidad</label>
        <div className="flex flex-wrap gap-2">
          {SKILLS_FOR_FREE.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onChange("skill", s)}
              className={`rounded-2xl px-3 py-1.5 text-xs font-black transition ${skill === s ? "bg-brand-500 text-white shadow-sm" : "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50"}`}
            >
              {SKILL_LABELS[s].emoji} {SKILL_LABELS[s].name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">Tipo de ejercicio</label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "metronome", label: "🥁 Metrónomo" },
            { key: "dictation", label: "👂 Dictado" },
            { key: "call_response", label: "🧠 Call & Response" },
            { key: "sight_reading", label: "👁 Lectura a 1ª vista" },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange("exerciseType", t.key)}
              className={`rounded-2xl px-3 py-1.5 text-xs font-black transition ${exerciseType === t.key ? "bg-brand-500 text-white shadow-sm" : "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">BPM: {bpm}</label>
          <input type="range" min={50} max={180} step={2} value={bpm} onChange={e => onChange("bpm", Number(e.target.value))} className="w-full accent-brand-500" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">Dificultad: {difficulty}/10</label>
          <input type="range" min={1} max={10} step={1} value={difficulty} onChange={e => onChange("difficulty", Number(e.target.value))} className="w-full accent-brand-500" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">Compás</label>
        <div className="flex gap-2">
          {TIME_SIGS.map(ts => (
            <button
              key={ts}
              type="button"
              onClick={() => onChange("timeSig", ts)}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${timeSig === ts ? "bg-brand-500 text-white" : "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50"}`}
            >
              {ts}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetronomeExercise({ pattern, onScore, onNewPattern }: ExerciseProps) {
  const [events, setEvents] = useState<PianoAttempt[]>([]);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const hits = patternToHits(pattern);
  const audibleHits = hits.filter(hit => !hit.rest);
  const currentTargetNote = (audibleHits[Math.min(events.length, Math.max(0, audibleHits.length - 1))]?.note ?? targetNoteFor(pattern)) as NoteName;
  const done = Boolean(result);

  useEffect(() => {
    setEvents([]);
    setResult(null);
  }, [pattern.id]);

  const retry = useCallback(() => {
    setEvents([]);
    setResult(null);
  }, []);

  const registerNote = useCallback((note?: NoteName) => {
    if (done) return;

    setEvents(prev => {
      const expectedNote = (audibleHits[Math.min(prev.length, Math.max(0, audibleHits.length - 1))]?.note ?? targetNoteFor(pattern)) as NoteName;
      const playedNote = note ?? expectedNote;
      const next = [...prev, { note: playedNote, at: performance.now() }];

      if (next.length >= audibleHits.length) {
        const ev = evaluatePianoAttempt(next, pattern);
        const finalResult = {
          accuracy: ev.accuracy,
          timingAccuracy: ev.timingAccuracy,
          noteAccuracy: ev.noteAccuracy,
          averageErrorMs: ev.averageErrorMs,
        };
        setResult(finalResult);
        window.setTimeout(() => onScore(ev.accuracy), 80);
      }

      return next;
    });
  }, [audibleHits, audibleHits.length, done, onScore, pattern]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (!done) registerNote();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [done, registerNote]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-brand-100 bg-brand-50/70 p-4">
        <p className="text-sm font-black text-brand-900">Qué hacer</p>
        <p className="mt-1 text-sm font-bold text-brand-800/80">Escuchá la referencia y repetí el patrón tocando el piano. Se mide timing + nota correcta.</p>
      </div>

      <SilenceAndMetronomeHint pattern={pattern} />

      <div className="grid gap-3 md:grid-cols-2">
        <button type="button" onClick={() => playRhythmPattern(hits, pattern.bpm, currentTargetNote, { totalBeats: pattern.totalBeats, metronome: true, timeSignature: pattern.timeSignature, countInBars: 1 })} className="btn-audio w-full justify-center">
          <Volume2 className="mr-2" size={16} /> Piano + metrónomo
        </button>
        <button type="button" onClick={() => playRhythmPattern(hits, pattern.bpm, currentTargetNote, { totalBeats: pattern.totalBeats, metronome: true, timeSignature: pattern.timeSignature, countInBars: 1, metronomeOnly: true })} className="btn-audio w-full justify-center">
          <Play className="mr-2" size={16} /> Metrónomo solo
        </button>
      </div>

      <PianoKeyboard
        targetNote={currentTargetNote}
        evaluationLocked={done}
        instruction="Tocá la melodía escrita: la app evalúa tanto el ritmo como la nota. Si aparece silencio, no toques: el metrónomo sigue marcando el pulso."
        onNotePlay={({ note }) => registerNote(note)}
      />

      <div className="rounded-2xl bg-zinc-50 p-3 text-sm font-black text-zinc-600">
        Progreso: {Math.min(events.length, audibleHits.length)}/{audibleHits.length} notas · barra espaciadora toca la próxima nota internamente, pero intentá leerla desde la partitura.
      </div>

      {result && <ResultActions result={result} onRetry={retry} onNewPattern={onNewPattern} />}
    </div>
  );
}

function DictationExercise({ pattern, onScore, onNewPattern }: ExerciseProps) {
  const [options, setOptions] = useState<RhythmPattern[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<PracticeResult | null>(null);

  useEffect(() => {
    const distractors = generateDistractors(pattern, 3);
    const pos = Math.floor(Math.random() * 4);
    setOptions([...distractors.slice(0, pos), pattern, ...distractors.slice(pos)]);
    setSelected(null);
    setResult(null);
  }, [pattern]);

  const correctIdx = options.indexOf(pattern);

  function choose(i: number) {
    if (selected !== null) return;
    const score = i === correctIdx ? 100 : 0;
    setSelected(i);
    setResult({ accuracy: score });
    onScore(score);
  }

  function retry() {
    setSelected(null);
    setResult(null);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-brand-100 bg-brand-50/70 p-4">
        <p className="text-sm font-black text-brand-900">Dictado con partitura · +24 XP</p>
        <p className="mt-1 text-sm font-bold text-brand-800/80">Escuchá el patrón con metrónomo, mirá las partituras y elegí la que corresponde. En los silencios no suena la nota, pero el pulso sigue.</p>
      </div>

      <button type="button" onClick={() => playRhythmPattern(patternToHits(pattern), pattern.bpm, targetNoteFor(pattern), { totalBeats: pattern.totalBeats, metronome: true, timeSignature: pattern.timeSignature, countInBars: 1 })} className="btn-primary w-full justify-center">
        <Volume2 className="mr-2" size={16} /> Reproducir piano + clic de metrónomo
      </button>

      <div className="grid gap-3 md:grid-cols-2">
        {options.map((opt, i) => {
          const isCorrect = selected !== null && i === correctIdx;
          const isWrong = selected === i && i !== correctIdx;
          return (
            <div
              key={opt.id}
              className={`rounded-3xl border-2 p-3 text-left transition ${
                isCorrect ? "border-brand-500 bg-brand-50" : isWrong ? "border-rose-300 bg-rose-50" : "border-brand-100 bg-white hover:bg-brand-50/60"
              }`}
            >
              <button type="button" onClick={() => choose(i)} disabled={selected !== null} className="block w-full text-left disabled:cursor-default">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500">Opción {i + 1}</p>
                  <span className="rounded-full bg-zinc-50 px-2 py-1 text-[10px] font-black text-zinc-500">{opt.label}</span>
                </div>
                <AbcStaff abc={opt.abc} />
                <p className="mt-1 text-[10px] font-black text-brand-700">{opt.syllables.join(" ")}</p>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  playRhythmPattern(patternToHits(opt), opt.bpm, targetNoteFor(opt), { totalBeats: opt.totalBeats, metronome: true, timeSignature: opt.timeSignature, countInBars: 1 });
                }}
                className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100"
              >
                <Volume2 className="mr-2" size={14} /> Escuchar opción + metrónomo
              </button>
            </div>
          );
        })}
      </div>

      {selected !== null && result && (
        <ResultActions result={result} onRetry={retry} onNewPattern={onNewPattern} />
      )}
    </div>
  );
}

function SightReadingExercise({ pattern, onScore, onNewPattern }: ExerciseProps) {
  const [events, setEvents] = useState<PianoAttempt[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const hits = patternToHits(pattern);
  const audibleHits = hits.filter(hit => !hit.rest);
  const currentTargetNote = (audibleHits[Math.min(events.length, Math.max(0, audibleHits.length - 1))]?.note ?? targetNoteFor(pattern)) as NoteName;
  const done = Boolean(result);

  useEffect(() => {
    setEvents([]);
    setRevealed(false);
    setResult(null);
  }, [pattern.id]);

  const retry = useCallback(() => {
    setEvents([]);
    setRevealed(true);
    setResult(null);
  }, []);

  const registerNote = useCallback((note?: NoteName) => {
    if (done || !revealed) return;

    setEvents(prev => {
      const expectedNote = (audibleHits[Math.min(prev.length, Math.max(0, audibleHits.length - 1))]?.note ?? targetNoteFor(pattern)) as NoteName;
      const playedNote = note ?? expectedNote;
      const next = [...prev, { note: playedNote, at: performance.now() }];
      if (next.length >= audibleHits.length) {
        const ev = evaluatePianoAttempt(next, pattern);
        const finalResult = {
          accuracy: ev.accuracy,
          timingAccuracy: ev.timingAccuracy,
          noteAccuracy: ev.noteAccuracy,
          averageErrorMs: ev.averageErrorMs,
        };
        setResult(finalResult);
        window.setTimeout(() => onScore(ev.accuracy), 80);
      }
      return next;
    });
  }, [audibleHits, audibleHits.length, done, onScore, pattern, revealed]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (!done && revealed) registerNote();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [done, registerNote, revealed]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-zinc-50 p-4">
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">Partitura — leé antes de tocar</p>
        <AbcStaff abc={pattern.abc} />
        <div className="mt-2 flex flex-wrap gap-2">
          {pattern.syllables.map((s, i) => <span key={i} className="rounded-lg bg-white px-2 py-1 text-xs font-black text-brand-800">{s}</span>)}
        </div>
      </div>

      <SilenceAndMetronomeHint pattern={pattern} />

      {!revealed ? (
        <div className="grid gap-3 md:grid-cols-2">
          <button type="button" onClick={() => playRhythmPattern(hits, pattern.bpm, currentTargetNote, { totalBeats: pattern.totalBeats, metronome: true, timeSignature: pattern.timeSignature, countInBars: 1 })} className="btn-audio w-full justify-center">
            <Volume2 className="mr-2" size={16} /> Escuchar piano + metrónomo
          </button>
          <button type="button" onClick={() => setRevealed(true)} className="btn-primary w-full justify-center">
            <Play className="mr-2" size={16} /> Listo — empezar intento con piano
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <button type="button" onClick={() => playRhythmPattern(hits, pattern.bpm, currentTargetNote, { totalBeats: pattern.totalBeats, metronome: true, timeSignature: pattern.timeSignature, countInBars: 1 })} className="btn-audio w-full justify-center">
              <Volume2 className="mr-2" size={16} /> Escuchar guía completa
            </button>
            <button type="button" onClick={() => playRhythmPattern(hits, pattern.bpm, currentTargetNote, { totalBeats: pattern.totalBeats, metronome: true, timeSignature: pattern.timeSignature, countInBars: 1, metronomeOnly: true })} className="btn-audio w-full justify-center">
              <Play className="mr-2" size={16} /> Metrónomo para tocar encima
            </button>
          </div>
          <PianoKeyboard
            targetNote={currentTargetNote}
            showTargetNote={false}
            evaluationLocked={done}
            instruction="Leé la melodía en la partitura y tocala en el piano. No mostramos la próxima nota para que practiques lectura real. En silencios no se toca nada."
            onNotePlay={({ note }) => registerNote(note)}
          />
          <div className="rounded-2xl bg-zinc-50 p-3 text-sm font-black text-zinc-600">
            Progreso: {Math.min(events.length, audibleHits.length)}/{audibleHits.length} notas · barra espaciadora toca la próxima nota internamente, pero intentá leerla desde la partitura.
          </div>
          {result && <ResultActions result={result} onRetry={retry} onNewPattern={onNewPattern} />}
        </>
      )}
    </div>
  );
}

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

  useEffect(() => {
    primeAudioEngine();
    const params = new URLSearchParams(window.location.search);
    const requestedSkill = params.get("skill") as SkillId | null;
    const requestedType = params.get("type");
    const requestedBpm = Number(params.get("bpm"));
    const requestedDifficulty = Number(params.get("difficulty"));
    const requestedTimeSig = params.get("timeSig") as TimeSignature | null;

    setConfig(prev => {
      const next = { ...prev };
      if (requestedSkill && SKILLS_FOR_FREE.includes(requestedSkill)) next.skill = requestedSkill;
      if (["metronome", "dictation", "call_response", "sight_reading"].includes(requestedType ?? "")) next.exerciseType = requestedType as string;
      if (Number.isFinite(requestedBpm) && requestedBpm >= 40 && requestedBpm <= 220) next.bpm = requestedBpm;
      if (Number.isFinite(requestedDifficulty) && requestedDifficulty >= 1 && requestedDifficulty <= 10) next.difficulty = requestedDifficulty;
      if (requestedTimeSig && TIME_SIGS.includes(requestedTimeSig)) next.timeSig = requestedTimeSig;
      return next;
    });
    setPattern(null);
  }, []);

  function generate() {
    const p = generatePattern({
      difficulty: config.difficulty,
      timeSignature: config.timeSig,
      bpm: config.bpm,
      bars: config.difficulty <= 3 ? 2 : config.difficulty <= 7 ? 3 : 4,
      skills: [config.skill],
    });
    setPattern(p);
    setExerciseCount(c => c + 1);
  }

  function handleScore(score: number, scoredPattern: RhythmPattern) {
    setSessionScores(prev => [...prev, score]);
    saveFreePracticeSession({
      skillId: config.skill,
      accuracy: score,
      bpm: config.bpm,
      exerciseType: config.exerciseType,
      difficulty: config.difficulty,
      timeSignature: config.timeSig,
      patternId: scoredPattern.id,
      patternLabel: scoredPattern.label,
      totalBeats: scoredPattern.totalBeats,
    }).catch(() => {});
  }

  function handleChange(key: string, value: unknown) {
    setConfig(prev => ({ ...prev, [key]: value }));
    setPattern(null);
  }

  const avgScore = sessionScores.length > 0 ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length) : null;

  return (
    <div className="container-page py-10">
      <p className="pill">Modo libre</p>
      <h1 className="mt-4 text-5xl font-black tracking-tight">Práctica libre</h1>
      <p className="mt-3 max-w-2xl text-lg font-semibold text-zinc-600">Elegís habilidad, dificultad y tipo de ejercicio. Los patrones ahora tienen varios compases, suenan con piano y metrónomo, y en lectura/metrónomo tocás nota + ritmo en el piano visual. En los silencios no tocás: seguís contando con el pulso.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ConfigPanel {...config} onChange={handleChange} />

          {sessionScores.length > 0 && (
            <div className="card">
              <p className="mb-3 text-sm font-black uppercase tracking-wide text-brand-700">Sesión</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-brand-50 p-3"><p className="text-2xl font-black text-brand-700">{exerciseCount}</p><p className="text-xs font-bold text-zinc-500">ejercicios</p></div>
                <div className="rounded-2xl bg-amber-50 p-3"><p className="text-2xl font-black text-amber-700">{avgScore}%</p><p className="text-xs font-bold text-zinc-500">promedio</p></div>
                <div className="rounded-2xl bg-emerald-50 p-3"><p className="text-2xl font-black text-emerald-700">{sessionScores.filter(s => s >= 80).length}</p><p className="text-xs font-bold text-zinc-500">al 80%+</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {sessionScores.slice(-20).map((s, i) => <div key={i} className={`h-3 w-3 rounded-full ${s >= 80 ? "bg-brand-500" : s >= 60 ? "bg-amber-400" : "bg-rose-400"}`} />)}
              </div>
            </div>
          )}
        </aside>

        <main>
          {!pattern ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <p className="mb-4 text-5xl">🎹</p>
              <h2 className="text-2xl font-black">Configurá y generá</h2>
              <p className="mb-6 mt-2 max-w-lg text-zinc-600">Elegí habilidad y tipo de ejercicio. Si venís desde un mundo, el ejercicio ya llega preconfigurado con BPM, dificultad y compás.</p>
              <button type="button" onClick={generate} className="btn-primary px-8 py-4 text-lg">
                <Zap className="mr-2" size={20} /> Generar ejercicio
              </button>
            </div>
          ) : (
            <div className="card space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="pill mb-2 w-fit">Ejercicio #{exerciseCount} · dificultad {config.difficulty}/10 · {config.bpm} BPM</p>
                  <h2 className="text-2xl font-black">{SKILL_LABELS[config.skill].emoji} {SKILL_LABELS[config.skill].name}</h2>
                  <p className="mt-1 text-sm font-semibold text-zinc-600">Patrón: {pattern.label}</p>
                </div>
                <button type="button" onClick={generate} className="btn-secondary">
                  <RotateCcw className="mr-2" size={16} /> Nuevo patrón
                </button>
              </div>

              <div className="rounded-3xl border border-sky-100 bg-sky-50/80 p-4 text-sky-950">
                <p className="text-xs font-black uppercase tracking-wide text-sky-700">Flujo recomendado</p>
                <p className="mt-1 text-sm font-bold">1. Escuchá la referencia · 2. Tocá con el metrónomo · 3. Revisá resultado · 4. Reintentá o generá otro patrón.</p>
              </div>

              {config.exerciseType === "metronome" && <MetronomeExercise key={pattern.id} pattern={pattern} onScore={s => handleScore(s, pattern)} onNewPattern={generate} />}
              {config.exerciseType === "dictation" && <DictationExercise key={pattern.id} pattern={pattern} onScore={s => handleScore(s, pattern)} onNewPattern={generate} />}
              {config.exerciseType === "sight_reading" && <SightReadingExercise key={pattern.id} pattern={pattern} onScore={s => handleScore(s, pattern)} onNewPattern={generate} />}
              {config.exerciseType === "call_response" && (
                <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6 text-center">
                  <p className="font-black text-brand-800">Call & Response generativo próximamente.</p>
                  <p className="mt-1 text-sm text-zinc-600">Por ahora usá metrónomo o lectura para entrenar con piano visual.</p>
                  <button type="button" onClick={() => handleChange("exerciseType", "metronome")} className="btn-secondary mt-4">Cambiar a metrónomo</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

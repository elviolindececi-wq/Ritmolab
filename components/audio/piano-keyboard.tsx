"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NoteName } from "@/lib/rhythm-engine";
import { startPianoNote, stopPianoNote } from "@/lib/rhythm-engine";

export type PianoNoteEvent = {
  note: NoteName;
  at: number;
};

type PianoKeyboardProps = {
  startOctave?: number;
  octaves?: number;
  targetNote?: NoteName;
  showTargetNote?: boolean;
  disabled?: boolean;
  evaluationLocked?: boolean;
  instruction?: string;
  /** Fires when the key is pressed. Use this for timing/note evaluation. */
  onNoteDown?: (event: PianoNoteEvent) => void;
  /** Fires when the key is released. Useful for duration evaluation. */
  onNoteUp?: (event: PianoNoteEvent) => void;
  /** Backwards-compatible alias for older exercises. Fires on key press. */
  onNotePlay?: (event: PianoNoteEvent) => void;
};

const NATURAL_NOTES = ["C", "D", "E", "F", "G", "A", "B"] as const;
const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const BLACK_KEY_OFFSETS: Record<string, number> = {
  "C#": 0.72,
  "D#": 1.72,
  "F#": 3.72,
  "G#": 4.72,
  "A#": 5.72,
};

function buildNaturalNotes(startOctave: number, octaves: number) {
  const notes: NoteName[] = [];
  for (let octave = startOctave; octave < startOctave + octaves; octave += 1) {
    NATURAL_NOTES.forEach(note => notes.push(`${note}${octave}` as NoteName));
  }
  return notes;
}

function buildBlackNotes(startOctave: number, octaves: number) {
  const notes: Array<{ note: NoteName; octaveIndex: number; offset: number }> = [];
  for (let octave = startOctave; octave < startOctave + octaves; octave += 1) {
    CHROMATIC_NOTES.forEach(note => {
      if (!note.includes("#")) return;
      notes.push({
        note: `${note}${octave}` as NoteName,
        octaveIndex: octave - startOctave,
        offset: BLACK_KEY_OFFSETS[note],
      });
    });
  }
  return notes;
}

export function PianoKeyboard({
  startOctave = 4,
  octaves = 2,
  targetNote,
  showTargetNote = true,
  disabled = false,
  evaluationLocked = false,
  instruction = "Tocá y mantené presionada la tecla para sostener la nota. RitmoLab mide cuándo tocás y qué nota elegís.",
  onNoteDown,
  onNoteUp,
  onNotePlay,
}: PianoKeyboardProps) {
  const [activeNotes, setActiveNotes] = useState<NoteName[]>([]);
  const activeNotesRef = useRef(new Set<NoteName>());
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    return () => {
      activeNotesRef.current.forEach(note => stopPianoNote(note));
      activeNotesRef.current.clear();
    };
  }, []);

  const activeOctaves = compact ? 1 : octaves;
  const naturalNotes = useMemo(() => buildNaturalNotes(startOctave, activeOctaves), [startOctave, activeOctaves]);
  const blackNotes = useMemo(() => buildBlackNotes(startOctave, activeOctaves), [startOctave, activeOctaves]);
  const totalWhiteKeys = naturalNotes.length;
  const whiteKeyWidthPercent = 100 / totalWhiteKeys;

  function pressNote(note: NoteName) {
    if (disabled) return;
    if (activeNotesRef.current.has(note)) return;

    activeNotesRef.current.add(note);
    setActiveNotes([...activeNotesRef.current]);
    startPianoNote(note, note === targetNote ? 0.34 : 0.25);

    if (!evaluationLocked) {
      const event = { note, at: performance.now() };
      onNoteDown?.(event);
      onNotePlay?.(event);
    }
  }

  function releaseNote(note: NoteName) {
    if (!activeNotesRef.current.has(note)) return;

    activeNotesRef.current.delete(note);
    setActiveNotes([...activeNotesRef.current]);
    stopPianoNote(note);

    if (!evaluationLocked) {
      onNoteUp?.({ note, at: performance.now() });
    }
  }

  const whiteKeyClass = "flex h-full flex-1 touch-none select-none items-end justify-center rounded-b-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 pb-3 text-xs font-black text-zinc-700 shadow-[inset_0_-6px_0_rgba(0,0,0,0.04)] transition disabled:cursor-not-allowed disabled:opacity-60";
  const blackKeyClass = "absolute top-3 z-10 flex h-[58%] touch-none select-none items-end justify-center rounded-b-xl bg-gradient-to-b from-zinc-800 to-zinc-950 pb-2 text-[10px] font-black text-white shadow-xl transition disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="rounded-[2rem] border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-brand-700">Piano de respuesta</p>
          <p className="mt-1 max-w-xl text-sm font-bold text-zinc-600">{instruction}</p>
        </div>
        {showTargetNote && targetNote && (
          <div className="rounded-2xl bg-purple-50 px-3 py-2 text-xs font-black text-purple-700">
            Próxima nota: {targetNote}
          </div>
        )}
      </div>

      {evaluationLocked && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-900">
          Intento terminado: podés seguir tocando el piano, pero la evaluación está pausada hasta reintentar o generar otro patrón.
        </div>
      )}

      <div className="overflow-x-auto pb-2">
        <div className="relative h-44 min-w-[440px] touch-none select-none rounded-3xl bg-gradient-to-b from-zinc-200 to-zinc-100 p-3 sm:h-48 sm:min-w-[760px]">
          <div className="flex h-full gap-1">
            {naturalNotes.map(note => {
              const isActive = activeNotes.includes(note);
              const isTarget = showTargetNote && targetNote === note;
              return (
                <button
                  key={note}
                  type="button"
                  disabled={disabled}
                  onPointerDown={event => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture?.(event.pointerId);
                    pressNote(note);
                  }}
                  onPointerUp={event => {
                    event.preventDefault();
                    releaseNote(note);
                  }}
                  onPointerCancel={event => {
                    event.preventDefault();
                    releaseNote(note);
                  }}
                  onLostPointerCapture={() => releaseNote(note)}
                  className={[
                    whiteKeyClass,
                    isActive ? "translate-y-1 bg-brand-100" : "",
                    isTarget ? "ring-2 ring-brand-500" : "",
                  ].join(" ")}
                >
                  {note}
                </button>
              );
            })}
          </div>

          {blackNotes.map(({ note, octaveIndex, offset }) => {
            const isActive = activeNotes.includes(note);
            const isTarget = showTargetNote && targetNote === note;
            const left = (octaveIndex * 7 + offset) * whiteKeyWidthPercent;

            return (
              <button
                key={note}
                type="button"
                disabled={disabled}
                onPointerDown={event => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                  pressNote(note);
                }}
                onPointerUp={event => {
                  event.preventDefault();
                  releaseNote(note);
                }}
                onPointerCancel={event => {
                  event.preventDefault();
                  releaseNote(note);
                }}
                onLostPointerCapture={() => releaseNote(note)}
                style={{ left: `${left}%`, width: `${whiteKeyWidthPercent * 0.62}%` }}
                className={[
                  blackKeyClass,
                  isActive ? "translate-y-1 from-brand-700 to-brand-900" : "",
                  isTarget ? "ring-2 ring-brand-300" : "",
                ].join(" ")}
              >
                {note}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs font-bold text-zinc-500">
        Tip: mantené una tecla presionada para sostener la nota y soltala para apagarla. En celular se muestra una octava para que las teclas tengan buen tamaño.
      </p>
    </div>
  );
}

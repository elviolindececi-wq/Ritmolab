"use client";

import * as Tone from "tone";
import type { Piano } from "@tonejs/piano/build/piano/Piano";
import type { NoteName } from "@/lib/rhythm-engine";

type PianoState = "idle" | "loading" | "ready" | "error";

type PianoEvent = {
  note?: NoteName | string;
  time: number;
  duration: number;
  velocity?: number;
  accent?: boolean;
};

let piano: Piano | null = null;
let loadingPromise: Promise<Piano> | null = null;
let state: PianoState = "idle";
let lastError: string | null = null;

const DEFAULT_URL = "https://tambien.github.io/Piano/audio/";

export function getPianoState() {
  return { state, lastError };
}

export function isRealisticPianoReady() {
  return state === "ready" && Boolean(piano?.loaded);
}

function clampVelocity(value: number) {
  return Math.max(0.05, Math.min(1, value));
}

export async function warmUpRealisticPiano() {
  if (typeof window === "undefined") {
    throw new Error("El piano realista solo puede cargarse en el navegador.");
  }

  if (piano?.loaded) {
    state = "ready";
    return piano;
  }

  if (!loadingPromise) {
    state = "loading";
    lastError = null;

    loadingPromise = (async () => {
      try {
        await Tone.start();
        const { Piano } = await import("@tonejs/piano/build/piano/Piano");

        const instrument = new Piano({
          velocities: 4,
          minNote: 36,
          maxNote: 84,
          release: false,
          pedal: false,
          maxPolyphony: 24,
          url: DEFAULT_URL,
          volume: {
            strings: -3,
            pedal: -24,
            keybed: -24,
            harmonics: -24,
          },
        });

        instrument.toDestination();
        await instrument.load();

        piano = instrument;
        state = "ready";
        return instrument;
      } catch (error) {
        state = "error";
        lastError = error instanceof Error ? error.message : "No se pudo cargar el piano realista.";
        loadingPromise = null;
        throw error;
      }
    })();
  }

  return loadingPromise;
}

export function tryStartRealisticPianoNote(
  note: NoteName | string = "C4",
  velocity = 0.75,
  time = Tone.now()
) {
  if (!isRealisticPianoReady() || !piano) {
    void warmUpRealisticPiano().catch(() => undefined);
    return false;
  }

  piano.keyDown({ note, time, velocity: clampVelocity(velocity) });
  return true;
}

export function tryStopRealisticPianoNote(
  note: NoteName | string = "C4",
  time = Tone.now()
) {
  if (!isRealisticPianoReady() || !piano) {
    return false;
  }

  piano.keyUp({ note, time });
  return true;
}

export function tryPlayRealisticPianoNote(
  note: NoteName | string = "C4",
  duration = 0.16,
  velocity = 0.75,
  time = Tone.now()
) {
  if (!tryStartRealisticPianoNote(note, velocity, time)) return false;
  tryStopRealisticPianoNote(note, time + duration);
  return true;
}

export async function pianoKeyDown(
  note: NoteName | string = "C4",
  velocity = 0.85
) {
  const instrument = await warmUpRealisticPiano();
  instrument.keyDown({ note, time: Tone.now(), velocity: clampVelocity(velocity) });
}

export async function pianoKeyUp(note: NoteName | string = "C4") {
  const instrument = await warmUpRealisticPiano();
  instrument.keyUp({ note, time: Tone.now() });
}

export async function playRealisticPianoNote(
  note: NoteName | string = "C4",
  duration = 0.25,
  velocity = 0.8
) {
  const instrument = await warmUpRealisticPiano();
  const now = Tone.now();
  instrument.keyDown({ note, time: now, velocity: clampVelocity(velocity) });
  instrument.keyUp({ note, time: now + duration, velocity: clampVelocity(velocity) });
}

export function tryScheduleRealisticPianoRhythm(events: PianoEvent[]) {
  if (!isRealisticPianoReady() || !piano) {
    void warmUpRealisticPiano().catch(() => undefined);
    return false;
  }

  const now = Tone.now() + 0.08;

  events.forEach((event) => {
    const note = event.note ?? (event.accent ? "C5" : "C4");
    const velocity = clampVelocity(event.velocity ?? (event.accent ? 0.95 : 0.68));
    const start = now + event.time;
    piano?.keyDown({ note, time: start, velocity });
    piano?.keyUp({ note, time: start + event.duration, velocity });
  });

  return true;
}

export async function playRhythmAsRealisticPiano(events: PianoEvent[]) {
  await warmUpRealisticPiano();
  tryScheduleRealisticPianoRhythm(events);
}

export function stopRealisticPiano() {
  piano?.stopAll();
}

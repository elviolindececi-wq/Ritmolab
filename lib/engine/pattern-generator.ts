/**
 * lib/engine/pattern-generator.ts
 * 
 * Motor generativo de patrones rítmicos.
 * Produce variaciones infinitas de ejercicios sin escribirlos manualmente.
 * 
 * Arquitectura:
 * 1. FIGURA → DURACIÓN EN BEATS (tabla)
 * 2. GENERADOR DE SLOTS → rellena un compás con figuras compatibles
 * 3. CONVERTER → convierte slots a RhythmHit[] que el motor de audio ya entiende
 * 4. ABC BUILDER → genera notación ABC para AbcStaff
 */

import type { Figure, BeatSlot, RhythmPattern, TimeSignature, SkillId } from "./types";
import type { RhythmHit, NoteName } from "@/lib/rhythm-engine";

// ─── Duración de cada figura en quarter-note beats ───────────────────────────

export const FIGURE_BEATS: Record<Figure, number> = {
  whole:           4,
  half:            2,
  quarter:         1,
  eighth:          0.5,
  sixteenth:       0.25,
  triplet:         1/3,
  dotted_half:     3,
  dotted_quarter:  1.5,
  quarter_rest:    1,
  eighth_rest:     0.5,
  half_rest:       2,
  syncope:         1,     // treated as quarter + tie
  eighth_triplet:  1/3,
};

export const FIGURE_SYLLABLE: Record<Figure, string> = {
  whole:           "TA-aa-aa-aa",
  half:            "TA-aa",
  quarter:         "TA",
  eighth:          "KA",
  sixteenth:       "DI",
  triplet:         "TA-KI-TA",
  dotted_half:     "TA-aa-aa",
  dotted_quarter:  "TA.",
  quarter_rest:    "—",
  eighth_rest:     "—",
  half_rest:       "—",
  syncope:         "—KA",
  eighth_triplet:  "ta",
};

export const FIGURE_ABC: Record<Figure, string> = {
  whole:           "C4",
  half:            "C2",
  quarter:         "C",
  eighth:          "C/2",  // in L:1/4 context → L:1/8 = "C"
  sixteenth:       "C/4",
  triplet:         "(3CCC",
  dotted_half:     "C3",
  dotted_quarter:  "C3/2",
  quarter_rest:    "z",
  eighth_rest:     "z/2",
  half_rest:       "z2",
  syncope:         "z/2C3/2",
  eighth_triplet:  "(3C/2C/2C/2",
};



// ─── Melodía generativa: notas con sentido, no un solo C ─────────────────────

const MAJOR_PENTATONIC: NoteName[] = ["C4", "D4", "E4", "G4", "A4", "C5"];
const MAJOR_SCALE: NoteName[] = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5"];
const MINOR_PENTATONIC: NoteName[] = ["C4", "D#4", "F4", "G4", "A#4", "C5"];
const FUNK_SCALE: NoteName[] = ["C4", "D#4", "F4", "F#4", "G4", "A#4", "C5"];
const LATIN_SCALE: NoteName[] = ["C4", "D4", "E4", "F4", "G4", "A4", "C5"];

function makeRand(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function melodyScaleFor(skills: SkillId[], difficulty: number): NoteName[] {
  if (skills.includes("groove")) return difficulty >= 7 ? FUNK_SCALE : MINOR_PENTATONIC;
  if (skills.includes("syncopation")) return MINOR_PENTATONIC;
  if (skills.includes("meter")) return LATIN_SCALE;
  return difficulty <= 3 ? MAJOR_PENTATONIC : MAJOR_SCALE;
}

function clampIndex(index: number, scale: NoteName[]) {
  return Math.max(0, Math.min(scale.length - 1, index));
}

export function generateMelodyNotes(config: {
  count: number;
  difficulty: number;
  seed: number;
  skills?: SkillId[];
}): NoteName[] {
  const { count, difficulty, seed, skills = [] } = config;
  const scale = melodyScaleFor(skills, difficulty);
  const rand = makeRand(seed + 4242);

  if (count <= 0) return [];

  const tonicIndex = 0;
  const stableDegrees = [0, 2, 4].filter(i => i < scale.length);
  let current = difficulty <= 2 ? tonicIndex : stableDegrees[Math.floor(rand() * stableDegrees.length)] ?? tonicIndex;
  const notes: NoteName[] = [];

  for (let i = 0; i < count; i += 1) {
    const isPhraseStart = i % 4 === 0;
    const isPhraseEnd = i % 4 === 3 || i === count - 1;

    if (i === 0) {
      current = tonicIndex;
    } else if (isPhraseStart) {
      // Empezar cada mini-frase en una nota estable hace que la melodía respire.
      current = stableDegrees[Math.floor(rand() * stableDegrees.length)] ?? tonicIndex;
    } else if (isPhraseEnd) {
      // Resolver al final de cada grupo hacia tónica, tercera o quinta.
      const target = stableDegrees[Math.floor(rand() * stableDegrees.length)] ?? tonicIndex;
      current += Math.sign(target - current);
      if (Math.abs(target - current) <= 1 || i === count - 1) current = target;
    } else {
      // Movimiento mayormente conjunto, con algún salto pequeño para variedad.
      const r = rand();
      const maxStep = difficulty >= 7 ? 3 : difficulty >= 4 ? 2 : 1;
      const step = r < 0.62 ? (rand() < 0.5 ? -1 : 1)
        : r < 0.84 ? 0
        : (rand() < 0.5 ? -maxStep : maxStep);
      current += step;
    }

    current = clampIndex(current, scale);
    notes.push(scale[current]);
  }

  // Cierre musical: terminar en C si la frase tiene suficiente longitud.
  if (notes.length >= 4) notes[notes.length - 1] = "C4";
  return notes;
}

function noteNameToAbc(note: NoteName = "C4") {
  const match = note.match(/^([A-G])(#?)(\d)$/);
  if (!match) return "C";

  const [, letter, sharp, octaveRaw] = match;
  const octave = Number(octaveRaw);
  const accidental = sharp ? "^" : "";

  if (octave <= 3) return `${accidental}${letter},`;
  if (octave === 4) return `${accidental}${letter}`;
  if (octave === 5) return `${accidental}${letter.toLowerCase()}`;
  return `${accidental}${letter.toLowerCase()}\'`;
}

// ─── Figuras permitidas por nivel de dificultad ───────────────────────────────

export const FIGURES_BY_DIFFICULTY: Record<number, Figure[]> = {
  1:  ["quarter", "quarter_rest"],
  2:  ["quarter", "half", "quarter_rest"],
  3:  ["quarter", "half", "whole", "quarter_rest", "half_rest"],
  4:  ["quarter", "half", "eighth", "quarter_rest"],
  5:  ["quarter", "half", "eighth", "quarter_rest", "eighth_rest"],
  6:  ["quarter", "eighth", "dotted_quarter", "quarter_rest", "eighth_rest"],
  7:  ["quarter", "eighth", "triplet", "syncope", "quarter_rest"],
  8:  ["quarter", "eighth", "sixteenth", "triplet", "syncope", "quarter_rest"],
  9:  ["quarter", "eighth", "sixteenth", "triplet", "dotted_quarter", "syncope", "eighth_rest"],
  10: ["whole", "half", "quarter", "eighth", "sixteenth", "triplet", "dotted_quarter", "syncope", "eighth_triplet"],
};

// ─── Core: fill one bar with figures ─────────────────────────────────────────

/**
 * Genera un array de figuras que suman exactamente `totalBeats` pulsos.
 * Usa un algoritmo de backtracking simple con seed determinístico para
 * que el mismo seed produzca siempre el mismo patrón (reproducibilidad).
 */
export function generateBar(
  totalBeats: number,
  allowedFigures: Figure[],
  seed: number
): Figure[] {
  // Seeded pseudo-random (lcg)
  let s = seed;
  function rand() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  }

  function fill(remaining: number, depth: number): Figure[] | null {
    if (Math.abs(remaining) < 0.001) return [];
    if (depth > 20) return null; // prevent infinite recursion

    // Filter figures that fit
    const fits = allowedFigures.filter(f => {
      const beats = FIGURE_BEATS[f];
      return beats <= remaining + 0.001;
    });
    if (fits.length === 0) return null;

    // Shuffle with seeded random
    const shuffled = [...fits].sort(() => rand() - 0.5);

    for (const fig of shuffled) {
      const beats = FIGURE_BEATS[fig];
      const rest = fill(remaining - beats, depth + 1);
      if (rest !== null) return [fig, ...rest];
    }
    return null;
  }

  // Try up to 20 seeds until a valid bar is found
  for (let attempt = 0; attempt < 20; attempt++) {
    const result = fill(totalBeats, 0);
    if (result) return result;
    s += 1;
  }

  // Fallback: fill with quarters and rests
  const fallback: Figure[] = [];
  let rem = totalBeats;
  while (rem > 0.001) {
    if (rem >= 1) { fallback.push("quarter"); rem -= 1; }
    else if (rem >= 0.5) { fallback.push("eighth"); rem -= 0.5; }
    else break;
  }
  return fallback;
}

// ─── Convert figures to BeatSlots ─────────────────────────────────────────────

export function figuresToSlots(figures: Figure[], note: NoteName = "C4"): BeatSlot[] {
  const slots: BeatSlot[] = [];
  let cursor = 0;

  for (const fig of figures) {
    const beats = FIGURE_BEATS[fig];
    const isRest = fig.endsWith("_rest") || fig === "syncope";

    if (fig === "triplet") {
      // Three equal subdivisions
      slots.push({ beat: cursor,         figure: fig, note, accent: cursor === 0, label: "TA" });
      slots.push({ beat: cursor + 1/3,   figure: fig, note, label: "KI" });
      slots.push({ beat: cursor + 2/3,   figure: fig, note, label: "TA" });
    } else if (fig === "eighth_triplet") {
      slots.push({ beat: cursor,         figure: fig, note, accent: cursor === 0, label: "ta" });
      slots.push({ beat: cursor + 1/3,   figure: fig, note, label: "ta" });
      slots.push({ beat: cursor + 2/3,   figure: fig, note, label: "ta" });
    } else if (fig === "syncope") {
      // Rest on beat, note on the off-beat
      slots.push({ beat: cursor,       figure: "eighth_rest", note, label: "—" });
      slots.push({ beat: cursor + 0.5, figure: "eighth",      note, accent: true, label: "KA" });
    } else {
      slots.push({
        beat:    cursor,
        figure:  fig,
        note,
        accent:  cursor === 0,
        label:   FIGURE_SYLLABLE[fig],
      });
    }

    cursor += beats;
  }

  return slots;
}

// ─── Convert BeatSlots to RhythmHit[] (for the audio engine) ─────────────────

export function slotsToHits(slots: BeatSlot[]): RhythmHit[] {
  return slots
    .filter(s => !s.figure.endsWith("_rest"))
    .map(s => ({
      beat:   s.beat,
      note:   s.note,
      accent: s.accent,
      label:  s.label,
    }));
}

// ─── ABC notation builder ─────────────────────────────────────────────────────

function takeMelodyNote(notes: NoteName[], cursor: { value: number }) {
  const note = notes[cursor.value] ?? notes[notes.length - 1] ?? "C4";
  cursor.value += 1;
  return noteNameToAbc(note);
}

function figureToAbc(fig: Figure, notes: NoteName[], cursor: { value: number }): string {
  if (fig === "whole") return `${takeMelodyNote(notes, cursor)}4`;
  if (fig === "half") return `${takeMelodyNote(notes, cursor)}2`;
  if (fig === "quarter") return takeMelodyNote(notes, cursor);
  if (fig === "eighth") return `${takeMelodyNote(notes, cursor)}/2`;
  if (fig === "sixteenth") return `${takeMelodyNote(notes, cursor)}/4`;
  if (fig === "dotted_half") return `${takeMelodyNote(notes, cursor)}3`;
  if (fig === "dotted_quarter") return `${takeMelodyNote(notes, cursor)}3/2`;
  if (fig === "quarter_rest") return "z";
  if (fig === "eighth_rest") return "z/2";
  if (fig === "half_rest") return "z2";
  if (fig === "syncope") return `z/2${takeMelodyNote(notes, cursor)}3/2`;
  if (fig === "triplet") {
    return `(3${takeMelodyNote(notes, cursor)}${takeMelodyNote(notes, cursor)}${takeMelodyNote(notes, cursor)}`;
  }
  if (fig === "eighth_triplet") {
    return `(3${takeMelodyNote(notes, cursor)}/2${takeMelodyNote(notes, cursor)}/2${takeMelodyNote(notes, cursor)}/2`;
  }
  return takeMelodyNote(notes, cursor);
}

export function slotsToAbc(
  figures: Figure[],
  timeSig: TimeSignature,
  bpm: number,
  beatsPerBar = 4,
  melodyNotes: NoteName[] = []
): string {
  const bars: string[] = [];
  let current: string[] = [];
  let beatInBar = 0;
  const cursor = { value: 0 };

  for (const fig of figures) {
    current.push(figureToAbc(fig, melodyNotes, cursor));
    beatInBar += FIGURE_BEATS[fig];

    if (beatInBar >= beatsPerBar - 0.001) {
      bars.push(current.join(" "));
      current = [];
      beatInBar = 0;
    }
  }

  if (current.length > 0) bars.push(current.join(" "));

  const body = bars.map(bar => `| ${bar} `).join("") + "|";
  return `X:1\nM:${timeSig}\nL:1/4\nQ:1/4=${bpm}\nK:C\n${body}`;
}


function quarterBeatsPerBar(timeSignature: TimeSignature) {
  const [topRaw, bottomRaw] = timeSignature.split("/");
  const top = Number(topRaw);
  const bottom = Number(bottomRaw);
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom <= 0) return 4;
  return top * (4 / bottom);
}

// ─── Top-level: generate a complete RhythmPattern ────────────────────────────

let _patternCounter = 0;

export function generatePattern(config: {
  difficulty: number;
  timeSignature?: TimeSignature;
  bpm?: number;
  bars?: number;
  allowedFigures?: Figure[];
  skills?: SkillId[];
  seed?: number;
  note?: NoteName;
}): RhythmPattern {
  const {
    difficulty,
    timeSignature = "4/4",
    bpm = 80,
    bars = 1,
    skills = ["pulse"],
    note = "C4",
  } = config;

  const totalBeatsPerBar = quarterBeatsPerBar(timeSignature);

  const figures = config.allowedFigures ?? FIGURES_BY_DIFFICULTY[Math.min(10, Math.max(1, difficulty))] ?? FIGURES_BY_DIFFICULTY[1];
  const seed = config.seed ?? (Date.now() + _patternCounter++);

  // Generate each bar
  const allFigures: Figure[] = [];
  for (let bar = 0; bar < bars; bar++) {
    const barFigs = generateBar(totalBeatsPerBar, figures, seed + bar * 997);
    allFigures.push(...barFigs);
  }

  const slots = figuresToSlots(allFigures, note);
  const audibleSlots = slots.filter(slot => !slot.figure.endsWith("_rest") && slot.label !== "—");
  const melodyNotes = generateMelodyNotes({
    count: audibleSlots.length,
    difficulty,
    seed,
    skills,
  });

  let melodyIndex = 0;
  slots.forEach(slot => {
    if (!slot.figure.endsWith("_rest") && slot.label !== "—") {
      slot.note = melodyNotes[melodyIndex] ?? note;
      melodyIndex += 1;
    } else {
      slot.note = undefined;
    }
  });

  const syllables = allFigures.map(f => FIGURE_SYLLABLE[f]);
  const abc = slotsToAbc(allFigures, timeSignature, bpm, totalBeatsPerBar, melodyNotes);
  const id = `gen_${seed}_d${difficulty}`;

  return {
    id,
    label: syllables.join(" · "),
    timeSignature,
    totalBeats: totalBeatsPerBar * bars,
    bars,
    bpm,
    slots,
    skills,
    difficulty,
    abc,
    syllables,
  };
}

// ─── Generate N distractor patterns for dictation ────────────────────────────

export function generateDistractors(
  correct: RhythmPattern,
  count = 3
): RhythmPattern[] {
  const distractors: RhythmPattern[] = [];
  const beatsPerBar = quarterBeatsPerBar(correct.timeSignature);
  const bars = correct.bars ?? Math.max(1, Math.round(correct.totalBeats / beatsPerBar));
  const usedIds = new Set([correct.id]);

  for (let i = 0; i < count * 3 && distractors.length < count; i++) {
    // Vary difficulty by ±1 and use different seeds
    const diffVariant = correct.difficulty + (i % 3) - 1;
    const candidate = generatePattern({
      difficulty: Math.max(1, Math.min(10, diffVariant)),
      timeSignature: correct.timeSignature,
      bpm: correct.bpm,
      bars,
      skills: correct.skills,
      seed: correct.id.split("_")[1] ? parseInt(correct.id.split("_")[1]) + i * 1337 : i * 1337,
    });

    // Ensure it's actually different
    if (!usedIds.has(candidate.id) && candidate.label !== correct.label) {
      usedIds.add(candidate.id);
      distractors.push(candidate);
    }
  }

  return distractors.slice(0, count);
}

// ─── Pattern → GenerativeExercise ────────────────────────────────────────────

export function patternToHits(pattern: RhythmPattern): RhythmHit[] {
  return slotsToHits(pattern.slots);
}

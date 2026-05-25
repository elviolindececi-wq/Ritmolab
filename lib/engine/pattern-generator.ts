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

function figureToAbc(fig: Figure): string {
  const map: Record<Figure, string> = {
    whole:           "C4",
    half:            "C2",
    quarter:         "C",
    eighth:          "c",     // lower case = eighth in L:1/4
    sixteenth:       "c/2",
    triplet:         "(3CCC",
    dotted_half:     "C3",
    dotted_quarter:  "C3/2",
    quarter_rest:    "z",
    eighth_rest:     "z/2",
    half_rest:       "z2",
    syncope:         "z/2C3/2",
    eighth_triplet:  "(3ccc",
  };
  return map[fig] ?? "C";
}

export function slotsToAbc(figures: Figure[], timeSig: TimeSignature, bpm: number): string {
  const body = figures.map(figureToAbc).join(" ");
  return `X:1\nM:${timeSig}\nL:1/4\nQ:1/4=${bpm}\nK:C\n| ${body} |`;
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

  const totalBeatsPerBar = timeSignature === "6/8" || timeSignature === "12/8" ? 6
    : timeSignature === "3/4" ? 3
    : timeSignature === "2/4" ? 2
    : timeSignature === "5/4" ? 5
    : timeSignature === "7/8" ? 3.5
    : 4;

  const figures = config.allowedFigures ?? FIGURES_BY_DIFFICULTY[Math.min(10, Math.max(1, difficulty))] ?? FIGURES_BY_DIFFICULTY[1];
  const seed = config.seed ?? (Date.now() + _patternCounter++);

  // Generate each bar
  const allFigures: Figure[] = [];
  for (let bar = 0; bar < bars; bar++) {
    const barFigs = generateBar(totalBeatsPerBar, figures, seed + bar * 997);
    allFigures.push(...barFigs);
  }

  const slots = figuresToSlots(allFigures, note);
  const syllables = allFigures.map(f => FIGURE_SYLLABLE[f]);
  const abc = slotsToAbc(allFigures, timeSignature, bpm);
  const id = `gen_${seed}_d${difficulty}`;

  return {
    id,
    label: syllables.join(" · "),
    timeSignature,
    totalBeats: totalBeatsPerBar * bars,
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
  const usedIds = new Set([correct.id]);

  for (let i = 0; i < count * 3 && distractors.length < count; i++) {
    // Vary difficulty by ±1 and use different seeds
    const diffVariant = correct.difficulty + (i % 3) - 1;
    const candidate = generatePattern({
      difficulty: Math.max(1, Math.min(10, diffVariant)),
      timeSignature: correct.timeSignature,
      bpm: correct.bpm,
      bars: 1,
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

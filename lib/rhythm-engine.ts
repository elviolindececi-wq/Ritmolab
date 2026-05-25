"use client";

export type NoteName =
  | "C3" | "D3" | "E3" | "F3" | "G3" | "A3" | "B3"
  | "C4" | "D4" | "E4" | "F4" | "G4" | "A4" | "B4"
  | "C5" | "D5" | "E5" | "F5" | "G5" | "A5" | "B5";

export type RhythmHit = {
  /** Position in quarter-note beats. Example: 0, 0.5, 1, 1.333... */
  beat: number;
  /** Optional pitch. If omitted, C4 is used. */
  note?: NoteName;
  /** Rest events are counted visually but not sounded and not expected as taps. */
  rest?: boolean;
  /** Accented hits sound slightly louder. */
  accent?: boolean;
  /** Optional label for UI/debugging. */
  label?: string;
};

const FREQUENCIES: Record<NoteName, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77
};

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return new AudioContextClass();
}

export function audibleHits(hits: RhythmHit[]) {
  return hits.filter((hit) => !hit.rest).sort((a, b) => a.beat - b.beat);
}

export function noteFrequency(note: NoteName = "C4") {
  return FREQUENCIES[note] ?? FREQUENCIES.C4;
}

export function playNote(note: NoteName = "C4", velocity = 0.22, duration = 0.35) {
  const context = getAudioContext();
  if (!context) return;
  playPianoTone(context, context.currentTime, note, velocity, duration);
}

/**
 * Piano-like synth made with Web Audio only.
 * It is not a sampled Steinway, but it behaves much more like a piano than a sine beep:
 * fast hammer attack, natural decay, short release, low-pass warmth and soft detuned harmonics.
 */
function playPianoTone(context: AudioContext, start: number, note: NoteName = "C4", velocity = 0.24, duration = 0.42) {
  const fundamental = noteFrequency(note);
  const output = context.createGain();
  const filter = context.createBiquadFilter();
  const compressor = context.createDynamicsCompressor();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(5200, fundamental * 12), start);
  filter.Q.setValueAtTime(0.75, start);

  output.gain.setValueAtTime(0.0001, start);
  output.gain.exponentialRampToValueAtTime(Math.max(0.001, velocity), start + 0.006);
  output.gain.exponentialRampToValueAtTime(Math.max(0.0008, velocity * 0.22), start + 0.09);
  output.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  const partials = [
    { ratio: 1, gain: 1, detune: 0 },
    { ratio: 2, gain: 0.42, detune: 3 },
    { ratio: 3, gain: 0.18, detune: -4 },
    { ratio: 4, gain: 0.08, detune: 6 }
  ];

  partials.forEach((partial) => {
    const osc = context.createOscillator();
    const partialGain = context.createGain();
    osc.type = partial.ratio === 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(fundamental * partial.ratio, start);
    osc.detune.setValueAtTime(partial.detune, start);
    partialGain.gain.setValueAtTime(partial.gain, start);
    osc.connect(partialGain);
    partialGain.connect(output);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  });

  output.connect(filter);
  filter.connect(compressor);
  compressor.connect(context.destination);
}

function playTone(context: AudioContext, start: number, note: NoteName = "C4", velocity = 0.22, duration = 0.35) {
  playPianoTone(context, start, note, velocity, duration);
}

export function playRhythmPattern(hits: RhythmHit[], bpm = 80, fallbackNote: NoteName = "C4") {
  const context = getAudioContext();
  if (!context) return;

  const secondsPerBeat = 60 / bpm;
  const startAt = context.currentTime + 0.08;

  audibleHits(hits).forEach((hit, index) => {
    const start = startAt + hit.beat * secondsPerBeat;
    const note = hit.note ?? fallbackNote;
    const velocity = hit.accent || index === 0 ? 0.32 : 0.2;
    playTone(context, start, note, velocity, 0.1);
  });
}

/**
 * Compatibility fallback for older content that only has syllables.
 * This is intentionally musical: TA-KI-TA creates 3 attacks inside one beat,
 * TA-KA-DI-MI creates 4 attacks, and silences do not sound.
 */
export function hitsFromSyllables(syllables: string[], note: NoteName = "C4"): RhythmHit[] {
  const hits: RhythmHit[] = [];

  syllables.forEach((raw, beatIndex) => {
    const syllable = raw.toLowerCase();

    if (syllable.includes("silencio") || syllable.includes("rest")) {
      hits.push({ beat: beatIndex, rest: true, label: raw });
      return;
    }

    if (syllable.includes("ta-ki-ta")) {
      hits.push(
        { beat: beatIndex, note, accent: beatIndex === 0, label: "TA" },
        { beat: beatIndex + 1 / 3, note, label: "KI" },
        { beat: beatIndex + 2 / 3, note, label: "TA" }
      );
      return;
    }

    if (syllable.includes("ta-ka-di-mi")) {
      hits.push(
        { beat: beatIndex, note, accent: beatIndex === 0, label: "TA" },
        { beat: beatIndex + 0.25, note, label: "KA" },
        { beat: beatIndex + 0.5, note, label: "DI" },
        { beat: beatIndex + 0.75, note, label: "MI" }
      );
      return;
    }

    if (syllable.includes("ta-ka") || syllable.includes("ta-di")) {
      hits.push(
        { beat: beatIndex, note, accent: beatIndex === 0, label: "TA" },
        { beat: beatIndex + 0.5, note, label: "KA" }
      );
      return;
    }

    hits.push({ beat: beatIndex, note, accent: beatIndex === 0, label: raw });
  });

  return hits;
}

export function evaluateRhythmTaps(taps: number[], hits: RhythmHit[], bpm = 80) {
  const targets = audibleHits(hits);
  if (taps.length < 2 || targets.length < 2) {
    return { accuracy: 0, averageErrorMs: 0, expectedCount: targets.length, receivedCount: taps.length };
  }

  const beatMs = 60000 / bpm;
  const expected = targets.map((hit) => (hit.beat - targets[0].beat) * beatMs);
  const actual = taps.slice(0, targets.length).map((tap) => tap - taps[0]);
  const count = Math.min(expected.length, actual.length);

  const errors = Array.from({ length: count }, (_, index) => Math.abs(actual[index] - expected[index]));
  const averageErrorMs = errors.reduce((sum, error) => sum + error, 0) / Math.max(1, errors.length);

  // A tolerance of 35% of a beat is forgiving for beginners but still meaningful.
  const toleranceMs = beatMs * 0.35;
  const timingScore = Math.max(0, 100 - (averageErrorMs / toleranceMs) * 100);
  const countPenalty = Math.max(0, targets.length - taps.length) * 8;
  const accuracy = Math.max(0, Math.round(timingScore - countPenalty));

  return {
    accuracy,
    averageErrorMs: Math.round(averageErrorMs),
    expectedCount: targets.length,
    receivedCount: taps.length
  };
}

export type Hand = "left" | "right";

export type BimanualHit = RhythmHit & {
  hand: Hand;
};

export type BimanualTap = {
  hand: Hand;
  at: number;
};

export type BimanualEvaluation = {
  score: number;
  leftAccuracy: number;
  rightAccuracy: number;
  timingAccuracy: number;
  coordinationAccuracy: number;
  silenceAccuracy: number;
  averageErrorMs: number;
  earlyCount: number;
  lateCount: number;
  missedCount: number;
  extraCount: number;
  correctHits: number;
  expectedHits: number;
};

export function audibleBimanualHits(hits: BimanualHit[]) {
  return hits.filter((hit) => !hit.rest).sort((a, b) => a.beat - b.beat || a.hand.localeCompare(b.hand));
}

export function playBimanualPattern(hits: BimanualHit[], bpm = 80) {
  const context = getAudioContext();
  if (!context) return;

  const secondsPerBeat = 60 / bpm;
  const startAt = context.currentTime + 0.12;

  audibleBimanualHits(hits).forEach((hit, index) => {
    const start = startAt + hit.beat * secondsPerBeat;
    const note = hit.note ?? (hit.hand === "left" ? "C3" : "C4");
    const velocity = hit.accent || index === 0 ? 0.34 : 0.22;
    playTone(context, start, note, velocity, hit.hand === "left" ? 0.13 : 0.1);
  });
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function evaluateHand(taps: BimanualTap[], targets: BimanualHit[], bpm: number, toleranceMultiplier: number) {
  if (!targets.length) return { score: 100, errors: [] as number[], missed: 0, extra: taps.length, correct: 0, early: 0, late: 0 };

  const beatMs = 60000 / bpm;
  const toleranceMs = beatMs * toleranceMultiplier;
  const firstTarget = targets[0].beat;
  const targetMs = targets.map((hit) => (hit.beat - firstTarget) * beatMs);
  const actualMs = taps.length ? taps.map((tap) => tap.at - taps[0].at) : [];
  const used = new Set<number>();
  const errors: number[] = [];
  let early = 0;
  let late = 0;
  let correct = 0;

  targetMs.forEach((expected) => {
    let bestIndex = -1;
    let bestError = Number.POSITIVE_INFINITY;

    actualMs.forEach((actual, index) => {
      if (used.has(index)) return;
      const error = actual - expected;
      const absError = Math.abs(error);
      if (absError < bestError) {
        bestError = absError;
        bestIndex = index;
      }
    });

    if (bestIndex >= 0 && bestError <= toleranceMs) {
      used.add(bestIndex);
      errors.push(bestError);
      correct += 1;
      const signed = actualMs[bestIndex] - expected;
      if (signed < -40) early += 1;
      if (signed > 40) late += 1;
    }
  });

  const missed = Math.max(0, targets.length - correct);
  const extra = Math.max(0, taps.length - used.size);
  const averageError = errors.length ? errors.reduce((sum, error) => sum + error, 0) / errors.length : toleranceMs;
  const timing = clampScore(100 - (averageError / toleranceMs) * 55);
  const count = clampScore((correct / targets.length) * 100 - missed * 10 - extra * 8);
  const score = clampScore(timing * 0.55 + count * 0.45);

  return { score, errors, missed, extra, correct, early, late };
}

export function evaluateBimanualTaps(taps: BimanualTap[], hits: BimanualHit[], bpm = 80, toleranceMultiplier = 0.28): BimanualEvaluation {
  const targets = audibleBimanualHits(hits);
  const leftTargets = targets.filter((hit) => hit.hand === "left");
  const rightTargets = targets.filter((hit) => hit.hand === "right");
  const leftTaps = taps.filter((tap) => tap.hand === "left");
  const rightTaps = taps.filter((tap) => tap.hand === "right");

  const left = evaluateHand(leftTaps, leftTargets, bpm, toleranceMultiplier);
  const right = evaluateHand(rightTaps, rightTargets, bpm, toleranceMultiplier);
  const allErrors = [...left.errors, ...right.errors];
  const averageErrorMs = allErrors.length ? Math.round(allErrors.reduce((sum, error) => sum + error, 0) / allErrors.length) : 0;
  const expectedHits = targets.length;
  const correctHits = left.correct + right.correct;
  const missedCount = left.missed + right.missed;
  const extraCount = left.extra + right.extra;
  const earlyCount = left.early + right.early;
  const lateCount = left.late + right.late;

  const timingAccuracy = clampScore(allErrors.length ? 100 - averageErrorMs / ((60000 / bpm) * toleranceMultiplier) * 55 : 0);
  const coordinationAccuracy = clampScore((correctHits / Math.max(1, expectedHits)) * 100 - Math.abs(left.score - right.score) * 0.25 - extraCount * 6);
  const silenceAccuracy = clampScore(100 - extraCount * 18);
  const score = clampScore(left.score * 0.25 + right.score * 0.25 + timingAccuracy * 0.25 + coordinationAccuracy * 0.2 + silenceAccuracy * 0.05);

  return {
    score,
    leftAccuracy: left.score,
    rightAccuracy: right.score,
    timingAccuracy,
    coordinationAccuracy,
    silenceAccuracy,
    averageErrorMs,
    earlyCount,
    lateCount,
    missedCount,
    extraCount,
    correctHits,
    expectedHits
  };
}

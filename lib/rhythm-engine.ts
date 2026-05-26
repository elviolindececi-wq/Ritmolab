"use client";

import { tryPlayRealisticPianoNote, tryScheduleRealisticPianoRhythm, tryStartRealisticPianoNote, tryStopRealisticPianoNote, warmUpRealisticPiano } from "@/lib/audio/realistic-piano";

export type NoteName =
  | "C3" | "C#3" | "D3" | "D#3" | "E3" | "F3" | "F#3" | "G3" | "G#3" | "A3" | "A#3" | "B3"
  | "C4" | "C#4" | "D4" | "D#4" | "E4" | "F4" | "F#4" | "G4" | "G#4" | "A4" | "A#4" | "B4"
  | "C5" | "C#5" | "D5" | "D#5" | "E5" | "F5" | "F#5" | "G5" | "G#5" | "A5" | "A#5" | "B5";

export type RhythmHit = {
  /** Position in quarter-note beats. Example: 0, 0.5, 1, 1.333... */
  beat: number;
  /** Duration in quarter-note beats. A redonda in 4/4 = 4, blanca = 2, negra = 1, corchea = 0.5. */
  durationBeats?: number;
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
  C3: 130.81, "C#3": 138.59, D3: 146.83, "D#3": 155.56, E3: 164.81, F3: 174.61, "F#3": 185.0, G3: 196.0, "G#3": 207.65, A3: 220.0, "A#3": 233.08, B3: 246.94,
  C4: 261.63, "C#4": 277.18, D4: 293.66, "D#4": 311.13, E4: 329.63, F4: 349.23, "F#4": 369.99, G4: 392.0, "G#4": 415.3, A4: 440.0, "A#4": 466.16, B4: 493.88,
  C5: 523.25, "C#5": 554.37, D5: 587.33, "D#5": 622.25, E5: 659.25, F5: 698.46, "F#5": 739.99, G5: 783.99, "G#5": 830.61, A5: 880.0, "A#5": 932.33, B5: 987.77
};

let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioContextClass({ latencyHint: "interactive" });
  }

  if (sharedAudioContext.state === "suspended") {
    void sharedAudioContext.resume().catch(() => undefined);
  }

  return sharedAudioContext;
}

export function primeAudioEngine() {
  const context = getAudioContext();
  void context?.resume().catch(() => undefined);
  void warmUpRealisticPiano().catch(() => undefined);
}

if (typeof window !== "undefined") {
  const primeOnce = () => primeAudioEngine();
  window.addEventListener("pointerdown", primeOnce, { once: true, passive: true });
  window.addEventListener("keydown", primeOnce, { once: true });
}

export function audibleHits(hits: RhythmHit[]) {
  return hits.filter((hit) => !hit.rest).sort((a, b) => a.beat - b.beat);
}

export function noteFrequency(note: NoteName = "C4") {
  return FREQUENCIES[note] ?? FREQUENCIES.C4;
}

export function playNote(note: NoteName = "C4", velocity = 0.22, duration = 0.35) {
  primeAudioEngine();

  if (tryPlayRealisticPianoNote(note, duration, Math.min(1, velocity * 3.2))) return;

  const context = getAudioContext();
  if (!context) return;
  playPianoTone(context, context.currentTime + 0.001, note, velocity, duration);
}


type SustainedFallbackNote = {
  output: GainNode;
  oscillators: OscillatorNode[];
  releaseTimer?: number;
};

const sustainedFallbackNotes = new Map<NoteName, SustainedFallbackNote>();

function startFallbackPianoTone(context: AudioContext, note: NoteName = "C4", velocity = 0.24) {
  const existing = sustainedFallbackNotes.get(note);
  if (existing) return;

  const start = context.currentTime + 0.001;
  const fundamental = noteFrequency(note);
  const output = context.createGain();
  const filter = context.createBiquadFilter();
  const compressor = context.createDynamicsCompressor();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(6200, fundamental * 14), start);
  filter.Q.setValueAtTime(0.72, start);

  output.gain.setValueAtTime(0.0001, start);
  output.gain.exponentialRampToValueAtTime(Math.max(0.001, velocity), start + 0.006);
  output.gain.exponentialRampToValueAtTime(Math.max(0.0008, velocity * 0.34), start + 0.18);

  const oscillators: OscillatorNode[] = [];
  const partials = [
    { ratio: 1, gain: 1, detune: 0 },
    { ratio: 2, gain: 0.42, detune: 3 },
    { ratio: 3, gain: 0.18, detune: -4 },
    { ratio: 4, gain: 0.08, detune: 6 },
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
    oscillators.push(osc);
  });

  output.connect(filter);
  filter.connect(compressor);
  compressor.connect(context.destination);
  sustainedFallbackNotes.set(note, { output, oscillators });
}

function stopFallbackPianoTone(context: AudioContext, note: NoteName = "C4") {
  const active = sustainedFallbackNotes.get(note);
  if (!active) return;

  const now = context.currentTime;
  active.output.gain.cancelScheduledValues(now);
  active.output.gain.setValueAtTime(Math.max(0.0001, active.output.gain.value || 0.0001), now);
  active.output.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  active.oscillators.forEach((osc) => {
    try {
      osc.stop(now + 0.22);
    } catch {
      // already stopped
    }
  });
  sustainedFallbackNotes.delete(note);
}

export function startPianoNote(note: NoteName = "C4", velocity = 0.28) {
  primeAudioEngine();

  if (tryStartRealisticPianoNote(note, Math.min(1, velocity * 3.2))) return;

  const context = getAudioContext();
  if (!context) return;
  startFallbackPianoTone(context, note, velocity);
}

export function stopPianoNote(note: NoteName = "C4") {
  tryStopRealisticPianoNote(note);

  const context = getAudioContext();
  if (!context) return;
  stopFallbackPianoTone(context, note);
}

/**
 * Fast piano-like synth fallback made with Web Audio.
 * It gives immediate response while the sampled piano is loading, so the keyboard never feels blocked.
 */
function playPianoTone(context: AudioContext, start: number, note: NoteName = "C4", velocity = 0.24, duration = 0.42) {
  const fundamental = noteFrequency(note);
  const output = context.createGain();
  const filter = context.createBiquadFilter();
  const compressor = context.createDynamicsCompressor();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(6200, fundamental * 14), start);
  filter.Q.setValueAtTime(0.72, start);

  output.gain.setValueAtTime(0.0001, start);
  output.gain.exponentialRampToValueAtTime(Math.max(0.001, velocity), start + 0.004);
  output.gain.exponentialRampToValueAtTime(Math.max(0.0008, velocity * 0.22), start + 0.075);
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


/**
 * Characteristic metronome click, intentionally different from piano notes.
 * Accented beats use a higher click; inner beats use a lower woodblock-like click.
 */
function playMetronomeClick(context: AudioContext, start: number, clickType: "strong" | "secondary" | "normal" = "normal") {
  const output = context.createGain();
  const filter = context.createBiquadFilter();
  const click = context.createOscillator();
  const body = context.createOscillator();

  const strong = clickType === "strong";
  const secondary = clickType === "secondary";

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(strong ? 2800 : secondary ? 2150 : 1750, start);
  filter.Q.setValueAtTime(strong ? 9 : secondary ? 7 : 6, start);

  output.gain.setValueAtTime(0.0001, start);
  output.gain.exponentialRampToValueAtTime(strong ? 0.42 : secondary ? 0.32 : 0.24, start + 0.002);
  output.gain.exponentialRampToValueAtTime(0.0001, start + (strong ? 0.06 : secondary ? 0.052 : 0.04));

  click.type = "square";
  click.frequency.setValueAtTime(strong ? 2450 : secondary ? 1850 : 1350, start);
  click.frequency.exponentialRampToValueAtTime(strong ? 1600 : secondary ? 1250 : 880, start + 0.025);

  body.type = "triangle";
  body.frequency.setValueAtTime(strong ? 980 : secondary ? 760 : 620, start);

  click.connect(filter);
  body.connect(filter);
  filter.connect(output);
  output.connect(context.destination);

  click.start(start);
  body.start(start);
  click.stop(start + 0.06);
  body.stop(start + 0.06);
}

function playTone(context: AudioContext, start: number, note: NoteName = "C4", velocity = 0.22, duration = 0.35) {
  playPianoTone(context, start, note, velocity, duration);
}

export type MetronomeProfile = {
  timeSignature: string;
  beatsPerBar: number;
  beatUnit: number;
  /** How many quarter-note beats one metronome click occupies. 4/4 = 1, 6/8 = 0.5. */
  clickQuarterBeats: number;
  /** Click indexes inside the bar that receive any accent. Kept for compatibility. */
  accents: number[];
  /** Strong downbeat indexes, usually only 0. */
  strongAccents: number[];
  /** Secondary inner-group accents, for 6/8, 7/8, etc. */
  secondaryAccents: number[];
};

export type MetronomeClickLabel = "CLIC" | "tac" | "toc";

export type MetronomeSequenceStep = {
  beat: number;
  label: MetronomeClickLabel;
  kind: "strong" | "normal" | "secondary";
};

export type PlayRhythmOptions = {
  /** Total exercise length in quarter-note beats. Needed when the pattern ends with rests. */
  totalBeats?: number;
  /** Click during the whole exercise so silences still have pulse. Defaults to true. */
  metronome?: boolean;
  /** Time signature shown in the score. The click grid is derived from this. Defaults to 4/4. */
  timeSignature?: string;
  /** Number of count-in bars before the pattern starts. Preferred over countInBeats. */
  countInBars?: number;
  /** Legacy: number of count-in clicks before the pattern starts. Defaults to 0. */
  countInBeats?: number;
  /** If true, only the metronome sounds. Useful before the user attempts the exercise. */
  metronomeOnly?: boolean;
  /** Legacy: beats per measure for downbeat accents. Use timeSignature instead. */
  beatsPerMeasure?: number;
};

export function timeSignatureFromAbc(abc?: string, fallback = "4/4") {
  const match = abc?.match(/^M:\s*([^\n\r]+)/m);
  return match?.[1]?.trim() || fallback;
}

export function getMetronomeProfile(timeSignature = "4/4"): MetronomeProfile {
  const [rawTop, rawBottom] = timeSignature.split("/");
  const beatsPerBar = Number(rawTop);
  const beatUnit = Number(rawBottom);
  const safeBeats = Number.isFinite(beatsPerBar) && beatsPerBar > 0 ? beatsPerBar : 4;
  const safeUnit = Number.isFinite(beatUnit) && beatUnit > 0 ? beatUnit : 4;

  const secondaryAccentsByMeter: Record<string, number[]> = {
    "6/8": [3],
    "9/8": [3, 6],
    "12/8": [3, 6, 9],
    "7/8": [3, 5], // pedagogical grouping: 3 + 2 + 2
    "5/8": [3],    // pedagogical grouping: 3 + 2
  };
  const strongAccents = [0];
  const secondaryAccents = secondaryAccentsByMeter[timeSignature] ?? [];

  return {
    timeSignature,
    beatsPerBar: safeBeats,
    beatUnit: safeUnit,
    clickQuarterBeats: 4 / safeUnit,
    accents: [...strongAccents, ...secondaryAccents],
    strongAccents,
    secondaryAccents,
  };
}

export function metronomeClickKind(profile: MetronomeProfile, clickInBar: number): "strong" | "secondary" | "normal" {
  if (profile.strongAccents.includes(clickInBar)) return "strong";
  if (profile.secondaryAccents.includes(clickInBar)) return "secondary";
  return "normal";
}

export function metronomeClickLabel(kind: "strong" | "secondary" | "normal"): MetronomeClickLabel {
  if (kind === "strong") return "CLIC";
  if (kind === "secondary") return "toc";
  return "tac";
}

export function getMetronomeSequence(timeSignature = "4/4"): MetronomeSequenceStep[] {
  const profile = getMetronomeProfile(timeSignature);
  return Array.from({ length: profile.beatsPerBar }, (_, index) => {
    const kind = metronomeClickKind(profile, index);
    return { beat: index + 1, label: metronomeClickLabel(kind), kind };
  });
}

export function quarterBeatsPerBar(timeSignature = "4/4") {
  const profile = getMetronomeProfile(timeSignature);
  return profile.beatsPerBar * profile.clickQuarterBeats;
}

export function playRhythmPattern(
  hits: RhythmHit[],
  bpm = 80,
  fallbackNote: NoteName = "C4",
  options: PlayRhythmOptions = {}
) {
  primeAudioEngine();

  const profile = getMetronomeProfile(options.timeSignature);
  const quarterSeconds = 60 / bpm;
  const secondsPerClick = quarterSeconds * profile.clickQuarterBeats;
  const orderedHits = audibleHits(hits);
  const metronome = options.metronome ?? true;
  const countInClicks = Math.max(
    0,
    options.countInBars !== undefined
      ? Math.round(options.countInBars * profile.beatsPerBar)
      : (options.countInBeats ?? 0)
  );
  const countInSeconds = countInClicks * secondsPerClick;
  const maxHitBeat = hits.reduce((max, hit) => Math.max(max, hit.beat), 0);
  const totalQuarterBeats = Math.max(profile.clickQuarterBeats, options.totalBeats ?? maxHitBeat + profile.clickQuarterBeats);
  const exerciseClicks = Math.max(1, Math.ceil(totalQuarterBeats / profile.clickQuarterBeats));

  const pianoEvents = options.metronomeOnly ? [] : orderedHits.map((hit, index) => {
    const writtenDuration = Math.max(profile.clickQuarterBeats * 0.25, hit.durationBeats ?? profile.clickQuarterBeats);
    const durationSeconds = Math.max(0.06, writtenDuration * quarterSeconds * 0.92);

    return {
      time: countInSeconds + hit.beat * quarterSeconds,
      duration: durationSeconds,
      note: hit.note ?? fallbackNote,
      velocity: hit.accent || index === 0 ? 0.95 : 0.72,
      accent: hit.accent || index === 0,
    };
  });

  const clickEvents = metronome
    ? Array.from({ length: exerciseClicks + countInClicks }, (_, index) => {
        const isCountIn = index < countInClicks;
        const exerciseClick = index - countInClicks;
        const clickInBar = ((isCountIn ? index : exerciseClick) % profile.beatsPerBar + profile.beatsPerBar) % profile.beatsPerBar;
        const kind = isCountIn ? (clickInBar === 0 ? "strong" : "normal") : metronomeClickKind(profile, clickInBar);
        return {
          time: index * secondsPerClick,
          kind,
        };
      })
    : [];

  const context = getAudioContext();
  if (!context) return;

  const startAt = context.currentTime + 0.045;

  // The metronome is always a real click, never a piano note.
  // The click grid follows the written time signature: 4/4 = quarters, 3/8 = eighths, 6/8 = six eighth-clicks with accents on 1 and 4.
  clickEvents.forEach((event) => {
    playMetronomeClick(context, startAt + event.time, event.kind);
  });

  // Every audible score event uses piano. If sampled piano is not ready yet,
  // the immediate fallback is still piano-like, never a metronome beep.
  const scheduledWithSamples = tryScheduleRealisticPianoRhythm(pianoEvents);

  if (scheduledWithSamples) return;

  pianoEvents.forEach((event) => {
    playTone(context, startAt + event.time, event.note, event.velocity * 0.36, event.duration);
  });
}


function abcDurationToMultiplier(raw = "") {
  if (!raw) return 1;
  if (raw === "/") return 0.5;
  if (raw.startsWith("/")) {
    const denominator = Number(raw.slice(1));
    return Number.isFinite(denominator) && denominator > 0 ? 1 / denominator : 0.5;
  }
  if (raw.includes("/")) {
    const [numRaw, denRaw] = raw.split("/");
    const numerator = numRaw ? Number(numRaw) : 1;
    const denominator = denRaw ? Number(denRaw) : 2;
    return Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0 ? numerator / denominator : 1;
  }
  const number = Number(raw);
  return Number.isFinite(number) && number > 0 ? number : 1;
}

function baseQuarterBeatsFromAbc(abc?: string) {
  const match = abc?.match(/^L:\s*(\d+)\s*\/\s*(\d+)/m);
  if (!match) return 1;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 1;
  return numerator * (4 / denominator);
}

function abcPitchToNote(accidental: string, rawLetter: string, octaveMarks = ""): NoteName {
  const upper = rawLetter.toUpperCase();
  const sharp = accidental === "^" ? "#" : "";
  let octave = rawLetter === rawLetter.toLowerCase() ? 5 : 4;
  for (const char of octaveMarks) {
    if (char === ",") octave -= 1;
    if (char === "'") octave += 1;
  }
  const note = `${upper}${sharp}${octave}` as NoteName;
  return FREQUENCIES[note] ? note : "C4";
}

function stripAbcHeader(abc?: string) {
  if (!abc) return "";
  return abc
    .split(/\r?\n/)
    .filter(line => !/^[A-Z]:/.test(line.trim()))
    .join(" ");
}

export function hitsFromAbc(abc?: string, defaultNote: NoteName = "C4"): RhythmHit[] {
  const body = stripAbcHeader(abc)
    .replace(/"[^"]*"/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[|:]/g, " ");
  const baseQuarterBeats = baseQuarterBeatsFromAbc(abc);
  const hits: RhythmHit[] = [];
  let beat = 0;
  let tripletRemaining = 0;

  const tokenRegex = /(\(3)|([\^_=]?)([A-Ga-gz])([,']*)(\d+\/\d+|\d+|\/\d+|\/)?-?/g;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(body)) !== null) {
    if (match[1] === "(3") {
      tripletRemaining = 3;
      continue;
    }

    const accidental = match[2] ?? "";
    const letter = match[3];
    const octaveMarks = match[4] ?? "";
    const durationRaw = match[5] ?? "";
    const tripletScale = tripletRemaining > 0 ? 2 / 3 : 1;
    const duration = baseQuarterBeats * abcDurationToMultiplier(durationRaw) * tripletScale;
    const isRest = letter.toLowerCase() === "z";

    hits.push({
      beat,
      durationBeats: duration,
      note: isRest ? undefined : abcPitchToNote(accidental, letter, octaveMarks),
      rest: isRest,
      accent: Math.abs(beat) < 0.001,
      label: isRest ? "—" : undefined,
    });

    beat += duration;
    if (tripletRemaining > 0) tripletRemaining -= 1;
  }

  return hits.length ? hits : [{ beat: 0, note: defaultNote, accent: true, label: "TA" }];
}

export function totalQuarterBeatsFromAbc(abc?: string) {
  const hits = hitsFromAbc(abc);
  const base = baseQuarterBeatsFromAbc(abc);
  if (!hits.length) return base;
  return hits.reduce((max, hit) => {
    return Math.max(max, hit.beat + (hit.durationBeats ?? base));
  }, 0);
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
      hits.push({ beat: beatIndex, durationBeats: 1, rest: true, label: raw });
      return;
    }

    if (syllable.includes("ta-ki-ta")) {
      hits.push(
        { beat: beatIndex, durationBeats: 1 / 3, note, accent: beatIndex === 0, label: "TA" },
        { beat: beatIndex + 1 / 3, durationBeats: 1 / 3, note, label: "KI" },
        { beat: beatIndex + 2 / 3, durationBeats: 1 / 3, note, label: "TA" }
      );
      return;
    }

    if (syllable.includes("ta-ka-di-mi")) {
      hits.push(
        { beat: beatIndex, durationBeats: 0.25, note, accent: beatIndex === 0, label: "TA" },
        { beat: beatIndex + 0.25, durationBeats: 0.25, note, label: "KA" },
        { beat: beatIndex + 0.5, durationBeats: 0.25, note, label: "DI" },
        { beat: beatIndex + 0.75, durationBeats: 0.25, note, label: "MI" }
      );
      return;
    }

    if (syllable.includes("ta-ka") || syllable.includes("ta-di")) {
      hits.push(
        { beat: beatIndex, durationBeats: 0.5, note, accent: beatIndex === 0, label: "TA" },
        { beat: beatIndex + 0.5, durationBeats: 0.5, note, label: "KA" }
      );
      return;
    }

    hits.push({ beat: beatIndex, durationBeats: 1, note, accent: beatIndex === 0, label: raw });
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

export function playBimanualPattern(hits: BimanualHit[], bpm = 80, timeSignature = "4/4") {
  primeAudioEngine();
  const secondsPerBeat = 60 / bpm;
  const orderedHits = audibleBimanualHits(hits);
  const profile = getMetronomeProfile(timeSignature);
  const context = getAudioContext();
  if (!context) return;

  const startAt = context.currentTime + 0.06;
  const maxHitBeat = hits.reduce((max, hit) => Math.max(max, hit.beat), 0);
  const totalQuarterBeats = Math.max(profile.clickQuarterBeats, maxHitBeat + profile.clickQuarterBeats);
  const totalClicks = Math.ceil(totalQuarterBeats / profile.clickQuarterBeats);
  const secondsPerClick = secondsPerBeat * profile.clickQuarterBeats;

  Array.from({ length: totalClicks }, (_, index) => {
    const clickInBar = index % profile.beatsPerBar;
    playMetronomeClick(context, startAt + index * secondsPerClick, metronomeClickKind(profile, clickInBar));
  });

  const pianoEvents = orderedHits.map((hit, index) => ({
    time: hit.beat * secondsPerBeat,
    duration: Math.max(0.06, (hit.durationBeats ?? profile.clickQuarterBeats) * secondsPerBeat * 0.9),
    note: hit.note ?? (hit.hand === "left" ? "C3" : "C4"),
    velocity: hit.accent || index === 0 ? 0.95 : 0.7,
    accent: hit.accent || index === 0,
  }));

  const scheduledWithSamples = tryScheduleRealisticPianoRhythm(pianoEvents);
  if (scheduledWithSamples) return;

  pianoEvents.forEach((event) => {
    playTone(context, startAt + event.time, event.note, event.velocity * 0.36, event.duration);
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
  const errors: number[] = [];
  let correct = 0;
  let early = 0;
  let late = 0;

  const count = Math.min(targetMs.length, actualMs.length);
  for (let index = 0; index < count; index += 1) {
    const error = actualMs[index] - targetMs[index];
    const abs = Math.abs(error);
    errors.push(abs);
    if (abs <= toleranceMs) correct += 1;
    else if (error < 0) early += 1;
    else late += 1;
  }

  const missed = Math.max(0, targetMs.length - actualMs.length);
  const extra = Math.max(0, actualMs.length - targetMs.length);
  const avgError = errors.reduce((sum, error) => sum + error, 0) / Math.max(1, errors.length);
  const timingScore = Math.max(0, 100 - (avgError / toleranceMs) * 100);
  const score = clampScore(timingScore - missed * 12 - extra * 8);

  return { score, errors, missed, extra, correct, early, late };
}

export function evaluateBimanualTaps(taps: BimanualTap[], hits: BimanualHit[], bpm = 80, toleranceMultiplier = 0.35): BimanualEvaluation {
  const targets = audibleBimanualHits(hits);
  const leftTargets = targets.filter((hit) => hit.hand === "left");
  const rightTargets = targets.filter((hit) => hit.hand === "right");
  const leftTaps = taps.filter((tap) => tap.hand === "left");
  const rightTaps = taps.filter((tap) => tap.hand === "right");

  const left = evaluateHand(leftTaps, leftTargets, bpm, 0.32);
  const right = evaluateHand(rightTaps, rightTargets, bpm, 0.32);
  const overall = evaluateHand([...taps].sort((a, b) => a.at - b.at), targets, bpm, toleranceMultiplier);

  const expectedAlternation = targets.slice(1).map((hit, index) => (hit.hand !== targets[index].hand ? 1 : 0));
  const actualAlternation = taps.slice(1).map((tap, index) => (tap.hand !== taps[index].hand ? 1 : 0));
  const alternationCount = Math.min(expectedAlternation.length, actualAlternation.length);
  const alternationMatches = Array.from({ length: alternationCount }, (_, index): number => expectedAlternation[index] === actualAlternation[index] ? 1 : 0)
    .reduce<number>((sum, value) => sum + value, 0);
  const coordinationAccuracy = alternationCount ? clampScore((alternationMatches / expectedAlternation.length) * 100) : 100;

  const silenceAccuracy = clampScore(100 - overall.extra * 12);
  const score = clampScore(left.score * 0.22 + right.score * 0.22 + overall.score * 0.34 + coordinationAccuracy * 0.14 + silenceAccuracy * 0.08);

  const allErrors = [...left.errors, ...right.errors, ...overall.errors];
  const averageErrorMs = Math.round(allErrors.reduce((sum, error) => sum + error, 0) / Math.max(1, allErrors.length));

  return {
    score,
    leftAccuracy: left.score,
    rightAccuracy: right.score,
    timingAccuracy: overall.score,
    coordinationAccuracy,
    silenceAccuracy,
    averageErrorMs,
    earlyCount: left.early + right.early + overall.early,
    lateCount: left.late + right.late + overall.late,
    missedCount: left.missed + right.missed + overall.missed,
    extraCount: left.extra + right.extra + overall.extra,
    correctHits: left.correct + right.correct,
    expectedHits: targets.length,
  };
}

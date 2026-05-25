import type { BimanualHit } from "./rhythm-engine";

export type BimanualExercise = {
  slug: string;
  title: string;
  levelName: string;
  difficulty: "Inicial" | "Básico" | "Intermedio" | "Avanzado" | "Experto" | "Maestro";
  description: string;
  objective: string;
  theory: string[];
  cognitiveStrategy: string;
  recommendedBpm: number;
  minBpm: number;
  maxBpm: number;
  beats: number;
  xp: number;
  passScore: number;
  leftPattern: string[];
  rightPattern: string[];
  hits: BimanualHit[];
  polyrhythmGrid?: { left: number[]; right: number[]; totalBeats: number };
};

function bar(events: BimanualHit[], bars = 2, bpb = 4): BimanualHit[] {
  const all: BimanualHit[] = [];
  for (let b = 0; b < bars; b++) {
    const off = b * bpb;
    events.forEach(e => all.push({ ...e, beat: e.beat + off, accent: e.accent || e.beat % bpb === 0 }));
  }
  return all;
}

// ─── Hit patterns ─────────────────────────────────────────────────────────────

const bothQ = bar([
  { hand: "left",  beat: 0, label: "TA", note: "C3", accent: true },
  { hand: "right", beat: 0, label: "TA", note: "C4", accent: true },
  { hand: "left",  beat: 1, label: "TA", note: "C3" },
  { hand: "right", beat: 1, label: "TA", note: "C4" },
  { hand: "left",  beat: 2, label: "TA", note: "C3" },
  { hand: "right", beat: 2, label: "TA", note: "C4" },
  { hand: "left",  beat: 3, label: "TA", note: "C3" },
  { hand: "right", beat: 3, label: "TA", note: "C4" },
]);

// left: quarter notes, right: slow (half notes)
const leftQRightHalf = bar([
  { hand: "left",  beat: 0, label: "TA", note: "C3", accent: true },
  { hand: "right", beat: 0, label: "TA", note: "C4", accent: true },
  { hand: "left",  beat: 1, label: "TA", note: "C3" },
  { hand: "left",  beat: 2, label: "TA", note: "C3" },
  { hand: "right", beat: 2, label: "TA", note: "C4" },
  { hand: "left",  beat: 3, label: "TA", note: "C3" },
]);

const alternation = bar([
  { hand: "left",  beat: 0,   label: "TA", note: "C3", accent: true },
  { hand: "right", beat: 0.5, label: "KA", note: "C4" },
  { hand: "left",  beat: 1,   label: "TA", note: "C3" },
  { hand: "right", beat: 1.5, label: "KA", note: "C4" },
  { hand: "left",  beat: 2,   label: "TA", note: "C3" },
  { hand: "right", beat: 2.5, label: "KA", note: "C4" },
  { hand: "left",  beat: 3,   label: "TA", note: "C3" },
  { hand: "right", beat: 3.5, label: "KA", note: "C4" },
]);

const leftQRightE = bar([
  { hand: "left",  beat: 0,   label: "TA", note: "C3", accent: true },
  { hand: "right", beat: 0,   label: "TA", note: "C4", accent: true },
  { hand: "right", beat: 0.5, label: "KA", note: "D4" },
  { hand: "left",  beat: 1,   label: "TA", note: "C3" },
  { hand: "right", beat: 1,   label: "TA", note: "C4" },
  { hand: "right", beat: 1.5, label: "KA", note: "D4" },
  { hand: "left",  beat: 2,   label: "TA", note: "C3" },
  { hand: "right", beat: 2,   label: "TA", note: "C4" },
  { hand: "right", beat: 2.5, label: "KA", note: "D4" },
  { hand: "left",  beat: 3,   label: "TA", note: "C3" },
  { hand: "right", beat: 3,   label: "TA", note: "C4" },
  { hand: "right", beat: 3.5, label: "KA", note: "D4" },
]);

// Left: eighths, right: quarter (inverse of above)
const leftERightQ = bar([
  { hand: "left",  beat: 0,   label: "TA", note: "C3", accent: true },
  { hand: "right", beat: 0,   label: "TA", note: "C4", accent: true },
  { hand: "left",  beat: 0.5, label: "KA", note: "D3" },
  { hand: "left",  beat: 1,   label: "TA", note: "C3" },
  { hand: "right", beat: 1,   label: "TA", note: "C4" },
  { hand: "left",  beat: 1.5, label: "KA", note: "D3" },
  { hand: "left",  beat: 2,   label: "TA", note: "C3" },
  { hand: "right", beat: 2,   label: "TA", note: "C4" },
  { hand: "left",  beat: 2.5, label: "KA", note: "D3" },
  { hand: "left",  beat: 3,   label: "TA", note: "C3" },
  { hand: "right", beat: 3,   label: "TA", note: "C4" },
  { hand: "left",  beat: 3.5, label: "KA", note: "D3" },
]);

const bothE = bar([
  { hand: "left",  beat: 0,   label: "TA", note: "C3", accent: true },
  { hand: "right", beat: 0,   label: "TA", note: "C4", accent: true },
  { hand: "left",  beat: 0.5, label: "KA", note: "D3" },
  { hand: "right", beat: 0.5, label: "KA", note: "D4" },
  { hand: "left",  beat: 1,   label: "TA", note: "C3" },
  { hand: "right", beat: 1,   label: "TA", note: "C4" },
  { hand: "left",  beat: 1.5, label: "KA", note: "D3" },
  { hand: "right", beat: 1.5, label: "KA", note: "D4" },
  { hand: "left",  beat: 2,   label: "TA", note: "C3" },
  { hand: "right", beat: 2,   label: "TA", note: "C4" },
  { hand: "left",  beat: 2.5, label: "KA", note: "D3" },
  { hand: "right", beat: 2.5, label: "KA", note: "D4" },
  { hand: "left",  beat: 3,   label: "TA", note: "C3" },
  { hand: "right", beat: 3,   label: "TA", note: "C4" },
  { hand: "left",  beat: 3.5, label: "KA", note: "D3" },
  { hand: "right", beat: 3.5, label: "KA", note: "D4" },
]);

// Dotted quarter left vs eighths right (habanera feel)
const leftDotRightE = bar([
  { hand: "left",  beat: 0,    label: "TA.", note: "C3", accent: true },
  { hand: "right", beat: 0,    label: "TA",  note: "C4", accent: true },
  { hand: "right", beat: 0.5,  label: "KA",  note: "D4" },
  { hand: "right", beat: 1,    label: "TA",  note: "C4" },
  { hand: "left",  beat: 1.5,  label: "TA.", note: "C3" },
  { hand: "right", beat: 1.5,  label: "KA",  note: "D4" },
  { hand: "right", beat: 2,    label: "TA",  note: "C4" },
  { hand: "right", beat: 2.5,  label: "KA",  note: "D4" },
  { hand: "left",  beat: 3,    label: "TA.", note: "C3" },
  { hand: "right", beat: 3,    label: "TA",  note: "C4" },
  { hand: "right", beat: 3.5,  label: "KA",  note: "D4" },
]);

const leftQRightT = bar([
  { hand: "left",  beat: 0,       label: "TA",  note: "C3", accent: true },
  { hand: "right", beat: 0,       label: "TA",  note: "C4", accent: true },
  { hand: "right", beat: 1/3,     label: "KI",  note: "D4" },
  { hand: "right", beat: 2/3,     label: "TA",  note: "E4" },
  { hand: "left",  beat: 1,       label: "TA",  note: "C3" },
  { hand: "right", beat: 1,       label: "TA",  note: "C4" },
  { hand: "right", beat: 1+1/3,   label: "KI",  note: "D4" },
  { hand: "right", beat: 1+2/3,   label: "TA",  note: "E4" },
  { hand: "left",  beat: 2,       label: "TA",  note: "C3" },
  { hand: "right", beat: 2,       label: "TA",  note: "C4" },
  { hand: "right", beat: 2+1/3,   label: "KI",  note: "D4" },
  { hand: "right", beat: 2+2/3,   label: "TA",  note: "E4" },
  { hand: "left",  beat: 3,       label: "TA",  note: "C3" },
  { hand: "right", beat: 3,       label: "TA",  note: "C4" },
  { hand: "right", beat: 3+1/3,   label: "KI",  note: "D4" },
  { hand: "right", beat: 3+2/3,   label: "TA",  note: "E4" },
]);

// Left: triplets, right: quarters (inverse)
const leftTRightQ = bar([
  { hand: "left",  beat: 0,       label: "TA",  note: "C3", accent: true },
  { hand: "right", beat: 0,       label: "TA",  note: "C4", accent: true },
  { hand: "left",  beat: 1/3,     label: "KI",  note: "D3" },
  { hand: "left",  beat: 2/3,     label: "TA",  note: "E3" },
  { hand: "left",  beat: 1,       label: "TA",  note: "C3" },
  { hand: "right", beat: 1,       label: "TA",  note: "C4" },
  { hand: "left",  beat: 1+1/3,   label: "KI",  note: "D3" },
  { hand: "left",  beat: 1+2/3,   label: "TA",  note: "E3" },
  { hand: "left",  beat: 2,       label: "TA",  note: "C3" },
  { hand: "right", beat: 2,       label: "TA",  note: "C4" },
  { hand: "left",  beat: 2+1/3,   label: "KI",  note: "D3" },
  { hand: "left",  beat: 2+2/3,   label: "TA",  note: "E3" },
  { hand: "left",  beat: 3,       label: "TA",  note: "C3" },
  { hand: "right", beat: 3,       label: "TA",  note: "C4" },
  { hand: "left",  beat: 3+1/3,   label: "KI",  note: "D3" },
  { hand: "left",  beat: 3+2/3,   label: "TA",  note: "E3" },
]);

// Left: eighths, right: triplets (binary vs ternary conflict)
const leftERightT = bar([
  { hand: "left",  beat: 0,       label: "TA", note: "C3", accent: true },
  { hand: "right", beat: 0,       label: "TA", note: "C4", accent: true },
  { hand: "right", beat: 1/3,     label: "KI", note: "D4" },
  { hand: "left",  beat: 0.5,     label: "KA", note: "D3" },
  { hand: "right", beat: 2/3,     label: "TA", note: "E4" },
  { hand: "left",  beat: 1,       label: "TA", note: "C3" },
  { hand: "right", beat: 1,       label: "TA", note: "C4" },
  { hand: "right", beat: 1+1/3,   label: "KI", note: "D4" },
  { hand: "left",  beat: 1.5,     label: "KA", note: "D3" },
  { hand: "right", beat: 1+2/3,   label: "TA", note: "E4" },
  { hand: "left",  beat: 2,       label: "TA", note: "C3" },
  { hand: "right", beat: 2,       label: "TA", note: "C4" },
  { hand: "right", beat: 2+1/3,   label: "KI", note: "D4" },
  { hand: "left",  beat: 2.5,     label: "KA", note: "D3" },
  { hand: "right", beat: 2+2/3,   label: "TA", note: "E4" },
  { hand: "left",  beat: 3,       label: "TA", note: "C3" },
  { hand: "right", beat: 3,       label: "TA", note: "C4" },
  { hand: "right", beat: 3+1/3,   label: "KI", note: "D4" },
  { hand: "left",  beat: 3.5,     label: "KA", note: "D3" },
  { hand: "right", beat: 3+2/3,   label: "TA", note: "E4" },
]);

const leftQRightS = bar(Array.from({ length: 4 }).flatMap((_, b) => [
  { hand: "left",  beat: b,        label: "TA",  note: "C3", accent: b === 0 } as BimanualHit,
  { hand: "right", beat: b,        label: "TA",  note: "C4", accent: b === 0 } as BimanualHit,
  { hand: "right", beat: b + 0.25, label: "KA",  note: "D4" } as BimanualHit,
  { hand: "right", beat: b + 0.5,  label: "DI",  note: "E4" } as BimanualHit,
  { hand: "right", beat: b + 0.75, label: "MI",  note: "F4" } as BimanualHit,
]));

const crossedSync = bar([
  { hand: "left",  beat: 0,   label: "TA", note: "C3", accent: true },
  { hand: "right", beat: 0.5, label: "ka", note: "C4" },
  { hand: "left",  beat: 1,   label: "TA", note: "C3" },
  { hand: "right", beat: 1.5, label: "ka", note: "C4", accent: true },
  { hand: "left",  beat: 2,   label: "TA", note: "C3" },
  { hand: "right", beat: 2.5, label: "ka", note: "C4" },
  { hand: "left",  beat: 3,   label: "TA", note: "C3" },
  { hand: "right", beat: 3.5, label: "ka", note: "C4", accent: true },
]);

const twoVsThree = bar([
  { hand: "left",  beat: 0,   label: "1", note: "C3", accent: true },
  { hand: "left",  beat: 2,   label: "2", note: "C3" },
  { hand: "right", beat: 0,   label: "1", note: "C4", accent: true },
  { hand: "right", beat: 4/3, label: "2", note: "D4" },
  { hand: "right", beat: 8/3, label: "3", note: "E4" },
]);

const threeVsFour = bar([
  { hand: "left",  beat: 0,   label: "1", note: "C3", accent: true },
  { hand: "left",  beat: 4/3, label: "2", note: "C3" },
  { hand: "left",  beat: 8/3, label: "3", note: "C3" },
  { hand: "right", beat: 0,   label: "1", note: "C4", accent: true },
  { hand: "right", beat: 1,   label: "2", note: "D4" },
  { hand: "right", beat: 2,   label: "3", note: "E4" },
  { hand: "right", beat: 3,   label: "4", note: "F4" },
]);

const fourVsFive = bar([
  { hand: "left",  beat: 0,   label: "1", note: "C3", accent: true },
  { hand: "left",  beat: 1,   label: "2", note: "C3" },
  { hand: "left",  beat: 2,   label: "3", note: "C3" },
  { hand: "left",  beat: 3,   label: "4", note: "C3" },
  { hand: "right", beat: 0,   label: "1", note: "C4", accent: true },
  { hand: "right", beat: 4/5, label: "2", note: "D4" },
  { hand: "right", beat: 8/5, label: "3", note: "E4" },
  { hand: "right", beat: 12/5,label: "4", note: "F4" },
  { hand: "right", beat: 16/5,label: "5", note: "G4" },
]);

// ─── Exercise list ────────────────────────────────────────────────────────────

export const bimanualExercises: BimanualExercise[] = [
  {
    slug: "juntas-negras",
    title: "Manos juntas — negras",
    levelName: "Sincronía básica",
    difficulty: "Inicial",
    description: "Ambas manos tocan exactamente al mismo tiempo en cada pulso.",
    objective: "Un solo sonido por golpe, sin flam ni arrastre.",
    theory: [
      "Cuando dos manos tocan simultáneamente, el cerebro envía dos señales motoras paralelas. En principiantes aparece el 'flam': un doble golpe que suena como si hubiera dos notas separadas.",
      "El objetivo es crear acoplamiento bimanual — un estado donde ambas manos comparten el mismo reloj neural. Se construye con repetición lenta y escucha activa.",
      "Antes de usar la app, apoyá ambas manos en una mesa y tocá a 60 BPM. Si escuchás UN sonido, el acoplamiento está funcionando. Si escuchás DOS, bajás el tempo."
    ],
    cognitiveStrategy: "Concentrate en ESCUCHAR, no en mover. El oído es el juez — un flam es la señal para frenar y repetir más lento.",
    recommendedBpm: 70, minBpm: 50, maxBpm: 110, beats: 8, xp: 30, passScore: 72,
    leftPattern:  ["TA","TA","TA","TA","TA","TA","TA","TA"],
    rightPattern: ["TA","TA","TA","TA","TA","TA","TA","TA"],
    hits: bothQ,
  },
  {
    slug: "negras-derecha-lenta",
    title: "Pulso izquierda — blancas derecha",
    levelName: "Densidades distintas",
    difficulty: "Inicial",
    description: "La izquierda toca cada pulso, la derecha toca cada dos pulsos.",
    objective: "Sentir que una mano va el doble de lenta que la otra.",
    theory: [
      "Este ejercicio introduce la primera diferencia de densidad: la mano izquierda marca cada pulso (negras) mientras la derecha marca cada dos pulsos (blancas). La relación es 2:1.",
      "Es el modelo básico de toda música con acompañamiento: la mano izquierda del piano suele llevar el pulso mientras la derecha lleva una melodía más lenta o más rápida.",
      "La dificultad cognitiva es pequeña pero real: la mano derecha debe 'saltear' un pulso de forma consistente, sin acelerarse para alcanzar a la izquierda."
    ],
    cognitiveStrategy: "Contá internamente '1-2-1-2'. La derecha toca solo en el '1'. La izquierda toca en cada número.",
    recommendedBpm: 72, minBpm: 52, maxBpm: 112, beats: 8, xp: 35, passScore: 72,
    leftPattern:  ["TA","TA","TA","TA","TA","TA","TA","TA"],
    rightPattern: ["TA","—","TA","—","TA","—","TA","—"],
    hits: leftQRightHalf,
  },
  {
    slug: "alternancia",
    title: "Alternancia izquierda-derecha",
    levelName: "Independencia inicial",
    difficulty: "Básico",
    description: "Las manos se turnan: izquierda en el pulso, derecha en la subdivisión.",
    objective: "Cuatro intervalos iguales, sin que una mano 'apure' a la otra.",
    theory: [
      "La alternancia perfecta es como caminar: cada paso ocupa exactamente el mismo tiempo. En música, el intervalo izquierda→derecha debe ser idéntico al intervalo derecha→izquierda.",
      "El error más común es que la mano derecha se apresura hacia la siguiente izquierda, creando un ritmo largo-corto en lugar de cuatro intervalos iguales.",
      "Cantá 'IZ-DER-IZ-DER' a tempo constante mientras tocás. Si las sílabas suenan parejas, el ritmo es correcto."
    ],
    cognitiveStrategy: "Imaginá que tocás cuatro bolas cayendo a intervalos exactamente iguales. No hay mano principal — ambas son parte de la misma cadena.",
    recommendedBpm: 76, minBpm: 54, maxBpm: 124, beats: 8, xp: 40, passScore: 74,
    leftPattern:  ["TA","—","TA","—","TA","—","TA","—"],
    rightPattern: ["—","KA","—","KA","—","KA","—","KA"],
    hits: alternation,
  },
  {
    slug: "pulso-vs-corcheas",
    title: "Pulso izquierda — corcheas derecha",
    levelName: "Subdivisión binaria",
    difficulty: "Básico",
    description: "La izquierda sostiene negras, la derecha subdivide en dos.",
    objective: "Pulso estable mientras la derecha toca TA-KA.",
    theory: [
      "Este es el primer ejercicio de verdadera independencia: una mano mantiene el pulso mientras la otra crea el doble de eventos. El cerebro debe gestionar dos velocidades simultáneas.",
      "El 'arrastre' es el error clásico: la mano lenta acelera para igualar a la rápida. Ambas son respuestas automáticas del sistema motor que hay que superar.",
      "La técnica: anclar mentalmente la mano izquierda. Imaginá que es un metrónomo inamovible. La derecha es la que trabaja sobre esa base fija."
    ],
    cognitiveStrategy: "Fijate en la izquierda como ancla. Si sentís que la izquierda se mueve para acomodarse a la derecha, es la señal para reiniciar.",
    recommendedBpm: 72, minBpm: 50, maxBpm: 120, beats: 8, xp: 50, passScore: 74,
    leftPattern:  ["TA","TA","TA","TA","TA","TA","TA","TA"],
    rightPattern: ["TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA"],
    hits: leftQRightE,
  },
  {
    slug: "corcheas-izq-pulso-der",
    title: "Corcheas izquierda — pulso derecha",
    levelName: "Subdivisión invertida",
    difficulty: "Básico",
    description: "Inversión del ejercicio anterior: ahora la izquierda subdivide.",
    objective: "Entrenar que cualquier mano pueda ser la rápida o la lenta.",
    theory: [
      "La mayoría de los estudiantes practican subdivisión solo con la mano derecha porque eso es lo que pide la música clásica básica. Pero la independencia real exige que cualquier mano pueda asumir cualquier rol.",
      "Invertir el ejercicio revela asimetrías ocultas: si la mano izquierda le resulta mucho más difícil subdividir, esa asimetría limita el repertorio que vas a poder tocar.",
      "Este ejercicio es la base del acompañamiento de bajo con arpegios: la mano izquierda ejecuta figuras rápidas mientras la derecha sostiene notas largas o acordes."
    ],
    cognitiveStrategy: "Ahora la derecha es el ancla y la izquierda trabaja. El desafío mental es confiarle el pulso a la mano que normalmente 'sigue'.",
    recommendedBpm: 68, minBpm: 48, maxBpm: 108, beats: 8, xp: 55, passScore: 74,
    leftPattern:  ["TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA"],
    rightPattern: ["TA","TA","TA","TA","TA","TA","TA","TA"],
    hits: leftERightQ,
  },
  {
    slug: "corcheas-juntas",
    title: "Corcheas juntas",
    levelName: "Sincronía subdividida",
    difficulty: "Básico",
    description: "Ambas manos tocan corcheas al mismo tiempo.",
    objective: "Sincronía perfecta en subdivisión — sin flam en las corcheas.",
    theory: [
      "Si las negras juntas ya presentaban el reto del flam, las corcheas lo duplican: hay el doble de oportunidades para que aparezca una diferencia de timing entre manos.",
      "Este ejercicio consolida el acoplamiento bimanual a mayor velocidad. Es la base para tocar acordes con figuras rítmicas rápidas en ambas manos.",
      "Referencia musical: el acompañamiento de guitarra en corcheas de la música pop, o los acordes de corchea en el piano clásico, requieren exactamente esta sincronía."
    ],
    cognitiveStrategy: "Igual que las negras juntas: escuchá UN sonido, no dos. A mayor velocidad, la escucha debe ser más activa, no menos.",
    recommendedBpm: 74, minBpm: 52, maxBpm: 116, beats: 8, xp: 55, passScore: 75,
    leftPattern:  ["TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA"],
    rightPattern: ["TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA"],
    hits: bothE,
  },
  {
    slug: "negra-puntillo-vs-corcheas",
    title: "Negra con puntillo izq — corcheas der",
    levelName: "Ritmo de habanera",
    difficulty: "Intermedio",
    description: "La izquierda toca negra con puntillo (1,5 pulsos), la derecha toca corcheas.",
    objective: "Mantener el puntillo sin perder el pulso interno.",
    theory: [
      "La negra con puntillo dura 1,5 pulsos — vale una negra más una corchea. No es un valor que el cuerpo intuye naturalmente porque no corresponde a una división entera del pulso.",
      "Este patrón es la base del ritmo de habanera (Cuba), la bossa nova (Brasil), el tango argentino y el ritmo de 'clave'. Dominar el puntillo bimanual abre toda la música latinoamericana.",
      "La trampa: la mano izquierda tiende a tocar el puntillo como una negra normal (sin el valor extra) o como una blanca (demasiado largo). La corchea de la derecha da la referencia exacta para calibrar la duración."
    ],
    cognitiveStrategy: "Usá la derecha como reloj. El segundo ataque de la izquierda debe caer exactamente en el tercer ataque de la derecha. Si no coinciden, el puntillo está mal.",
    recommendedBpm: 68, minBpm: 48, maxBpm: 104, beats: 8, xp: 70, passScore: 75,
    leftPattern:  ["TA.","—","TA.","—","TA.","—","TA.","—"],
    rightPattern: ["TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA"],
    hits: leftDotRightE,
  },
  {
    slug: "pulso-vs-tresillos",
    title: "Pulso izquierda — tresillos derecha",
    levelName: "Ternario sobre binario",
    difficulty: "Intermedio",
    description: "La derecha toca tres golpes dentro de cada pulso binario.",
    objective: "Que el tresillo suene como 3 golpes parejos, no como corcheas apuradas.",
    theory: [
      "El tresillo divide un pulso binario en tres partes iguales. No son tres corcheas — las corcheas dividirían en dos. El tresillo crea una división ternaria dentro de un contexto binario.",
      "Cuando la mano izquierda sostiene el pulso y la derecha toca tresillos, el cerebro debe gestionar dos sistemas de división simultáneos. El tresillo tiende a binarizarse (suena como corchea-dos semicorcheas).",
      "Es la base del swing en jazz, del blues y de todos los patrones de shuffle. Cuando lo dominás, entendés por qué ciertos ritmos 'balancean'."
    ],
    cognitiveStrategy: "Cantá TA-KI-TA mientras la izquierda toca en silencio. Cuando el tresillo vocal sea estable, añadís la mano izquierda física.",
    recommendedBpm: 64, minBpm: 46, maxBpm: 108, beats: 8, xp: 72, passScore: 76,
    leftPattern:  ["TA","TA","TA","TA","TA","TA","TA","TA"],
    rightPattern: ["TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA"],
    hits: leftQRightT,
  },
  {
    slug: "tresillos-izq-pulso-der",
    title: "Tresillos izquierda — pulso derecha",
    levelName: "Ternario invertido",
    difficulty: "Intermedio",
    description: "Ahora la izquierda hace los tresillos y la derecha sostiene el pulso.",
    objective: "Independencia ternaria con la mano no dominante.",
    theory: [
      "Invertir el ejercicio de tresillos es crucial: la mano izquierda de los pianistas suele ser la que sostiene el acompañamiento ternario (como en los valses y los nocturnos de Chopin).",
      "Chopin, Brahms y Schubert usaban constantemente tresillos en la mano izquierda sobre melodías en corcheas en la derecha. Dominar este patrón invierte es la puerta de entrada al repertorio romántico.",
      "La dificultad neurológica es mayor que la versión anterior: la mano no dominante ejecuta la figura compleja mientras la dominante mantiene el pulso simple."
    ],
    cognitiveStrategy: "La derecha es el metrónomo. La izquierda danza sobre esa base. No pienses en la derecha una vez que esté estabilizada.",
    recommendedBpm: 60, minBpm: 44, maxBpm: 100, beats: 8, xp: 78, passScore: 75,
    leftPattern:  ["TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA"],
    rightPattern: ["TA","TA","TA","TA","TA","TA","TA","TA"],
    hits: leftTRightQ,
  },
  {
    slug: "corcheas-vs-tresillos",
    title: "Corcheas izquierda — tresillos derecha",
    levelName: "Conflicto binario-ternario",
    difficulty: "Avanzado",
    description: "La izquierda subdivide en 2, la derecha en 3. El choque más común en jazz.",
    objective: "Mantener dos grillas de subdivisión simultáneas sin que una contamine a la otra.",
    theory: [
      "Este es el conflicto rítmico más frecuente en jazz, blues y música clásica tardía: la mano izquierda subdivide binario (corcheas: 2 por pulso) mientras la derecha subdivide ternario (tresillos: 3 por pulso).",
      "Los dos sistemas no comparten puntos intermedios — solo coinciden al inicio de cada pulso. Entre esos puntos, las dos manos van por caminos completamente distintos.",
      "La solución profesional: practicar cada mano hasta que sea completamente automática antes de combinarlas. Cuando ambas son reflejas, el cerebro puede ejecutarlas simultáneamente sin colisión."
    ],
    cognitiveStrategy: "Practicá cada mano sola durante 2 minutos hasta que sea automática. Luego combiná. Nunca corrijas una mano mientras la otra toca — parás y reiniciás.",
    recommendedBpm: 58, minBpm: 42, maxBpm: 96, beats: 8, xp: 90, passScore: 76,
    leftPattern:  ["TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA","TA-KA"],
    rightPattern: ["TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA","TA-KI-TA"],
    hits: leftERightT,
  },
  {
    slug: "pulso-vs-semicorcheas",
    title: "Pulso izquierda — semicorcheas derecha",
    levelName: "Motor fino",
    difficulty: "Avanzado",
    description: "La derecha subdivide en cuatro ataques exactos por pulso.",
    objective: "TA-KA-DI-MI parejo sin apretar el tempo global.",
    theory: [
      "Cuatro semicorcheas por pulso contra una negra crea una relación 4:1. La mano derecha ejecuta cuatro movimientos equidistantes dentro del espacio que la izquierda golpea una vez.",
      "La trampa: al aumentar la densidad de la derecha, ambas manos tienden a acelerar juntas. Solución: siempre más lento, más consciente.",
      "Este ejercicio es la base técnica del piano clásico: la mano izquierda sostiene acordes mientras la derecha ejecuta figuras rápidas. Brahms, Chopin y Liszt lo usan constantemente."
    ],
    cognitiveStrategy: "El primer TA de cada grupo de cuatro debe coincidir exactamente con el golpe de la izquierda. Si ese primer TA se adelanta o atrasa, el grupo entero está mal.",
    recommendedBpm: 58, minBpm: 42, maxBpm: 96, beats: 8, xp: 88, passScore: 78,
    leftPattern:  ["TA","TA","TA","TA","TA","TA","TA","TA"],
    rightPattern: ["TA-KA-DI-MI","TA-KA-DI-MI","TA-KA-DI-MI","TA-KA-DI-MI","TA-KA-DI-MI","TA-KA-DI-MI","TA-KA-DI-MI","TA-KA-DI-MI"],
    hits: leftQRightS,
  },
  {
    slug: "sincopa-cruzada",
    title: "Síncopa cruzada",
    levelName: "Groove independiente",
    difficulty: "Avanzado",
    description: "La izquierda sostiene el pulso, la derecha entra en contratiempo.",
    objective: "Sentir el acento desplazado sin que el pulso se mueva.",
    theory: [
      "La síncopa cruzada es el mecanismo del groove: la izquierda establece el piso estable y la derecha lo contradice entrando exactamente entre los golpes. La tensión entre ambas es lo que genera swing.",
      "El error destructivo: mover la izquierda para 'acompañar' la síncopa. Cuando el piso se mueve, el groove desaparece.",
      "James Brown, Earth Wind & Fire, Prince — todo el funk clásico se construye sobre esta independencia. El bombo marca el 1 y el 3, el hi-hat entra en los contratiempos."
    ],
    cognitiveStrategy: "Ignorá la mano derecha mientras estabilizás la izquierda. La derecha 'se cuida sola' una vez que el piso está firme.",
    recommendedBpm: 78, minBpm: 56, maxBpm: 128, beats: 8, xp: 92, passScore: 80,
    leftPattern:  ["TA","TA","TA","TA","TA","TA","TA","TA"],
    rightPattern: ["—KA","—KA","—KA","—KA","—KA","—KA","—KA","—KA"],
    hits: crossedSync,
  },
  {
    slug: "dos-contra-tres",
    title: "Polirritmia 2 contra 3",
    levelName: "Polirritmia I",
    difficulty: "Experto",
    description: "Dos golpes en la izquierda contra tres en la derecha en el mismo espacio.",
    objective: "Coordinar puntos de encuentro y separación con precisión.",
    theory: [
      "La polirritmia 2:3 divide el mismo período en dos partes (izquierda) y tres partes (derecha) simultáneamente. Ambas manos empiezan y terminan juntas pero los puntos medios son distintos.",
      "El truco mnemotécnico clásico: 'NICE CUP OF TEA'. Izquierda toca en NICE y TEA. Derecha toca en NICE, CUP y TEA. Los puntos de encuentro anclan todo.",
      "Distribución exacta en 6 unidades: izquierda en 0 y 3, derecha en 0, 2 y 4. Solo se encuentran al inicio. La separación ocurre en 2, 3 y 4."
    ],
    cognitiveStrategy: "No cuentes ambas manos a la vez — es imposible. Memorizá los puntos de encuentro (inicio y fin) y los de separación como un patrón corporal, no como cálculo.",
    recommendedBpm: 56, minBpm: 40, maxBpm: 92, beats: 8, xp: 115, passScore: 78,
    leftPattern:  ["1","2","1","2","1","2"],
    rightPattern: ["1","2","3","1","2","3"],
    hits: twoVsThree,
    polyrhythmGrid: { left: [0, 3], right: [0, 2, 4], totalBeats: 6 },
  },
  {
    slug: "tres-contra-cuatro",
    title: "Polirritmia 3 contra 4",
    levelName: "Polirritmia II",
    difficulty: "Experto",
    description: "Tres golpes contra cuatro: el desafío clásico de coordinación.",
    objective: "Mantener dos grillas simultáneas sin que una arrastre a la otra.",
    theory: [
      "El período de coincidencia del 3:4 es de 12 unidades — el más largo hasta acá. Los puntos intermedios crean muchas oportunidades de sincronización falsa entre manos.",
      "Distribución: izquierda en 0, 4 y 8. Derecha en 0, 3, 6 y 9. Solo se encuentran en 0. La derecha lleva ventaja en 3, 6 y 9; la izquierda en 4 y 8.",
      "Aparece en la Fantasía-Impromptu de Chopin (mano derecha en corcheas, izquierda en tresillos de corchea), en Brahms y en mucha música africana clásica."
    ],
    cognitiveStrategy: "Aprendé cada mano sola hasta que sea completamente automática. Al combinar, enfocate solo en el punto de encuentro inicial. Dejá que el resto ocurra solo.",
    recommendedBpm: 48, minBpm: 36, maxBpm: 80, beats: 8, xp: 140, passScore: 76,
    leftPattern:  ["1","2","3","1","2","3"],
    rightPattern: ["1","2","3","4","1","2","3","4"],
    hits: threeVsFour,
    polyrhythmGrid: { left: [0, 4, 8], right: [0, 3, 6, 9], totalBeats: 12 },
  },
  {
    slug: "cuatro-contra-cinco",
    title: "Polirritmia 4 contra 5",
    levelName: "Polirritmia III",
    difficulty: "Maestro",
    description: "Cuatro golpes contra cinco: territorio de Ligeti y la música africana avanzada.",
    objective: "Sostener dos pulsos completamente independientes sin referencia común.",
    theory: [
      "El 4:5 tiene un período de coincidencia de 20 unidades. Solo se encuentran al inicio del ciclo completo. Cada mano vive en su propio universo temporal.",
      "Este es el nivel donde el concepto de 'contar' se vuelve inútil — el cerebro debe automatizar cada mano por separado hasta que ambas sean reflejas y puedan coexistir.",
      "György Ligeti usó patrones similares en sus Études para piano. La música tradicional del África subsahariana construye capas polirrítmicas de este nivel como práctica cotidiana."
    ],
    cognitiveStrategy: "Meses de práctica, no días. Primero automatizá el grupo de 4, luego el de 5, cada uno hasta que puedas mantenerlo mientras hablás. Solo entonces intentás combinarlos.",
    recommendedBpm: 44, minBpm: 32, maxBpm: 72, beats: 8, xp: 175, passScore: 72,
    leftPattern:  ["1","2","3","4","1","2","3","4"],
    rightPattern: ["1","2","3","4","5","1","2","3","4","5"],
    hits: fourVsFive,
    polyrhythmGrid: { left: [0, 1, 2, 3], right: [0, 4/5, 8/5, 12/5, 16/5].map(x => Math.round(x*10)/10), totalBeats: 20 },
  },
];

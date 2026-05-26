import type { LevelDefinition } from "./types";

export const LEVELS: LevelDefinition[] = [
  { level: 1, name: "Primer Pulso", minXp: 0, nextXp: 180, badge: "🥁", description: "Ya podés reconocer y sostener pulsos básicos." },
  { level: 2, name: "Pulso Firme", minXp: 180, nextXp: 420, badge: "🔥", description: "Tu estabilidad rítmica empieza a sentirse sólida." },
  { level: 3, name: "Lector Rítmico", minXp: 420, nextXp: 760, badge: "🎼", description: "Leés patrones simples sin depender de memoria." },
  { level: 4, name: "Oído Activo", minXp: 760, nextXp: 1180, badge: "👂", description: "Reconocés ritmos escuchando y comparando partituras." },
  { level: 5, name: "Sincopador", minXp: 1180, nextXp: 1700, badge: "⚡", description: "Podés sostener el pulso aunque el acento se desplace." },
  { level: 6, name: "Metrónomo Humano", minXp: 1700, nextXp: 2350, badge: "⏱️", description: "Tu pulso interno ya se puede entrenar con precisión." },
  { level: 7, name: "Maestro del Compás", minXp: 2350, nextXp: 3150, badge: "🏆", description: "Dominás compases, subdivisiones y lectura rítmica aplicada." },
  { level: 8, name: "Arquitecto del Groove", minXp: 3150, nextXp: null, badge: "🚀", description: "Entrás en desafíos avanzados, memoria rítmica y musicalidad." }
];

export function getLevelInfo(xp: number) {
  const current = [...LEVELS].reverse().find((level) => xp >= level.minXp) ?? LEVELS[0];
  const next = LEVELS.find((level) => level.level === current.level + 1) ?? null;
  const nextXp = next?.minXp ?? null;
  const previousXp = current.minXp;
  const progress = nextXp ? Math.min(100, Math.round(((xp - previousXp) / (nextXp - previousXp)) * 100)) : 100;
  const remaining = nextXp ? Math.max(0, nextXp - xp) : 0;
  return { current, next, progress, remaining };
}

export function shareTextForLevel(levelName: string, xp: number) {
  return `Subí al nivel ${levelName} en RitmoLab con ${xp} XP. Estoy entrenando ritmo todos los días 🎵`;
}

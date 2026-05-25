"use client";

import { useState } from "react";
import { Play, Lock, Clock, ChevronDown, ChevronUp, Zap } from "lucide-react";

type Video = {
  id: number;
  week: number;
  title: string;
  exercise: string;
  bpm: string;
  duration: string;
  level: "Inicial" | "Básico" | "Intermedio" | "Avanzado";
  tags: string[];
  youtubeId: string;
  available: boolean;
};

// Para publicar un video nuevo: cambiá available: false → true y poné el youtubeId real
// Ejemplo youtubeId: la URL https://youtube.com/watch?v=jfKfPfyJRdk → "jfKfPfyJRdk"
const PLACEHOLDER_ID = "jfKfPfyJRdk";

const videoData: Omit<Video, "id" | "youtubeId" | "available">[] = [
  // ── Semanas disponibles ──────────────────────────────────────────────────────
  { week: 1,  title: "Negras a 70 BPM",              exercise: "4 negras por compás, 8 compases continuos. Pulso parejo sin acelerar.",                             bpm: "70",      duration: "5:00", level: "Inicial",     tags: ["negra", "pulso"] },
  { week: 2,  title: "Negras a 80 BPM",              exercise: "Mismo ejercicio, 10 BPM más rápido. Fijate si el pie sigue estable.",                              bpm: "80",      duration: "5:00", level: "Inicial",     tags: ["negra", "pulso"] },
  { week: 3,  title: "Silencio de negra",             exercise: "TA — TA TA por compás. El silencio se cuenta, no se ignora.",                                     bpm: "72",      duration: "5:30", level: "Inicial",     tags: ["silencio", "negra"] },
  { week: 4,  title: "Corcheas parejas",              exercise: "8 corcheas por compás. TA-KA constante, los dos sonidos exactamente iguales.",                    bpm: "76",      duration: "5:00", level: "Básico",      tags: ["corcheas", "subdivisión"] },
  { week: 5,  title: "Negra + corcheas mezcladas",   exercise: "TA · TA-KA · TA · TA por compás. Cada vez que aparece el par, no aceleres.",                      bpm: "78",      duration: "6:00", level: "Básico",      tags: ["corcheas", "negra"] },
  { week: 6,  title: "Corcheas a 88 BPM",            exercise: "Mismo patrón de corcheas pero más rápido. La igualdad de los golpes es lo que importa.",          bpm: "88",      duration: "5:00", level: "Básico",      tags: ["corcheas", "velocidad"] },
  { week: 7,  title: "Tresillo en tiempo 1",         exercise: "TA-KI-TA · TA · TA · TA. Solo el primer tiempo tiene tresillo, los tres deben ser iguales.",      bpm: "72",      duration: "6:30", level: "Básico",      tags: ["tresillo"] },
  { week: 8,  title: "Tresillos en todos los tiempos", exercise: "4 tresillos por compás. No aceleres en el tresillo — es más fácil que las semicorcheas.",       bpm: "68",      duration: "6:00", level: "Básico",      tags: ["tresillo"] },
  // ── Próximas semanas ─────────────────────────────────────────────────────────
  { week: 9,  title: "Semicorcheas en tiempo 1",     exercise: "TA-KA-DI-MI · TA · TA · TA. Los cuatro sonidos exactamente iguales.",                            bpm: "66",      duration: "6:00", level: "Intermedio",  tags: ["semicorcheas"] },
  { week: 10, title: "Semicorcheas en todos los tiempos", exercise: "4 grupos de TA-KA-DI-MI por compás. Velocidad real, no apurada.",                           bpm: "60",      duration: "6:00", level: "Intermedio",  tags: ["semicorcheas"] },
  { week: 11, title: "Síncopa simple",               exercise: "Acento en el 'y' del 2. El pie sigue marcando el pulso sin moverse.",                             bpm: "80",      duration: "7:00", level: "Intermedio",  tags: ["síncopa", "groove"] },
  { week: 12, title: "Síncopa en 2 y 4",             exercise: "Contratiempos en los tiempos débiles. Base del funk y la bossa.",                                 bpm: "84",      duration: "7:00", level: "Intermedio",  tags: ["síncopa", "groove"] },
  { week: 13, title: "Negra puntillo + corchea",     exercise: "TA. KA por cada tiempo. La corchea siempre cae en la mitad del segundo tiempo.",                 bpm: "70",      duration: "6:30", level: "Intermedio",  tags: ["puntillo", "habanera"] },
  { week: 14, title: "Ritmo de habanera",            exercise: "Negra puntillo + corchea + dos negras. Base del tango y la bossa.",                               bpm: "76",      duration: "7:00", level: "Intermedio",  tags: ["habanera", "tango"] },
  { week: 15, title: "Compás 6/8 — intro",           exercise: "Sentir 2 pulsos grandes con 3 subdivisiones cada uno. No marcar 6 tiempos.",                     bpm: "60",      duration: "7:30", level: "Intermedio",  tags: ["6/8", "ternario"] },
  { week: 16, title: "6/8 a tempo real",             exercise: "Mismo patrón a tempo de balanceo. La sensación de mecedora debe aparecer.",                      bpm: "80",      duration: "6:00", level: "Intermedio",  tags: ["6/8"] },
  { week: 17, title: "Lectura mixta nivel 1",        exercise: "Compás con negras, corcheas y silencios mezclados. Leé antes de tocar.",                          bpm: "72",      duration: "8:00", level: "Intermedio",  tags: ["lectura", "mixto"] },
  { week: 18, title: "Lectura mixta nivel 2",        exercise: "Agrega tresillos al compás mixto. El tresillo no interrumpe el pulso.",                           bpm: "68",      duration: "8:00", level: "Intermedio",  tags: ["lectura", "tresillo"] },
  { week: 19, title: "Bimanual: negras juntas",      exercise: "Ambas manos al mismo tiempo. Un solo sonido, sin flam.",                                          bpm: "66",      duration: "6:00", level: "Intermedio",  tags: ["bimanual"] },
  { week: 20, title: "Bimanual: pulso vs corcheas",  exercise: "Izquierda en negras, derecha en corcheas. El ancla es la izquierda.",                             bpm: "68",      duration: "7:00", level: "Intermedio",  tags: ["bimanual", "independencia"] },
  { week: 21, title: "Bimanual: alternancia",        exercise: "IZ-DER-IZ-DER a intervalos exactamente iguales. Como caminar.",                                   bpm: "70",      duration: "6:30", level: "Intermedio",  tags: ["bimanual"] },
  { week: 22, title: "Bimanual: pulso vs tresillos", exercise: "Izquierda en negras, derecha en tresillos. El ritmo más básico del jazz.",                        bpm: "62",      duration: "8:00", level: "Avanzado",    tags: ["bimanual", "tresillo"] },
  { week: 23, title: "Síncopa cruzada",              exercise: "Izquierda marca el piso, derecha en contratiempos. El groove del funk.",                          bpm: "76",      duration: "8:00", level: "Avanzado",    tags: ["síncopa", "funk"] },
  { week: 24, title: "Corcheas vs tresillos",        exercise: "Izquierda en binario, derecha en ternario. El choque del jazz.",                                  bpm: "56",      duration: "9:00", level: "Avanzado",    tags: ["bimanual", "jazz"] },
  { week: 25, title: "Polirritmia 2 contra 3",       exercise: "Nice-cup-of-tea. Dos golpes izquierda, tres derecha en el mismo espacio.",                        bpm: "52",      duration: "10:00", level: "Avanzado",   tags: ["polirritmia", "2vs3"] },
  { week: 26, title: "Negras a 100 BPM",             exercise: "Revisitamos el ejercicio 1 pero al doble de velocidad. ¿Sigue igual de parejo?",                 bpm: "100",     duration: "5:00", level: "Básico",      tags: ["negra", "velocidad"] },
  { week: 27, title: "Corcheas a 100 BPM",           exercise: "Velocidad real de corcheas. El test definitivo de la subdivisión.",                               bpm: "100",     duration: "5:00", level: "Básico",      tags: ["corcheas", "velocidad"] },
  { week: 28, title: "Lectura: compás de vals",      exercise: "3/4 con negras. El acento en el 1 es más fuerte que en el 2 y 3.",                               bpm: "76",      duration: "7:00", level: "Intermedio",  tags: ["3/4", "vals"] },
  { week: 29, title: "Swing feel — intro",           exercise: "Corcheas de swing: la primera más larga, la segunda más corta. Feel de jazz.",                   bpm: "88",      duration: "8:00", level: "Avanzado",    tags: ["swing", "jazz"] },
  { week: 30, title: "Polirritmia 3 contra 4",       exercise: "Tres golpes izquierda, cuatro derecha. El desafío clásico de Chopin.",                            bpm: "44",      duration: "12:00", level: "Avanzado",   tags: ["polirritmia", "3vs4"] },
];

// Fill up to 100 with placeholders
function buildVideos(): Video[] {
  const result: Video[] = videoData.map((v, i) => ({
    ...v,
    id: i + 1,
    youtubeId: PLACEHOLDER_ID,
    available: i < 8,
  }));
  for (let i = videoData.length; i < 100; i++) {
    result.push({
      id: i + 1, week: i + 1,
      title: `Semana ${i + 1}`,
      exercise: "Ejercicio próximamente",
      bpm: "—", duration: "--:--",
      level: "Avanzado", tags: [],
      youtubeId: PLACEHOLDER_ID, available: false,
    });
  }
  return result;
}

const allVideos = buildVideos();

const levelColors: Record<string, string> = {
  Inicial:    "bg-green-100 text-green-800",
  Básico:     "bg-blue-100 text-blue-800",
  Intermedio: "bg-yellow-100 text-yellow-800",
  Avanzado:   "bg-red-100 text-red-800",
};

function VideoRow({ v, active, onPlay }: { v: Video; active: boolean; onPlay: () => void }) {
  if (!v.available) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-200 px-3 py-2 opacity-50">
        <Lock size={11} className="shrink-0 text-zinc-400" />
        <span className="text-xs text-zinc-400">Semana {v.week} — próximamente</span>
      </div>
    );
  }
  return (
    <button onClick={onPlay}
      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition hover:bg-brand-50 ${active ? "border-brand-400 bg-brand-50" : "border-brand-100 bg-white"}`}>
      <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition ${active ? "bg-brand-500" : "bg-brand-100 group-hover:bg-brand-200"}`}>
        <Play size={12} className={active ? "text-white" : "text-brand-700"} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-zinc-900">{v.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-1.5 py-px text-[9px] font-black ${levelColors[v.level]}`}>{v.level}</span>
          <span className="flex items-center gap-0.5 text-[9px] text-zinc-400"><Zap size={9}/>{v.bpm} BPM</span>
          <span className="flex items-center gap-0.5 text-[9px] text-zinc-400"><Clock size={9}/>{v.duration}</span>
        </div>
      </div>
    </button>
  );
}

export default function VideosPage() {
  const [playing, setPlaying] = useState<Video>(allVideos[0]);
  const [filter, setFilter] = useState("todos");
  const [showUpcoming, setShowUpcoming] = useState(false);

  const available = allVideos.filter(v => v.available);
  const upcoming  = allVideos.filter(v => !v.available);

  const filtered = filter === "todos"
    ? available
    : available.filter(v => v.level === filter || v.tags.includes(filter));

  return (
    <div className="container-page py-10">
      <p className="pill"><Zap size={14} /> Ejercicios semanales</p>
      <h1 className="mt-4 text-5xl font-black">Videos de ejercicio</h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-600">
        Cada video es un ejercicio rítmico guiado. Ponés play, ves el patrón, escuchás el tempo y tocás encima. Sin teoría — solo práctica.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* ── Player ── */}
        <div className="space-y-4">
          <div className="card overflow-hidden p-0">
            <div className="aspect-video w-full bg-zinc-950">
              <iframe
                key={playing.id}
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${playing.youtubeId}`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-black ${levelColors[playing.level]}`}>{playing.level}</span>
                <span className="flex items-center gap-1 text-xs font-bold text-zinc-500"><Zap size={12}/>{playing.bpm} BPM</span>
                <span className="flex items-center gap-1 text-xs text-zinc-400"><Clock size={12}/>{playing.duration}</span>
                <span className="text-xs text-zinc-400">Semana {playing.week}</span>
              </div>
              <h2 className="mt-2 text-2xl font-black">{playing.title}</h2>
              <div className="mt-3 rounded-2xl bg-brand-50 p-4">
                <p className="text-sm font-black uppercase tracking-wide text-brand-700">Ejercicio</p>
                <p className="mt-1 text-zinc-700">{playing.exercise}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {playing.tags.map(t => (
                  <span key={t} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {["todos","Inicial","Básico","Intermedio","Avanzado"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-black transition ${filter === f ? "bg-brand-500 text-white" : "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50"}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
            {filtered.map(v => (
              <VideoRow key={v.id} v={v} active={playing.id === v.id} onPlay={() => setPlaying(v)} />
            ))}
          </div>

          <button onClick={() => setShowUpcoming(s => !s)}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-zinc-200 px-4 py-2.5 text-sm font-black text-zinc-500 transition hover:bg-zinc-50">
            <span>{upcoming.length} ejercicios próximos</span>
            {showUpcoming ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
          </button>

          {showUpcoming && (
            <div className="space-y-1.5">
              {upcoming.slice(0, 20).map(v => (
                <VideoRow key={v.id} v={v} active={false} onPlay={() => {}} />
              ))}
              {upcoming.length > 20 && (
                <p className="text-center text-xs text-zinc-400">y {upcoming.length - 20} más...</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

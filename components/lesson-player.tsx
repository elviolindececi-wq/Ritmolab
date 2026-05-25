"use client";
import { useState } from "react";
import { CheckCircle2, Music, XCircle } from "lucide-react";

const questions = [
  {
    prompt: "¿Qué es el pulso?",
    options: ["Una nota musical", "Una sensación regular y constante", "Un silencio largo", "Una escala"],
    answer: "Una sensación regular y constante"
  },
  {
    prompt: "¿Qué suele marcar el primer tiempo del compás?",
    options: ["El acento principal", "El final de la canción", "La tonalidad", "El silencio"],
    answer: "El acento principal"
  }
];

export function LessonPlayer() {
  const [selected, setSelected] = useState<string | null>(null);
  const q = questions[0];
  const ok = selected === q.answer;
  return (
    <section className="card">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Music /></span>
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-brand-700">Ejercicio</p>
          <h2 className="text-2xl font-black">{q.prompt}</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {q.options.map((option) => (
          <button
            key={option}
            onClick={() => setSelected(option)}
            className={`rounded-2xl border-2 p-4 text-left font-black transition ${selected === option ? (ok ? "border-brand-500 bg-brand-50" : "border-coral bg-red-50") : "border-brand-100 bg-white hover:bg-brand-50"}`}
          >
            {option}
          </button>
        ))}
      </div>
      {selected && (
        <div className={`mt-5 flex items-center gap-3 rounded-2xl p-4 font-black ${ok ? "bg-brand-100 text-brand-700" : "bg-red-50 text-red-700"}`}>
          {ok ? <CheckCircle2 /> : <XCircle />}
          {ok ? "+10 XP. ¡Excelente pulso!" : "Casi. El pulso es regular y constante."}
        </div>
      )}
    </section>
  );
}

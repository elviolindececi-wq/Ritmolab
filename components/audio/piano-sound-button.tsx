"use client";

import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";
import { getPianoState, playRealisticPianoNote, warmUpRealisticPiano } from "@/lib/audio/realistic-piano";

type Status = "idle" | "loading" | "ready" | "error";

export function PianoSoundButton({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    setStatus(getPianoState().state);
  }, []);

  async function enablePiano() {
    try {
      setStatus("loading");
      await warmUpRealisticPiano();
      await playRealisticPianoNote("C4", 0.35, 0.8);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  const label = status === "ready"
    ? "Piano listo"
    : status === "loading"
      ? "Cargando..."
      : status === "error"
        ? "Reintentar piano"
        : "Activar piano";

  return (
    <button
      type="button"
      onClick={enablePiano}
      disabled={status === "loading"}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition disabled:opacity-60 ${
        status === "ready"
          ? "border-brand-200 bg-brand-50 text-brand-800"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      }`}
      title="Carga samples reales de piano para que los ejercicios suenen más naturales."
    >
      <Music2 size={14} />
      {compact ? (status === "ready" ? "Piano" : "Sonido") : label}
    </button>
  );
}

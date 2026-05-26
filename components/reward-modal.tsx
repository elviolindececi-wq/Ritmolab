"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Flame, Share2, Sparkles, X } from "lucide-react";
import type { CompletionReward } from "@/lib/progress";
import { shareTextForLevel } from "@/lib/gamification";

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#58cc02", "#ffd900", "#ff4b4b", "#1cb0f6", "#ce82ff"];

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      r: number;
      rot: number;
      vrot: number;
    }[] = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        r: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.2,
      });
    }

    let frame = 0;
    let t = 0;

    function draw() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.vy += 0.1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });

      t += 1;

      if (t < 180) {
        frame = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  );
}

async function shareReward(currentReward: CompletionReward) {
  const text = shareTextForLevel(
    currentReward.level_name,
    currentReward.total_xp
  );

  const url =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://ritmolab.vercel.app";

  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: "RitmoLab",
        text,
        url,
      });
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert("Texto copiado para compartir");
    }
  } catch (error) {
    console.error("No se pudo compartir el logro:", error);
  }
}

export function RewardModal({
  reward,
  onClose,
}: {
  reward: CompletionReward | null;
  onClose: () => void;
}) {
  if (!reward) return null;

  const currentReward: CompletionReward = reward;

  return (
    <>
      {currentReward.leveled_up && <Confetti />}

      <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="card relative w-full max-w-lg animate-[pop_.2s_ease-out] text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100"
            aria-label="Cerrar"
            type="button"
          >
            <X size={18} />
          </button>

          <div
            className={`mx-auto grid h-24 w-24 place-items-center rounded-[2rem] text-5xl text-white shadow-button ${
              currentReward.leveled_up ? "bg-yellow-400" : "bg-brand-500"
            }`}
          >
            {currentReward.leveled_up ? "🚀" : "🎉"}
          </div>

          <p className="pill mx-auto mt-5 w-fit">
            {currentReward.leveled_up
              ? "¡Subiste de nivel!"
              : "Lección completada"}
          </p>

          <h2 className="mt-3 text-3xl font-black">
            {currentReward.leveled_up
              ? `Ahora sos ${currentReward.level_name}`
              : "¡Excelente práctica!"}
          </h2>

          {currentReward.leveled_up && (
            <p className="mt-2 text-zinc-600">
              Tu pulso interno está creciendo de verdad.
            </p>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-brand-50 p-4 font-black text-brand-800">
              <Sparkles className="mx-auto mb-1" size={20} />
              <p className="text-xl">+{currentReward.awarded_xp}</p>
              <p className="text-xs font-bold">XP</p>
            </div>

            <div className="rounded-2xl bg-yellow-50 p-4 font-black text-yellow-800">
              <CheckCircle2 className="mx-auto mb-1" size={20} />
              <p className="text-xl">{currentReward.total_xp}</p>
              <p className="text-xs font-bold">XP total</p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-4 font-black text-orange-800">
              <Flame className="mx-auto mb-1" size={20} />
              <p className="text-xl">{currentReward.current_streak}</p>
              <p className="text-xs font-bold">días racha</p>
            </div>
          </div>

          {currentReward.next_level_name && (
            <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
              <div className="mb-2 flex justify-between text-xs font-black text-zinc-600">
                <span>{currentReward.level_name}</span>
                <span>Próximo: {currentReward.next_level_name}</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all"
                  style={{ width: `${currentReward.level_progress}%` }}
                />
              </div>

              <p className="mt-1.5 text-right text-xs font-bold text-zinc-500">
                faltan {currentReward.xp_to_next} XP
              </p>
            </div>
          )}

          {currentReward.already_completed && (
            <p className="mt-3 rounded-xl bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-500">
              Ya habías completado esta lección — el XP no se duplica.
            </p>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3">
            <button onClick={onClose} className="btn-secondary" type="button">
              Seguir
            </button>

            <button
              onClick={() => {
                void shareReward(currentReward);
              }}
              className="btn-secondary"
              type="button"
            >
              <Share2 className="mr-1.5 inline" size={14} />
              Compartir
            </button>

            <Link href="/dashboard" className="btn-primary">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
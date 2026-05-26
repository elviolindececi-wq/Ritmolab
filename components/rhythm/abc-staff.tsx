"use client";

import { useEffect, useRef } from "react";
import {
  getMetronomeSequence,
  hitsFromAbc,
  hitsFromSyllables,
  playRhythmPattern,
  timeSignatureFromAbc,
  totalQuarterBeatsFromAbc,
} from "@/lib/rhythm-engine";

export function MetronomeLegend({ timeSignature }: { timeSignature: string }) {
  const sequence = getMetronomeSequence(timeSignature);

  return (
    <div className="mt-2 rounded-2xl border border-sky-100 bg-sky-50/75 p-3 text-xs font-bold text-sky-950">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-black text-sky-800">Metrónomo {timeSignature}:</span>
        {sequence.map(step => (
          <span
            key={`${timeSignature}-${step.beat}`}
            className={`rounded-full px-2 py-1 font-black ${
              step.kind === "strong"
                ? "bg-zinc-900 text-white"
                : step.kind === "secondary"
                ? "bg-sky-200 text-sky-950"
                : "bg-white text-sky-800"
            }`}
          >
            {step.beat}: {step.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-sky-900/85">
        CLIC = inicio de compás · tac = pulso normal · toc = acento secundario · — = silencio de nota; el metrónomo sigue.
      </p>
    </div>
  );
}

export function AbcStaff({ abc, showMetronomeLegend = true }: { abc: string; showMetronomeLegend?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const timeSignature = timeSignatureFromAbc(abc);

  useEffect(() => {
    let mounted = true;
    import("abcjs").then((abcjs) => {
      if (!mounted || !ref.current) return;
      ref.current.innerHTML = "";
      abcjs.renderAbc(ref.current, abc, {
        responsive: "resize",
        staffwidth: 280,
        scale: 1.6,
        add_classes: true,
        paddingleft: 0,
        paddingright: 0,
      });
    }).catch(() => {
      if (ref.current) ref.current.textContent = abc;
    });
    return () => { mounted = false; };
  }, [abc]);

  return (
    <figure aria-label={`Partitura en ${timeSignature}`} className="w-full">
      <div ref={ref} className="min-h-[100px] w-full [&_svg]:pointer-events-none" />
      {showMetronomeLegend && <MetronomeLegend timeSignature={timeSignature} />}
    </figure>
  );
}

export function playPulsePattern(syllables: string[], bpm = 80) {
  playRhythmPattern(hitsFromSyllables(syllables), bpm, "C4");
}

export function playAbcScore(abc: string, bpm = 80) {
  const hits = hitsFromAbc(abc);
  playRhythmPattern(hits, bpm, "C4", {
    metronome: true,
    timeSignature: timeSignatureFromAbc(abc),
    totalBeats: totalQuarterBeatsFromAbc(abc),
    countInBars: 1,
  });
}

"use client";

import { useEffect, useRef } from "react";
import { hitsFromSyllables, playRhythmPattern } from "@/lib/rhythm-engine";

export function AbcStaff({ abc }: { abc: string }) {
  const ref = useRef<HTMLDivElement>(null);
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
  return <div ref={ref} className="min-h-[100px] w-full" />;
}

export function playPulsePattern(syllables: string[], bpm = 80) {
  playRhythmPattern(hitsFromSyllables(syllables), bpm, "C4");
}

"use client";

import { useState } from "react";
import { Trophy, Users, Zap } from "lucide-react";
import { createChallenge } from "@/lib/progress";

export default function ChallengesPage() {
  const [message, setMessage] = useState("");
  async function make(title: string) {
    try { const data = await createChallenge(title); setMessage(`Desafío creado: ${data.id}. Compartilo con un amigo.`); }
    catch (e) { setMessage(e instanceof Error ? e.message : "No se pudo crear el desafío. Entrá con tu cuenta."); }
  }
  return (
    <div className="container-page py-10"><p className="pill">Viralidad</p><h1 className="mt-4 text-5xl font-black">Desafiá a tus amigos</h1><p className="mt-3 max-w-3xl text-lg text-zinc-600">Creá desafíos de pulso, síncopa o racha. El ganador recibe XP y badges.</p>{message && <div className="mt-6 rounded-2xl bg-brand-50 p-4 font-bold text-brand-800">{message}</div>}<div className="mt-8 grid gap-6 md:grid-cols-3">{[["Desafío de pulso", "Completá 5 ejercicios con 80% o más.", Zap], ["Racha semanal", "Gana quien practica más días.", Trophy], ["Invitar amigo", "Ambos reciben XP al registrarse.", Users]].map(([title, desc, Icon]: any) => <div key={title} className="card"><Icon className="text-brand-700" size={34} /><h2 className="mt-5 text-2xl font-black">{title}</h2><p className="mt-2 text-zinc-600">{desc}</p><button onClick={() => make(title)} className="btn-primary mt-6 w-full">Crear desafío</button></div>)}</div></div>
  );
}

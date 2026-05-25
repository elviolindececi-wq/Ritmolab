import Link from "next/link";
import { ArrowRight, Check, Trophy, Users, Zap } from "lucide-react";
import { ModuleCard } from "@/components/module-card";
import { Mascot } from "@/components/mascot";
import { modules, mascots } from "@/lib/content";

export default function HomePage() {
  return (
    <div>
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
        <div className="flex flex-col justify-center">
          <span className="pill w-fit"><Zap size={16} /> Ritmo en 5 minutos por día</span>
          <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Aprendé ritmo como si fuera un juego.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-zinc-600">
            Teoría nutritiva, videos, dictado con partitura, metrónomo humano, coordinación bimanual avanzada, XP, rachas, niveles y ranking de los que más empujan.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="btn-primary" href="/dashboard">Empezar gratis <ArrowRight className="ml-2" /></Link>
            <Link className="btn-secondary" href="/pricing">Acceso liberado</Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Todo liberado por lanzamiento", "Ranking real", "Instalable como app"].map((item) => (
              <div key={item} className="flex items-center gap-2 font-bold text-zinc-700"><Check className="text-brand-600" /> {item}</div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="card rotate-1">
            <div className="rounded-[2rem] bg-brand-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black uppercase opacity-80">Lección actual</p>
                  <h2 className="text-3xl font-black">Pulso y acento</h2>
                </div>
                <div className="text-6xl">🥁</div>
              </div>
              <div className="mt-8 h-5 overflow-hidden rounded-full bg-white/30"><div className="h-full w-3/4 rounded-full bg-white" /></div>
              <p className="mt-3 font-black">75% completado · +20 XP</p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-brand-50 p-5"><Trophy className="text-brand-700" /><p className="mt-3 font-black">Ranking semanal</p><p className="text-zinc-600">Competí sin perder el foco.</p></div>
              <div className="rounded-3xl bg-blue-50 p-5"><Users className="text-[#1cb0f6]beat" /><p className="mt-3 font-black">Desafíos</p><p className="text-zinc-600">Invitá amigos y ganá XP.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="pill w-fit">Camino de aprendizaje</p>
            <h2 className="mt-4 text-4xl font-black">Mundos rítmicos</h2>
          </div>
          <Link href="/learn" className="font-black text-brand-700">Ver todos →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.slice(0, 3).map((module) => <ModuleCard key={module.slug} module={module} />)}
        </div>
      </section>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-4">
        {mascots.map((m) => <Mascot key={m.name} name={m.name} emoji={m.emoji} message={`${m.role}: ${m.text}`} />)}
      </section>
    </div>
  );
}

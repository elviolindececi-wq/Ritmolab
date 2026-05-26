import Link from "next/link";
import { ArrowRight, Check, Infinity, Map, Sparkles, Trophy, Users, Zap } from "lucide-react";
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
            Entrená ritmo para toda la vida.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-zinc-600">
            Lecciones pedagógicas, mundos generativos, práctica libre infinita, dominio por habilidad, repasos inteligentes, retos diarios y progresión por BPM para que nunca se termine.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="btn-primary" href="/auth">Empezar diagnóstico <ArrowRight className="ml-2" /></Link>
            <Link className="btn-audio" href="/free-practice">Probar práctica libre</Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Ejercicios infinitos", "Retos y repasos diarios", "Dominio real por habilidad"].map((item) => (
              <div key={item} className="flex items-center gap-2 font-bold text-zinc-700"><Check className="text-brand-600" /> {item}</div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="card rotate-1">
            <div className="rounded-[2rem] bg-brand-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black uppercase opacity-80">Plan de hoy</p>
                  <h2 className="text-3xl font-black">Repaso inteligente</h2>
                </div>
                <div className="text-6xl">🥁</div>
              </div>
              <div className="mt-8 h-5 overflow-hidden rounded-full bg-white/30"><div className="h-full w-3/4 rounded-full bg-white" /></div>
              <p className="mt-3 font-black">10 min · patrones nuevos · +XP</p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-brand-50 p-5"><Infinity className="text-brand-700" /><p className="mt-3 font-black">Práctica infinita</p><p className="text-zinc-600">El motor crea variantes nuevas.</p></div>
              <div className="rounded-3xl bg-blue-50 p-5"><Map className="text-skybeat" /><p className="mt-3 font-black">16 mundos vivos</p><p className="text-zinc-600">Ruta, estilos y modo maestro.</p></div>
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
          <Link href="/worlds" className="font-black text-brand-700">Ver mundos →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.slice(0, 3).map((module) => <ModuleCard key={module.slug} module={module} />)}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Ejercicios generativos", text: "Mismo objetivo, patrones nuevos cada sesión." },
            { icon: Trophy, title: "Dominio medible", text: "No alcanza completar: hay que sostener precisión en varias sesiones y BPM." },
            { icon: Users, title: "Uso permanente", text: "Repasos, retos, estilos y modo maestro mantienen el entrenamiento vivo." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card">
              <Icon className="text-brand-700" />
              <h3 className="mt-4 text-xl font-black">{title}</h3>
              <p className="mt-2 font-bold text-zinc-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-4">
        {mascots.map((m) => <Mascot key={m.name} name={m.name} emoji={m.emoji} message={`${m.role}: ${m.text}`} />)}
      </section>
    </div>
  );
}

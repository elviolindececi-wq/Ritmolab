import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Music2, Target, Trophy, Users, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="container-page py-16 lg:py-24">
        <div className="max-w-3xl">
          <p className="pill w-fit"><Zap size={14} /> Sobre RitmoLab</p>
          <h1 className="mt-6 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
            El ritmo no se nace.<br/>Se entrena.
          </h1>
          <p className="mt-6 text-xl leading-8 text-zinc-600">
            RitmoLab es una plataforma de entrenamiento rítmico para pianistas y músicos en general. Combinamos teoría profunda, ejercicios interactivos, dictado con partitura, metrónomo humano y coordinación bimanual — todo en sesiones de 5 minutos por día.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/learn" className="btn-primary">Empezar ahora <ArrowRight className="ml-2" size={18} /></Link>
            <Link href="/videos" className="btn-secondary">Ver los videos</Link>
          </div>
        </div>
      </section>

      {/* Qué es */}
      <section className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="pill w-fit">El problema que resolvemos</p>
            <h2 className="mt-4 text-4xl font-black">La mayoría aprende notas. Muy pocos aprenden ritmo.</h2>
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              Los métodos de piano tradicionales enseñan melodía, armonía y técnica de dedos. El ritmo queda relegado a "tocá siguiendo el metrónomo". El resultado: músicos que leen bien pero no tienen pulso interno estable, que se pierden con las síncopas, que no pueden coordinar las dos manos en patrones distintos.
            </p>
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              RitmoLab aborda el ritmo como una habilidad central, no como un complemento. Construimos el pulso interno desde cero, de la misma forma en que un percusionista profesional lo haría.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: <Target className="text-brand-600" />, title: "Progresión estructurada", body: "6 mundos que van del pulso básico hasta la polirritmia avanzada. Cada lección abre la siguiente." },
              { icon: <Brain className="text-brand-600" />, title: "Teoría que explica el por qué", body: "No solo 'tocá así'. Cada ejercicio viene con la neurología y la mecánica musical detrás." },
              { icon: <Music2 className="text-brand-600" />, title: "Coordinación bimanual real", body: "15 ejercicios desde negras juntas hasta polirritmia 4 contra 5. El trabajo que diferencia pianistas." },
              { icon: <BookOpen className="text-brand-600" />, title: "Dictado con partitura", body: "Escuchás un ritmo y elegís la partitura correcta. El oído y la lectura se entrenan juntos." },
            ].map(item => (
              <div key={item.title} className="card flex gap-4">
                <div className="mt-1 shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-black">{item.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="container-page py-12">
        <p className="pill w-fit">Cómo funciona</p>
        <h2 className="mt-4 text-4xl font-black">Cinco minutos al día. En serio.</h2>
        <p className="mt-3 max-w-2xl text-lg text-zinc-600">Cada lección tiene exactamente cuatro partes. Las podés hacer en orden o ir directamente al ejercicio que necesitás.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "1", title: "Teoría nutritiva", body: "3 párrafos específicos sobre la figura o concepto. No genérico — la mecánica exacta de esa lección.", color: "bg-brand-50 border-brand-200" },
            { step: "2", title: "Video guiado", body: "Un video corto que muestra el concepto en acción con ejemplos musicales reales.", color: "bg-blue-50 border-blue-200" },
            { step: "3", title: "Dictado y quiz", body: "Escuchás un patrón rítmico y elegís la partitura correcta entre varias opciones. Las opciones se mezclan aleatoriamente cada vez.", color: "bg-yellow-50 border-yellow-200" },
            { step: "4", title: "Metrónomo humano", body: "Tocás el patrón con precisión real. La app mide cada tap y da feedback inmediato de timing.", color: "bg-green-50 border-green-200" },
          ].map(item => (
            <div key={item.step} className={`rounded-3xl border p-6 ${item.color}`}>
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-white text-lg font-black text-zinc-900 shadow-sm">{item.step}</div>
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* El sistema de gamificación */}
      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="pill w-fit">Sistema de progreso</p>
            <h2 className="mt-4 text-4xl font-black">XP, rachas y ranking real</h2>
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              Cada ejercicio completado suma XP. Las rachas diarias multiplican el progreso. El leaderboard muestra quién entrena más — no quién nació con más talento.
            </p>
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              Los badges se desbloquean por logros específicos: primera lección completada, primer dictado aprobado, 85% de estabilidad de pulso, invitar a alguien al lab.
            </p>
            <Link href="/leaderboard" className="btn-primary mt-6 inline-flex">Ver el ranking <ArrowRight className="ml-2" size={18} /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: "🥁", name: "Primer Pulso", desc: "Completaste tu primera lección" },
              { icon: "🔥", name: "Pulso firme", desc: "Llegaste al nivel Pulso Firme" },
              { icon: "🎼", name: "Lector rítmico", desc: "Completaste el bloque de lectura" },
              { icon: "👂", name: "Oído activo", desc: "Aprobaste un dictado rítmico" },
              { icon: "⏱️", name: "Metrónomo humano", desc: "Lograste 85% de estabilidad" },
              { icon: "🏆", name: "Maestro del compás", desc: "Superaste un desafío avanzado" },
            ].map(b => (
              <div key={b.name} className="card flex items-start gap-3">
                <span className="text-3xl">{b.icon}</span>
                <div>
                  <p className="font-black">{b.name}</p>
                  <p className="text-xs text-zinc-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quién es */}
      <section className="container-page py-12">
        <p className="pill w-fit">¿Para quién es RitmoLab?</p>
        <h2 className="mt-4 text-4xl font-black">Para cualquier músico que quiera ritmo sólido.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Pianistas en formación", body: "Que quieren pasar del 'leer las notas' al 'sentir el ritmo'. El módulo bimanual es especialmente útil." },
            { title: "Estudiantes de conservatorio", body: "Para reforzar el dictado rítmico, la lectura a primera vista y la estabilidad de pulso bajo presión." },
            { title: "Músicos autodidactas", body: "Que nunca tuvieron formación rítmica formal y quieren construir esa base de forma estructurada." },
            { title: "Profesores de música", body: "Que quieren una herramienta para asignar práctica rítmica a sus alumnos con progresión clara." },
            { title: "Bateristas y percusionistas", body: "Para entrenar lectura de partituras rítmicas y agregar vocabulario de figuras." },
            { title: "Cualquier músico", body: "El ritmo es la base de toda la música. Independientemente del instrumento, un pulso sólido mejora todo lo demás." },
          ].map(item => (
            <div key={item.title} className="card">
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <div className="rounded-[2rem] bg-brand-500 p-10 text-white">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-4xl font-black">Todo liberado durante el lanzamiento.</h2>
              <p className="mt-3 text-xl opacity-90">Todos los mundos, todos los ejercicios, el módulo bimanual y los videos semanales — sin costo mientras estamos en fase de prueba.</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/learn" className="inline-flex items-center rounded-2xl bg-white px-6 py-3 font-black text-brand-700 transition hover:bg-brand-50">
                  Empezar gratis <ArrowRight className="ml-2" size={18} />
                </Link>
                <Link href="/videos" className="inline-flex items-center rounded-2xl border-2 border-white/40 px-6 py-3 font-black text-white transition hover:bg-white/10">
                  Ver los videos
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 lg:flex-col lg:items-end lg:text-right">
              {[["6", "mundos rítmicos"], ["15", "ejercicios bimanuales"], ["100", "videos semanales"], ["∞", "XP por ganar"]].map(([n, label]) => (
                <div key={label}>
                  <p className="text-4xl font-black">{n}</p>
                  <p className="text-sm opacity-80">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

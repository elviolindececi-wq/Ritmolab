import { modules } from "@/lib/content";

export default function AdminPage() {
  return (
    <div className="container-page py-10">
      <p className="pill">Admin</p>
      <h1 className="mt-4 text-5xl font-black">Panel de contenido</h1>
      <p className="mt-3 max-w-3xl text-lg text-zinc-600">Versión visual inicial. El próximo paso es conectar formularios a Supabase para crear módulos, lecciones y ejercicios desde acá.</p>
      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead><tr className="border-b"><th className="p-3">Módulo</th><th className="p-3">Acceso</th><th className="p-3">Lecciones</th><th className="p-3">Mascota</th><th className="p-3">XP</th></tr></thead>
          <tbody>
            {modules.map((m) => <tr key={m.slug} className="border-b last:border-0"><td className="p-3 font-black">{m.title}</td><td className="p-3">{m.access}</td><td className="p-3">{m.lessons.length}</td><td className="p-3">{m.mascot}</td><td className="p-3">{m.xp}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

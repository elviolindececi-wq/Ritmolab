import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-10">
      <div className="card max-w-lg text-center">
        <div className="text-6xl mb-4">🥁</div>
        <h1 className="text-4xl font-black">Esta página no existe</h1>
        <p className="mt-3 text-zinc-600">Perdiste el pulso — esta ruta no está en el compás. Volvé al inicio y seguí entrenando.</p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary">Ir al inicio <ArrowRight className="ml-2" size={16} /></Link>
          <Link href="/learn" className="btn-secondary">Ver lecciones</Link>
        </div>
      </div>
    </div>
  );
}

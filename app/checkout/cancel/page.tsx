import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-10">
      <div className="card max-w-xl text-center">
        <div className="text-7xl">🥁</div>
        <h1 className="mt-5 text-4xl font-black">Pago cancelado</h1>
        <p className="mt-3 text-zinc-600">No se realizó ningún cargo. Podés seguir practicando el módulo gratis.</p>
        <Link href="/pricing" className="btn-secondary mt-6">Volver a planes</Link>
      </div>
    </div>
  );
}

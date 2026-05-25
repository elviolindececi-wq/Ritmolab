import Link from "next/link";

export default function CheckoutSuccessPage() {
  return <div className="container-page grid min-h-[70vh] place-items-center py-10"><div className="card max-w-xl text-center"><div className="text-7xl">🎉</div><h1 className="mt-5 text-4xl font-black">Premium desbloqueado</h1><p className="mt-3 text-zinc-600">Para desarrollo se activa como Premium Demo en Supabase. En producción esta pantalla recibe la vuelta de Stripe o Mercado Pago.</p><Link href="/learn" className="btn-primary mt-6">Ir a aprender</Link></div></div>;
}

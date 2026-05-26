import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

const plans = [
  { name: "Lanzamiento abierto", price: "$0", desc: "Todo liberado para testear el producto real antes de activar pagos.", items: ["Todos los mundos", "Dictados ilimitados", "Metrónomo humano", "XP, niveles y racha", "Ranking de los que más empujan", "Compartir niveles"], cta: "Entrar a practicar", href: "/dashboard", featured: true },
  { name: "Premium futuro", price: "Próximamente", desc: "La monetización queda preparada para Stripe o Mercado Pago.", items: ["Certificados", "Módulos semanales", "Retos premium", "Personajes exclusivos"], cta: "Ver camino", href: "/learn", featured: false }
];

export default function PricingPage() {
  return (
    <div className="container-page py-10"><p className="pill">Acceso liberado</p><h1 className="mt-4 text-5xl font-black">Por ahora todo es gratis</h1><p className="mt-3 max-w-3xl text-lg text-zinc-600">La parte paga queda para el final. Ahora el foco es probar experiencia, retención, progreso, ranking y calidad pedagógica.</p><div className="mt-8 grid gap-6 lg:grid-cols-2">{plans.map((plan) => <div key={plan.name} className={`card ${plan.featured ? "border-4 border-brand-500" : ""}`}>{plan.featured && <span className="pill"><Sparkles size={16} /> Recomendado</span>}<h2 className="mt-4 text-3xl font-black">{plan.name}</h2><p className="mt-2 text-zinc-600">{plan.desc}</p><p className="mt-6 text-5xl font-black">{plan.price}</p><div className="mt-6 space-y-3">{plan.items.map((item) => <div key={item} className="flex gap-2 font-bold"><Check className="shrink-0 text-brand-700" /> {item}</div>)}</div><Link href={plan.href} className={plan.featured ? "btn-primary mt-8 w-full" : "btn-secondary mt-8 w-full"}>{plan.cta}</Link></div>)}</div></div>
  );
}

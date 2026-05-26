"use client";

import { useEffect, useState } from "react";
import { Copy, Gift } from "lucide-react";
import { siteUrl } from "@/lib/utils";
import { loadMyStats } from "@/lib/progress";

export default function ReferralsPage() {
  const [code, setCode] = useState("RITMO");
  const [copied, setCopied] = useState(false);
  useEffect(() => { loadMyStats().then((d) => setCode(d.profile?.referral_code ?? "RITMO")); }, []);
  const link = siteUrl(`/r/${code}`);
  async function copy() { await navigator.clipboard.writeText(link); setCopied(true); }
  return (
    <div className="container-page py-10"><p className="pill">Referidos</p><h1 className="mt-4 text-5xl font-black">Invitá y ganá</h1><p className="mt-3 max-w-3xl text-lg text-zinc-600">Cuando alguien se registra con tu link, ambos ganan XP. Si paga premium, podés ganar descuentos o meses gratis.</p><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.7fr]"><div className="card"><Gift className="text-brand-700" size={40} /><h2 className="mt-5 text-3xl font-black">Tu link de invitación</h2><div className="mt-5 rounded-2xl border-2 border-dashed border-brand-100 bg-brand-50 p-4 font-mono text-sm text-brand-900">{link}</div><button onClick={copy} className="btn-primary mt-5"><Copy className="mr-2" /> {copied ? "Copiado" : "Copiar link"}</button></div><div className="card"><h2 className="text-2xl font-black">Recompensas</h2><div className="mt-5 space-y-3"><div className="rounded-2xl bg-brand-50 p-4 font-bold">Registro de amigo: +50 XP para ambos</div><div className="rounded-2xl bg-brand-50 p-4 font-bold">Amigo paga: badge premium + descuento</div><div className="rounded-2xl bg-brand-50 p-4 font-bold">5 amigos: personaje exclusivo</div></div></div></div></div>
  );
}

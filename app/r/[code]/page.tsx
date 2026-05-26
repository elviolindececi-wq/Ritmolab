"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { createReferralClick } from "@/lib/progress";

export default function ReferralLanding() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  useEffect(() => { if (code) { createReferralClick(code); localStorage.setItem("ritmolab_referral", code); } }, [code]);
  return <div className="container-page grid min-h-[70vh] place-items-center py-10"><div className="card max-w-xl text-center"><div className="text-7xl">🎁</div><h1 className="mt-5 text-4xl font-black">Te invitaron a RitmoLab</h1><p className="mt-3 text-zinc-600">Código de referido: <b>{code}</b>. Creá tu cuenta y empezá con ejercicios de ritmo.</p><Link href="/auth" className="btn-primary mt-6">Crear cuenta</Link></div></div>;
}

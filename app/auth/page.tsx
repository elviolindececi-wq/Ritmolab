"use client";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function applyReferral() {
    const code = typeof window !== "undefined" ? localStorage.getItem("ritmolab_referral") : null;
    if (code && supabase) await supabase.rpc("apply_referral_code", { p_referral_code: code });
  }

  async function signUp() {
    if (!isSupabaseConfigured || !supabase) return setMessage("Supabase no está configurado todavía.");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName || email.split("@")[0] } } });
    if (error) setMessage(error.message);
    else {
      if (data.session) await applyReferral();
      setMessage(data.session ? "Cuenta creada. Entrando al dashboard..." : "Registro iniciado. Revisá tu email si está activada la confirmación.");
      if (data.session) window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  async function signIn() {
    if (!isSupabaseConfigured || !supabase) return setMessage("Supabase no está configurado todavía.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else { await applyReferral(); window.location.href = "/dashboard"; }
    setLoading(false);
  }

  return (
    <div className="container-page grid min-h-[75vh] place-items-center py-10">
      <div className="card w-full max-w-lg">
        <p className="pill">Cuenta</p><h1 className="mt-4 text-4xl font-black">Entrar a RitmoLab</h1><p className="mt-2 text-zinc-600">Registrate para guardar XP, rachas, premium, referidos y desafíos.</p>
        {!isSupabaseConfigured && <div className="mt-5 rounded-2xl bg-yellow-50 p-4 font-bold text-yellow-800">Faltan variables de Supabase.</div>}
        <div className="mt-6 space-y-3"><input className="w-full rounded-2xl border-2 border-brand-100 px-4 py-3 outline-none focus:border-brand-500" placeholder="Nombre visible" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /><input className="w-full rounded-2xl border-2 border-brand-100 px-4 py-3 outline-none focus:border-brand-500" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><input className="w-full rounded-2xl border-2 border-brand-100 px-4 py-3 outline-none focus:border-brand-500" placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={loading} onClick={signIn} className="btn-primary disabled:opacity-60">Entrar</button><button disabled={loading} onClick={signUp} className="btn-secondary disabled:opacity-60">Crear cuenta</button></div>
        {message && <p className="mt-5 rounded-2xl bg-brand-50 p-4 font-bold text-brand-800">{message}</p>}
      </div>
    </div>
  );
}

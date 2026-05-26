"use client";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
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
        <p className="pill">Cuenta</p>
        <h1 className="mt-4 text-4xl font-black">{mode === "signin" ? "Entrar a RitmoLab" : "Crear tu cuenta"}</h1>
        <p className="mt-2 text-zinc-600">Guardá tu XP, racha, habilidades, ranking, progreso por mundo y recomendaciones diarias.</p>

        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-zinc-100 p-1">
          {(["signin", "signup"] as const).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`min-h-11 rounded-xl px-4 py-2 text-sm font-black transition ${mode === item ? "bg-white text-brand-700 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              {item === "signin" ? "Entrar" : "Crear cuenta"}
            </button>
          ))}
        </div>

        {!isSupabaseConfigured && <div className="mt-5 rounded-2xl bg-yellow-50 p-4 font-bold text-yellow-800">Faltan variables de Supabase.</div>}

        <div className="mt-6 space-y-3">
          {mode === "signup" && (
            <input className="w-full rounded-2xl border-2 border-brand-100 px-4 py-3 outline-none focus:border-brand-500" placeholder="Nombre visible" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          )}
          <input className="w-full rounded-2xl border-2 border-brand-100 px-4 py-3 outline-none focus:border-brand-500" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-2xl border-2 border-brand-100 px-4 py-3 outline-none focus:border-brand-500" placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button disabled={loading} onClick={mode === "signin" ? signIn : signUp} className="btn-primary mt-5 w-full justify-center">
          {loading ? "Procesando..." : mode === "signin" ? "Entrar y continuar" : "Crear cuenta y empezar"}
        </button>

        {message && <p className="mt-5 rounded-2xl bg-brand-50 p-4 font-bold text-brand-800">{message}</p>}
      </div>
    </div>
  );
}

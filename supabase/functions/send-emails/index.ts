// @ts-nocheck
// Supabase Edge Function: send-emails
// Deploy: supabase functions deploy send-emails
// Env needed: RESEND_API_KEY, FROM_EMAIL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "RitmoLab <hola@ritmolab.app>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function bodyFor(type: string, payload: Record<string, unknown>) {
  const name = String(payload.display_name ?? "ritmista");
  if (type === "welcome") return `<h1>Bienvenido a RitmoLab, ${name} 🎵</h1><p>Tu camino rítmico ya empezó. Entrá 5 minutos, completá una lección y empezá tu racha.</p><p><a href="https://ritmolab.vercel.app/dashboard">Ir a mi dashboard</a></p>`;
  if (type === "level_up") return `<h1>¡Subiste de nivel! 🚀</h1><p>Nuevo nivel: ${payload.new_level}. Compartí tu progreso y seguí empujando.</p><p><a href="https://ritmolab.vercel.app/dashboard">Ver mi nivel</a></p>`;
  return `<h1>Tu pulso te está esperando 🥁</h1><p>Hace unos días no entrás a RitmoLab. Volvé con una práctica de 5 minutos para recuperar impulso.</p><p><a href="https://ritmolab.vercel.app/practice">Practicar ahora</a></p>`;
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  await supabase.rpc("enqueue_inactivity_emails");
  const { data: emails, error } = await supabase.from("email_queue").select("*").eq("status", "pending").order("created_at", { ascending: true }).limit(25);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  const results = [];
  for (const email of emails ?? []) {
    try {
      if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM_EMAIL, to: email.email, subject: email.subject, html: bodyFor(email.type, email.payload ?? {}) })
      });
      if (!res.ok) throw new Error(await res.text());
      await supabase.from("email_queue").update({ status: "sent", sent_at: new Date().toISOString(), attempts: email.attempts + 1 }).eq("id", email.id);
      results.push({ id: email.id, status: "sent" });
    } catch (e) {
      await supabase.from("email_queue").update({ status: "failed", attempts: email.attempts + 1, last_error: e instanceof Error ? e.message : String(e) }).eq("id", email.id);
      results.push({ id: email.id, status: "failed" });
    }
  }
  return new Response(JSON.stringify({ processed: results.length, results }), { headers: { "Content-Type": "application/json" } });
});

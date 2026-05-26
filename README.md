# RitmoLab 2.0 — Producto real

App web gamificada para aprender ritmo musical con teoría nutritiva, videos, dictado con partitura, metrónomo humano, XP, rachas, niveles, ranking, referidos y desafíos.

## Qué trae esta versión

- Acceso liberado por lanzamiento: la parte paga queda preparada pero no bloquea contenido.
- Camino progresivo por mundos: Pulso → Lectura → Dictado → Subdivisión → Musicalidad → Desafío.
- Lecciones con teoría, objetivo, tip docente, error común, video, mapa visual, aplicación musical y reflexión.
- Juegos reales:
  - Quiz teórico.
  - Metrónomo humano con precisión aproximada.
  - Dictado rítmico con partitura renderizada con ABCJS.
  - Takadimi / sílabas rítmicas.
- XP guardado en Supabase.
- Rachas reales por día de práctica.
- Niveles con nombres y barra “cuánto falta para el próximo nivel”.
- Pantalla de recompensa y compartir cuando se sube de nivel.
- Ranking de “los que más empujan”.
- Email queue para bienvenida, subida de nivel e inactividad.
- Edge Function de Supabase preparada para enviar mails con Resend.

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

## Variables locales

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xvojllupqyoeluojyrao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Variables en Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://xvojllupqyoeluojyrao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://ritmolab.vercel.app
```

## Supabase

Ejecutar completo:

```txt
database/schema.sql
```

en **Supabase → SQL Editor → New query → Run**.

## Emails reales

El sistema deja una cola `email_queue` y una función:

```txt
supabase/functions/send-emails/index.ts
```

Para enviar correos reales:

1. Crear una cuenta en Resend.
2. Configurar variables de Supabase Functions:

```env
RESEND_API_KEY=...
FROM_EMAIL=RitmoLab <hola@tu-dominio.com>
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. Deployar la función:

```bash
supabase functions deploy send-emails
```

4. Programarla con cron de Supabase para ejecutarse cada día. La función:
   - encola mails de inactividad a usuarios que no entraron en 3 días;
   - envía mails pendientes de bienvenida, inactividad y subida de nivel.

## Vercel

Usar Node 20. El build usa `scripts/build.mjs`, que setea `NEXT_PRIVATE_BUILD_WORKER=0` para evitar cuelgues de build.

Install command recomendado:

```bash
npm install --no-audit --no-fund
```

Build command:

```bash
npm run build
```

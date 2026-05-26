-- ─── Limpieza previa para reinstalación limpia ──────────────────────────────
DROP FUNCTION IF EXISTS public.get_leaderboard() CASCADE;
DROP FUNCTION IF EXISTS public.activate_demo_premium() CASCADE;
DROP FUNCTION IF EXISTS public.complete_lesson(text, text, integer, integer, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.complete_lesson(uuid, text, text, integer, integer, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_stats() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  display_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  xp integer not null default 0,
  level integer not null default 1,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  referral_code text unique,
  referred_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  mascot text,
  order_index integer not null default 0,
  access_level text not null default 'free' check (access_level in ('free', 'premium')),
  xp_reward integer not null default 50,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists modules_updated_at on public.modules;
create trigger modules_updated_at before update on public.modules for each row execute function public.set_updated_at();

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  theory_md text,
  youtube_url text,
  youtube_video_id text,
  order_index integer not null default 0,
  access_level text not null default 'free' check (access_level in ('free', 'premium')),
  xp_reward integer not null default 20,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id, slug)
);

drop trigger if exists lessons_updated_at on public.lessons;
create trigger lessons_updated_at before update on public.lessons for each row execute function public.set_updated_at();

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  type text not null check (type in ('multiple_choice', 'complete_bar', 'rhythm_tap', 'video_check', 'dictation')),
  prompt text not null,
  data jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  xp_reward integer not null default 10,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists exercises_updated_at on public.exercises;
create trigger exercises_updated_at before update on public.exercises for each row execute function public.set_updated_at();

create table if not exists public.exercise_answers (
  exercise_id uuid primary key references public.exercises(id) on delete cascade,
  correct_answer jsonb not null,
  explanation text,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'started' check (status in ('started', 'completed')),
  score integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, lesson_id)
);

drop trigger if exists lesson_progress_updated_at on public.lesson_progress;
create trigger lesson_progress_updated_at before update on public.lesson_progress for each row execute function public.set_updated_at();

create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  answer jsonb not null default '{}'::jsonb,
  is_correct boolean not null default false,
  score integer not null default 0,
  time_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source text not null,
  source_id uuid,
  points integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  icon text,
  condition_type text,
  condition_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(profile_id, badge_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('stripe', 'mercadopago', 'manual')),
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'inactive',
  plan text not null default 'free',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('stripe', 'mercadopago', 'manual')),
  provider_payment_id text,
  product_key text not null,
  amount_cents integer not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid references public.profiles(id) on delete set null,
  referral_code text not null,
  status text not null default 'clicked' check (status in ('clicked', 'registered', 'paid', 'rewarded')),
  reward_claimed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  invited_id uuid references public.profiles(id) on delete cascade,
  type text not null default 'rhythm_quiz',
  title text not null,
  module_id uuid references public.modules(id) on delete set null,
  target_score integer not null default 80,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'completed', 'cancelled')),
  winner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  accuracy numeric,
  time_ms integer,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, referral_code)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), upper(substr(replace(new.id::text, '-', ''), 1, 8)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_answers enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.points_ledger enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.subscriptions enable row level security;
alter table public.purchases enable row level security;
alter table public.referrals enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_attempts enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Published modules are public" on public.modules;
create policy "Published modules are public" on public.modules for select using (is_published = true or public.is_admin());
drop policy if exists "Admins manage modules" on public.modules;
create policy "Admins manage modules" on public.modules for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published lessons are public" on public.lessons;
create policy "Published lessons are public" on public.lessons for select using (is_published = true or public.is_admin());
drop policy if exists "Admins manage lessons" on public.lessons;
create policy "Admins manage lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published exercises are public" on public.exercises;
create policy "Published exercises are public" on public.exercises for select using (is_published = true or public.is_admin());
drop policy if exists "Admins manage exercises" on public.exercises;
create policy "Admins manage exercises" on public.exercises for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Only admins read exercise answers" on public.exercise_answers;
create policy "Only admins read exercise answers" on public.exercise_answers for select using (public.is_admin());
drop policy if exists "Admins manage exercise answers" on public.exercise_answers;
create policy "Admins manage exercise answers" on public.exercise_answers for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read own lesson progress" on public.lesson_progress;
create policy "Users read own lesson progress" on public.lesson_progress for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "Users insert own lesson progress" on public.lesson_progress;
create policy "Users insert own lesson progress" on public.lesson_progress for insert with check (profile_id = auth.uid());
drop policy if exists "Users update own lesson progress" on public.lesson_progress;
create policy "Users update own lesson progress" on public.lesson_progress for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "Users read own exercise attempts" on public.exercise_attempts;
create policy "Users read own exercise attempts" on public.exercise_attempts for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "Users insert own exercise attempts" on public.exercise_attempts;
create policy "Users insert own exercise attempts" on public.exercise_attempts for insert with check (profile_id = auth.uid());

drop policy if exists "Users read own points" on public.points_ledger;
create policy "Users read own points" on public.points_ledger for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "Admins manage points" on public.points_ledger;
create policy "Admins manage points" on public.points_ledger for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Badges are public" on public.badges;
create policy "Badges are public" on public.badges for select using (true);
drop policy if exists "Admins manage badges" on public.badges;
create policy "Admins manage badges" on public.badges for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read own badges" on public.user_badges;
create policy "Users read own badges" on public.user_badges for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "Admins manage user badges" on public.user_badges;
create policy "Admins manage user badges" on public.user_badges for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read own subscriptions" on public.subscriptions;
create policy "Users read own subscriptions" on public.subscriptions for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "Admins manage subscriptions" on public.subscriptions;
create policy "Admins manage subscriptions" on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read own purchases" on public.purchases;
create policy "Users read own purchases" on public.purchases for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "Admins manage purchases" on public.purchases;
create policy "Admins manage purchases" on public.purchases for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read related referrals" on public.referrals;
create policy "Users read related referrals" on public.referrals for select using (referrer_id = auth.uid() or referred_id = auth.uid() or public.is_admin());
drop policy if exists "Users create referrals" on public.referrals;
create policy "Users create referrals" on public.referrals for insert with check (referrer_id = auth.uid());

drop policy if exists "Users read own challenges" on public.challenges;
create policy "Users read own challenges" on public.challenges for select using (creator_id = auth.uid() or invited_id = auth.uid() or public.is_admin());
drop policy if exists "Users create challenges" on public.challenges;
create policy "Users create challenges" on public.challenges for insert with check (creator_id = auth.uid());
drop policy if exists "Users update own challenges" on public.challenges;
create policy "Users update own challenges" on public.challenges for update using (creator_id = auth.uid() or invited_id = auth.uid()) with check (creator_id = auth.uid() or invited_id = auth.uid());

drop policy if exists "Users read own challenge attempts" on public.challenge_attempts;
create policy "Users read own challenge attempts" on public.challenge_attempts for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "Users create own challenge attempts" on public.challenge_attempts;
create policy "Users create own challenge attempts" on public.challenge_attempts for insert with check (profile_id = auth.uid());

insert into public.modules (slug, title, description, mascot, order_index, access_level, xp_reward, is_published)
values
('pulso-acento-compas', 'Pulso, acento y compás', 'Aprendé a sentir el pulso, reconocer acentos y entender el compás.', 'Compasito', 1, 'free', 50, true),
('figuras-ritmicas', 'Figuras rítmicas', 'Negras, blancas, redondas, corcheas y silencios.', 'Taka', 2, 'premium', 60, true),
('sincopa-contratiempo', 'Síncopa y contratiempo', 'Entrená desplazamientos rítmicos y acentos inesperados.', 'Sincopín', 3, 'premium', 70, true),
('compas-compuesto', 'Compás compuesto', 'Comprendé subdivisiones ternarias y compases compuestos.', 'Dimi', 4, 'premium', 80, true),
('takadimi', 'Sistema Takadimi', 'Usá sílabas rítmicas para mejorar lectura y precisión.', 'Maestro Pulso', 5, 'premium', 90, true)
on conflict (slug) do update set title = excluded.title, description = excluded.description, mascot = excluded.mascot, order_index = excluded.order_index, access_level = excluded.access_level, xp_reward = excluded.xp_reward, is_published = excluded.is_published;

insert into public.lessons (module_id, slug, title, description, theory_md, order_index, access_level, xp_reward, is_published)
select id, 'que-es-el-pulso', '¿Qué es el pulso?', 'El pulso es la base estable sobre la que organizamos el ritmo.', '# ¿Qué es el pulso?\n\nEl pulso es una sensación regular y constante que nos permite seguir la música.', 1, 'free', 20, true from public.modules where slug='pulso-acento-compas'
on conflict (module_id, slug) do nothing;

insert into public.lessons (module_id, slug, title, description, theory_md, order_index, access_level, xp_reward, is_published)
select id, 'acento-musical', 'Acento musical', 'Diferenciá pulsos fuertes y débiles.', '# Acento musical\n\nEl acento es un pulso que se percibe con mayor fuerza o importancia.', 2, 'free', 20, true from public.modules where slug='pulso-acento-compas'
on conflict (module_id, slug) do nothing;

insert into public.badges (key, name, description, icon, condition_type, condition_value)
values
('primer-pulso', 'Primer Pulso', 'Completaste tu primera lección.', '🥁', 'lesson_completed', '{"count":1}'),
('racha-7', 'Pulso constante', 'Practicá 7 días seguidos.', '🔥', 'streak', '{"days":7}'),
('sincopador', 'Sincopador', 'Completaste el módulo de síncopa.', '🎵', 'module_completed', '{"module":"sincopa-contratiempo"}'),
('amigo-del-ritmo', 'Amigo del ritmo', 'Invitaste a un amigo.', '🤝', 'referral', '{"count":1}'),
('maestro-del-compas', 'Maestro del compás', 'Ganaste un desafío.', '🏆', 'challenge_won', '{"count":1}')
on conflict (key) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, condition_type = excluded.condition_type, condition_value = excluded.condition_value;

-- Functional progress layer used by the web app. Safe to run multiple times.
create table if not exists public.app_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  module_slug text not null,
  lesson_slug text not null,
  status text not null default 'started' check (status in ('started','completed')),
  score integer not null default 0,
  xp_awarded integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, module_slug, lesson_slug)
);

drop trigger if exists app_lesson_progress_updated_at on public.app_lesson_progress;
create trigger app_lesson_progress_updated_at before update on public.app_lesson_progress for each row execute function public.set_updated_at();

create table if not exists public.app_exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  module_slug text not null,
  lesson_slug text not null,
  exercise_key text not null,
  exercise_type text not null,
  answer jsonb not null default '{}'::jsonb,
  is_correct boolean not null default false,
  score integer not null default 0,
  xp integer not null default 0,
  accuracy numeric,
  time_ms integer,
  created_at timestamptz not null default now()
);

alter table public.app_lesson_progress enable row level security;
alter table public.app_exercise_attempts enable row level security;

drop policy if exists "Users read own app progress" on public.app_lesson_progress;
create policy "Users read own app progress" on public.app_lesson_progress for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "Users read own app attempts" on public.app_exercise_attempts;
create policy "Users read own app attempts" on public.app_exercise_attempts for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "RPC manages app progress" on public.app_lesson_progress;
create policy "RPC manages app progress" on public.app_lesson_progress for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "RPC manages app attempts" on public.app_exercise_attempts;
create policy "RPC manages app attempts" on public.app_exercise_attempts for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.calculate_level(total_xp integer)
returns integer language sql immutable as $$
  select case
    when total_xp >= 5000 then 6
    when total_xp >= 3000 then 5
    when total_xp >= 1600 then 4
    when total_xp >= 800 then 3
    when total_xp >= 300 then 2
    else 1
  end;
$$;

create or replace function public.award_badge_if_exists(p_profile_id uuid, p_badge_key text)
returns void language plpgsql security definer set search_path = public as $$
declare v_badge_id uuid;
begin
  select id into v_badge_id from public.badges where key = p_badge_key;
  if v_badge_id is not null then
    insert into public.user_badges(profile_id, badge_id) values (p_profile_id, v_badge_id) on conflict do nothing;
  end if;
end;
$$;

create or replace function public.complete_lesson(
  p_module_slug text,
  p_lesson_slug text,
  p_score integer,
  p_xp integer,
  p_attempts jsonb default '[]'::jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_already_completed boolean := false;
  v_award integer := greatest(0, least(coalesce(p_xp, 0), 500));
  v_total_xp integer;
  v_current_streak integer;
  v_today date := current_date;
  v_attempt jsonb;
begin
  if v_uid is null then
    raise exception 'Tenés que iniciar sesión para guardar progreso.';
  end if;

  insert into public.profiles(id, email, display_name, referral_code)
  select u.id, u.email, split_part(u.email, '@', 1), upper(substr(replace(u.id::text, '-', ''), 1, 8))
  from auth.users u where u.id = v_uid
  on conflict (id) do nothing;

  select exists(
    select 1 from public.app_lesson_progress
    where profile_id = v_uid and module_slug = p_module_slug and lesson_slug = p_lesson_slug and status = 'completed'
  ) into v_already_completed;

  insert into public.app_lesson_progress(profile_id, module_slug, lesson_slug, status, score, xp_awarded, completed_at)
  values (v_uid, p_module_slug, p_lesson_slug, 'completed', greatest(0, least(coalesce(p_score, 0), 100)), case when v_already_completed then 0 else v_award end, now())
  on conflict (profile_id, module_slug, lesson_slug) do update set
    status = 'completed',
    score = greatest(public.app_lesson_progress.score, excluded.score),
    xp_awarded = public.app_lesson_progress.xp_awarded + excluded.xp_awarded,
    completed_at = coalesce(public.app_lesson_progress.completed_at, now()),
    updated_at = now();

  if jsonb_typeof(p_attempts) = 'array' then
    for v_attempt in select * from jsonb_array_elements(p_attempts) loop
      insert into public.app_exercise_attempts(profile_id, module_slug, lesson_slug, exercise_key, exercise_type, answer, is_correct, score, xp, accuracy, time_ms)
      values (
        v_uid,
        p_module_slug,
        p_lesson_slug,
        coalesce(v_attempt->>'exercise_key', 'exercise'),
        coalesce(v_attempt->>'exercise_type', 'unknown'),
        coalesce(v_attempt->'answer', '{}'::jsonb),
        coalesce((v_attempt->>'is_correct')::boolean, false),
        greatest(0, least(coalesce((v_attempt->>'score')::integer, 0), 100)),
        greatest(0, least(coalesce((v_attempt->>'xp')::integer, 0), 200)),
        nullif(v_attempt->>'accuracy','')::numeric,
        nullif(v_attempt->>'time_ms','')::integer
      );
    end loop;
  end if;

  if not v_already_completed then
    update public.profiles
    set
      xp = xp + v_award,
      level = public.calculate_level(xp + v_award),
      current_streak = case
        when last_activity_date = v_today then current_streak
        when last_activity_date = v_today - interval '1 day' then current_streak + 1
        else 1
      end,
      longest_streak = greatest(longest_streak, case
        when last_activity_date = v_today then current_streak
        when last_activity_date = v_today - interval '1 day' then current_streak + 1
        else 1
      end),
      last_activity_date = v_today,
      updated_at = now()
    where id = v_uid;

    insert into public.points_ledger(profile_id, source, points, metadata)
    values (v_uid, 'lesson_completed', v_award, jsonb_build_object('module_slug', p_module_slug, 'lesson_slug', p_lesson_slug, 'score', p_score));

    perform public.award_badge_if_exists(v_uid, 'primer-pulso');
  else
    update public.profiles set last_activity_date = v_today, updated_at = now() where id = v_uid;
  end if;

  select xp, current_streak into v_total_xp, v_current_streak from public.profiles where id = v_uid;
  if v_current_streak >= 7 then perform public.award_badge_if_exists(v_uid, 'racha-7'); end if;
  if p_module_slug = 'sincopa-contratiempo' then perform public.award_badge_if_exists(v_uid, 'sincopador'); end if;

  return jsonb_build_object('awarded_xp', case when v_already_completed then 0 else v_award end, 'total_xp', v_total_xp, 'current_streak', v_current_streak, 'already_completed', v_already_completed);
end;
$$;

grant execute on function public.complete_lesson(text,text,integer,integer,jsonb) to authenticated;

create or replace function public.activate_demo_premium()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Tenés que iniciar sesión para activar Premium Demo.'; end if;
  insert into public.subscriptions(profile_id, provider, status, plan, current_period_end)
  values (v_uid, 'manual', 'active', 'premium_demo', now() + interval '100 years')
  on conflict do nothing;
  insert into public.purchases(profile_id, provider, product_key, amount_cents, currency, status)
  values (v_uid, 'manual', 'premium_demo', 0, 'USD', 'paid');
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.activate_demo_premium() to authenticated;

-- get_leaderboard defined below with full signature

create or replace function public.register_referral_click(p_referral_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_referrer uuid;
begin
  select id into v_referrer from public.profiles where referral_code = upper(p_referral_code) limit 1;
  if v_referrer is not null then
    insert into public.referrals(referrer_id, referral_code, status)
    values (v_referrer, upper(p_referral_code), 'clicked');
  end if;
end;
$$;
grant execute on function public.register_referral_click(text) to anon, authenticated;

create or replace function public.apply_referral_code(p_referral_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_referrer uuid;
begin
  if v_uid is null then return; end if;
  select id into v_referrer from public.profiles where referral_code = upper(p_referral_code) and id <> v_uid limit 1;
  if v_referrer is not null then
    update public.profiles set referred_by = v_referrer where id = v_uid and referred_by is null;
    insert into public.referrals(referrer_id, referred_id, referral_code, status)
    values (v_referrer, v_uid, upper(p_referral_code), 'registered');
    update public.profiles set xp = xp + 50, level = public.calculate_level(xp + 50) where id in (v_uid, v_referrer);
    perform public.award_badge_if_exists(v_referrer, 'amigo-del-ritmo');
  end if;
end;
$$;
grant execute on function public.apply_referral_code(text) to authenticated;

-- Allow client-created challenges by defaulting creator_id from auth.uid().
create or replace function public.set_challenge_creator()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.creator_id is null then new.creator_id := auth.uid(); end if;
  return new;
end;
$$;

drop trigger if exists set_challenge_creator_trigger on public.challenges;
create trigger set_challenge_creator_trigger before insert on public.challenges for each row execute function public.set_challenge_creator();

-- ==========================================================
-- RitmoLab Pro: niveles, acceso liberado, actividad y emails
-- Ejecutable de forma idempotente sobre versiones anteriores.
-- ==========================================================

alter table public.profiles add column if not exists last_seen_at timestamptz;
alter table public.profiles add column if not exists welcome_email_sent boolean not null default false;
alter table public.profiles add column if not exists last_inactivity_email_at timestamptz;

create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  type text not null check (type in ('welcome','inactivity','level_up')),
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','sent','failed','skipped')),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.email_queue enable row level security;
drop policy if exists "Admins manage email queue" on public.email_queue;
create policy "Admins manage email queue" on public.email_queue for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.level_details(total_xp integer)
returns jsonb language sql immutable as $$
  with levels(level, name, min_xp, next_xp) as (
    values
      (1, 'Primer Pulso', 0, 180),
      (2, 'Pulso Firme', 180, 420),
      (3, 'Lector Rítmico', 420, 760),
      (4, 'Oído Activo', 760, 1180),
      (5, 'Sincopador', 1180, 1700),
      (6, 'Metrónomo Humano', 1700, 2350),
      (7, 'Maestro del Compás', 2350, 3150),
      (8, 'Arquitecto del Groove', 3150, null)
  ), current_level as (
    select * from levels where total_xp >= min_xp order by min_xp desc limit 1
  ), next_level as (
    select * from levels where level = (select level + 1 from current_level) limit 1
  )
  select jsonb_build_object(
    'level', c.level,
    'level_name', c.name,
    'next_level_name', n.name,
    'xp_to_next', case when c.next_xp is null then 0 else greatest(0, c.next_xp - total_xp) end,
    'level_progress', case when c.next_xp is null then 100 else least(100, greatest(0, round(((total_xp - c.min_xp)::numeric / nullif((c.next_xp - c.min_xp), 0)) * 100))) end
  )
  from current_level c left join next_level n on true;
$$;

create or replace function public.calculate_level(total_xp integer)
returns integer language sql immutable as $$
  select (public.level_details(total_xp)->>'level')::integer;
$$;

create or replace function public.enqueue_email_once(p_profile_id uuid, p_type text, p_subject text, p_payload jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  select email into v_email from public.profiles where id = p_profile_id;
  if v_email is null then return; end if;
  if p_type = 'welcome' and exists (select 1 from public.email_queue where profile_id = p_profile_id and type = 'welcome' and status in ('pending','sent')) then
    return;
  end if;
  insert into public.email_queue(profile_id, email, type, subject, payload)
  values (p_profile_id, v_email, p_type, p_subject, coalesce(p_payload, '{}'::jsonb));
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, display_name, referral_code, last_seen_at)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), upper(substr(replace(new.id::text, '-', ''), 1, 8)), now())
  on conflict (id) do update set email = excluded.email, updated_at = now();
  perform public.enqueue_email_once(new.id, 'welcome', 'Bienvenido a RitmoLab 🎵', jsonb_build_object('display_name', coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))));
  update public.profiles set welcome_email_sent = true where id = new.id;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.mark_user_activity(p_source text default 'app_open')
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_email text; v_profile public.profiles%rowtype;
begin
  if v_uid is null then return jsonb_build_object('ok', false); end if;
  insert into public.profiles(id, email, display_name, referral_code, last_seen_at)
  select u.id, u.email, split_part(u.email, '@', 1), upper(substr(replace(u.id::text, '-', ''), 1, 8)), now()
  from auth.users u where u.id = v_uid
  on conflict (id) do nothing;
  update public.profiles set last_seen_at = now(), updated_at = now() where id = v_uid returning * into v_profile;
  if not coalesce(v_profile.welcome_email_sent, false) then
    perform public.enqueue_email_once(v_uid, 'welcome', 'Bienvenido a RitmoLab 🎵', jsonb_build_object('display_name', v_profile.display_name));
    update public.profiles set welcome_email_sent = true where id = v_uid;
  end if;
  return jsonb_build_object('ok', true, 'source', p_source);
end;
$$;
grant execute on function public.mark_user_activity(text) to authenticated;

create or replace function public.enqueue_inactivity_emails()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer := 0; v_profile record;
begin
  for v_profile in
    select * from public.profiles
    where email is not null
      and coalesce(last_seen_at, created_at) < now() - interval '3 days'
      and (last_inactivity_email_at is null or last_inactivity_email_at < now() - interval '5 days')
  loop
    perform public.enqueue_email_once(v_profile.id, 'inactivity', 'Tu pulso te está esperando en RitmoLab 🥁', jsonb_build_object('display_name', v_profile.display_name, 'current_streak', v_profile.current_streak));
    update public.profiles set last_inactivity_email_at = now() where id = v_profile.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

drop function if exists public.complete_lesson(text,text,integer,integer,jsonb);
create or replace function public.complete_lesson(
  p_module_slug text,
  p_lesson_slug text,
  p_score integer,
  p_xp integer,
  p_attempts jsonb default '[]'::jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_already_completed boolean := false;
  v_award integer := greatest(0, least(coalesce(p_xp, 0), 500));
  v_old_xp integer := 0;
  v_new_xp integer := 0;
  v_old_level integer := 1;
  v_new_level integer := 1;
  v_current_streak integer;
  v_today date := current_date;
  v_attempt jsonb;
  v_details jsonb;
begin
  if v_uid is null then raise exception 'Tenés que iniciar sesión para guardar progreso.'; end if;

  insert into public.profiles(id, email, display_name, referral_code, last_seen_at)
  select u.id, u.email, split_part(u.email, '@', 1), upper(substr(replace(u.id::text, '-', ''), 1, 8)), now()
  from auth.users u where u.id = v_uid
  on conflict (id) do nothing;

  select xp, level into v_old_xp, v_old_level from public.profiles where id = v_uid;

  select exists(select 1 from public.app_lesson_progress where profile_id = v_uid and module_slug = p_module_slug and lesson_slug = p_lesson_slug and status = 'completed') into v_already_completed;

  insert into public.app_lesson_progress(profile_id, module_slug, lesson_slug, status, score, xp_awarded, completed_at)
  values (v_uid, p_module_slug, p_lesson_slug, 'completed', greatest(0, least(coalesce(p_score, 0), 100)), case when v_already_completed then 0 else v_award end, now())
  on conflict (profile_id, module_slug, lesson_slug) do update set status = 'completed', score = greatest(public.app_lesson_progress.score, excluded.score), xp_awarded = public.app_lesson_progress.xp_awarded + excluded.xp_awarded, completed_at = coalesce(public.app_lesson_progress.completed_at, now()), updated_at = now();

  if jsonb_typeof(p_attempts) = 'array' then
    for v_attempt in select * from jsonb_array_elements(p_attempts) loop
      insert into public.app_exercise_attempts(profile_id, module_slug, lesson_slug, exercise_key, exercise_type, answer, is_correct, score, xp, accuracy, time_ms)
      values (v_uid, p_module_slug, p_lesson_slug, coalesce(v_attempt->>'exercise_key', 'exercise'), coalesce(v_attempt->>'exercise_type', 'unknown'), coalesce(v_attempt->'answer', '{}'::jsonb), coalesce((v_attempt->>'is_correct')::boolean, false), greatest(0, least(coalesce((v_attempt->>'score')::integer, 0), 100)), greatest(0, least(coalesce((v_attempt->>'xp')::integer, 0), 200)), nullif(v_attempt->>'accuracy','')::numeric, nullif(v_attempt->>'time_ms','')::integer);
    end loop;
  end if;

  if not v_already_completed then
    v_new_xp := v_old_xp + v_award;
    v_new_level := public.calculate_level(v_new_xp);
    update public.profiles set xp = v_new_xp, level = v_new_level, current_streak = case when last_activity_date = v_today then current_streak when last_activity_date = v_today - interval '1 day' then current_streak + 1 else 1 end, longest_streak = greatest(longest_streak, case when last_activity_date = v_today then current_streak when last_activity_date = v_today - interval '1 day' then current_streak + 1 else 1 end), last_activity_date = v_today, last_seen_at = now(), updated_at = now() where id = v_uid returning current_streak into v_current_streak;
    insert into public.points_ledger(profile_id, source, points, metadata) values (v_uid, 'lesson_completed', v_award, jsonb_build_object('module_slug', p_module_slug, 'lesson_slug', p_lesson_slug, 'score', p_score));
    perform public.award_badge_if_exists(v_uid, 'primer-pulso');
    if v_new_level > v_old_level then
      perform public.enqueue_email_once(v_uid, 'level_up', 'Subiste de nivel en RitmoLab 🚀', jsonb_build_object('old_level', v_old_level, 'new_level', v_new_level, 'xp', v_new_xp));
    end if;
  else
    update public.profiles set last_activity_date = v_today, last_seen_at = now(), updated_at = now() where id = v_uid returning xp, level, current_streak into v_new_xp, v_new_level, v_current_streak;
  end if;

  select public.level_details(v_new_xp) into v_details;
  if v_current_streak >= 7 then perform public.award_badge_if_exists(v_uid, 'racha-7'); end if;

  return jsonb_build_object(
    'awarded_xp', case when v_already_completed then 0 else v_award end,
    'total_xp', v_new_xp,
    'previous_level', v_old_level,
    'new_level', v_new_level,
    'level_name', v_details->>'level_name',
    'next_level_name', v_details->>'next_level_name',
    'xp_to_next', coalesce((v_details->>'xp_to_next')::integer, 0),
    'level_progress', coalesce((v_details->>'level_progress')::integer, 100),
    'current_streak', v_current_streak,
    'already_completed', v_already_completed,
    'leveled_up', v_new_level > v_old_level
  );
end;
$$;
grant execute on function public.complete_lesson(text,text,integer,integer,jsonb) to authenticated;

create or replace function public.get_leaderboard()
returns table(display_name text, xp integer, current_streak integer, level integer, level_name text)
language sql security definer set search_path = public as $$
  select coalesce(display_name, 'Ritmista') as display_name, xp, current_streak, level, public.level_details(xp)->>'level_name' as level_name
  from public.profiles
  order by xp desc, current_streak desc, last_activity_date desc nulls last
  limit 10;
$$;
grant execute on function public.get_leaderboard() to anon, authenticated;

-- Para la etapa de prueba: todo el contenido está liberado.
create or replace function public.activate_demo_premium()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  return jsonb_build_object('ok', true, 'message', 'Acceso liberado por lanzamiento');
end;
$$;
grant execute on function public.activate_demo_premium() to authenticated;

-- ─── Fase 4: Misiones diarias y repaso espaciado ──────────────────────────────

create table if not exists public.daily_missions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mission_date date not null default current_date,
  mission_key text not null, -- 'complete_lesson' | 'dictation' | 'metronome'
  completed boolean not null default false,
  completed_at timestamptz,
  xp_bonus integer not null default 0,
  created_at timestamptz not null default now(),
  unique(profile_id, mission_date, mission_key)
);

create table if not exists public.streak_freezes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  used_on_date date not null,
  created_at timestamptz not null default now(),
  unique(profile_id, used_on_date)
);

alter table public.app_lesson_progress
  add column if not exists last_reviewed_at timestamptz,
  add column if not exists review_count integer not null default 0,
  add column if not exists next_review_at timestamptz;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.daily_missions enable row level security;
alter table public.streak_freezes enable row level security;

create policy "Users see own missions" on public.daily_missions
  for all using (profile_id = auth.uid());

create policy "Users see own freezes" on public.streak_freezes
  for all using (profile_id = auth.uid());

-- ── Function: get_or_create_daily_missions ────────────────────────────────────
create or replace function public.get_or_create_daily_missions()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_today date := current_date;
  v_missions jsonb;
  v_keys text[] := array['complete_lesson','dictation','metronome'];
  v_key text;
begin
  if v_user is null then return '[]'::jsonb; end if;
  foreach v_key in array v_keys loop
    insert into public.daily_missions(profile_id, mission_date, mission_key, xp_bonus)
    values(v_user, v_today, v_key, case v_key when 'complete_lesson' then 20 else 10 end)
    on conflict(profile_id, mission_date, mission_key) do nothing;
  end loop;
  select jsonb_agg(jsonb_build_object(
    'key', mission_key,
    'completed', completed,
    'xp_bonus', xp_bonus
  ) order by mission_key)
  into v_missions
  from public.daily_missions
  where profile_id = v_user and mission_date = v_today;
  return coalesce(v_missions, '[]'::jsonb);
end;
$$;
grant execute on function public.get_or_create_daily_missions() to authenticated;

-- ── Function: complete_mission ────────────────────────────────────────────────
create or replace function public.complete_mission(p_mission_key text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_today date := current_date;
  v_xp integer := 0;
  v_all_done boolean;
begin
  if v_user is null then return '{"ok":false}'::jsonb; end if;
  update public.daily_missions
  set completed = true, completed_at = now()
  where profile_id = v_user and mission_date = v_today and mission_key = p_mission_key and not completed
  returning xp_bonus into v_xp;
  if v_xp > 0 then
    update public.profiles set xp = xp + v_xp where id = v_user;
  end if;
  select (count(*) = 3) into v_all_done
  from public.daily_missions
  where profile_id = v_user and mission_date = v_today and completed;
  if v_all_done then
    update public.profiles set xp = xp + 15 where id = v_user;
  end if;
  return jsonb_build_object('ok', true, 'xp_awarded', v_xp, 'all_complete', v_all_done);
end;
$$;
grant execute on function public.complete_mission(text) to authenticated;

-- ── Function: get_lessons_to_review ──────────────────────────────────────────
create or replace function public.get_lessons_to_review()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_result jsonb;
begin
  if v_user is null then return '[]'::jsonb; end if;
  select jsonb_agg(jsonb_build_object(
    'module_slug', module_slug,
    'lesson_slug', lesson_slug,
    'score', score,
    'days_since', extract(day from now() - completed_at)::int
  ) order by completed_at asc)
  into v_result
  from public.app_lesson_progress
  where profile_id = v_user
    and status = 'completed'
    and score < 90
    and (next_review_at is null or next_review_at <= now())
    and completed_at < now() - interval '2 days'
  limit 2;
  return coalesce(v_result, '[]'::jsonb);
end;
$$;
grant execute on function public.get_lessons_to_review() to authenticated;

-- ── Function: mark_lesson_reviewed ───────────────────────────────────────────
create or replace function public.mark_lesson_reviewed(p_module_slug text, p_lesson_slug text, p_score integer)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_count integer;
begin
  if v_user is null then return; end if;
  select review_count into v_count from public.app_lesson_progress
  where profile_id = v_user and module_slug = p_module_slug and lesson_slug = p_lesson_slug;
  update public.app_lesson_progress
  set last_reviewed_at = now(),
      review_count = coalesce(v_count, 0) + 1,
      next_review_at = case
        when coalesce(v_count, 0) = 0 then now() + interval '3 days'
        when coalesce(v_count, 0) = 1 then now() + interval '7 days'
        else now() + interval '21 days'
      end,
      score = greatest(score, p_score)
  where profile_id = v_user and module_slug = p_module_slug and lesson_slug = p_lesson_slug;
end;
$$;
grant execute on function public.mark_lesson_reviewed(text,text,integer) to authenticated;

-- ── Function: use_streak_freeze ───────────────────────────────────────────────
create or replace function public.use_streak_freeze()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_yesterday date := current_date - 1;
  v_freezes_used integer;
begin
  if v_user is null then return '{"ok":false,"reason":"not_logged_in"}'::jsonb; end if;
  select count(*) into v_freezes_used from public.streak_freezes
  where profile_id = v_user
    and used_on_date >= date_trunc('week', current_date)::date;
  if v_freezes_used >= 1 then
    return '{"ok":false,"reason":"already_used_this_week"}'::jsonb;
  end if;
  insert into public.streak_freezes(profile_id, used_on_date) values(v_user, v_yesterday)
  on conflict do nothing;
  return '{"ok":true}'::jsonb;
end;
$$;
grant execute on function public.use_streak_freeze() to authenticated;

-- ─── Fase 5: Analytics, SkillRadar y Reto Semanal ────────────────────────────

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}',
  session_id text,
  created_at timestamptz not null default now()
);
create index if not exists idx_analytics_event_name on public.analytics_events(event_name);
create index if not exists idx_analytics_profile on public.analytics_events(profile_id, created_at desc);

create table if not exists public.skill_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null default date_trunc('week', current_date)::date,
  pulse_score numeric(5,2) default 0,
  reading_score numeric(5,2) default 0,
  subdivision_score numeric(5,2) default 0,
  independence_score numeric(5,2) default 0,
  memory_score numeric(5,2) default 0,
  updated_at timestamptz not null default now(),
  unique(profile_id, week_start)
);

create table if not exists public.weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,
  pattern_slug text not null,
  pattern_label text not null,
  bpm integer not null default 80,
  target_score integer not null default 85,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.weekly_challenges(id) on delete cascade,
  score integer not null default 0,
  error_ms integer,
  attempted_at timestamptz not null default now(),
  unique(profile_id, challenge_id)
);

alter table public.analytics_events enable row level security;
alter table public.skill_snapshots enable row level security;
alter table public.weekly_challenges enable row level security;
alter table public.weekly_challenge_attempts enable row level security;

create policy "Users insert own events" on public.analytics_events for insert with check (profile_id = auth.uid() or profile_id is null);
create policy "Users see own snapshots" on public.skill_snapshots for all using (profile_id = auth.uid());
create policy "Anyone reads challenges" on public.weekly_challenges for select using (true);
create policy "Users manage own attempts" on public.weekly_challenge_attempts for all using (profile_id = auth.uid());

-- ── Function: track_event ─────────────────────────────────────────────────────
create or replace function public.track_event(p_event text, p_props jsonb default '{}', p_session text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.analytics_events(profile_id, event_name, properties, session_id)
  values(auth.uid(), p_event, p_props, p_session);
exception when others then null;
end;
$$;
grant execute on function public.track_event(text, jsonb, text) to authenticated, anon;

-- ── Function: get_free_practice_sessions ────────────────────────────────────
-- Lee solo los eventos del usuario autenticado y los normaliza al modelo
-- PracticeSession usado por lib/engine/skill-system.ts.
create or replace function public.get_free_practice_sessions(p_limit integer default 500)
returns table(
  skill_id text,
  accuracy integer,
  bpm integer,
  exercise_type text,
  difficulty integer,
  time_signature text,
  pattern_id text,
  pattern_label text,
  timestamp timestamptz
) language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return;
  end if;

  return query
  select
    properties->>'skillId' as skill_id,
    least(100, greatest(0, coalesce((properties->>'accuracy')::numeric, 0)))::integer as accuracy,
    greatest(1, coalesce((properties->>'bpm')::numeric, 80))::integer as bpm,
    coalesce(properties->>'exerciseType', 'free_practice') as exercise_type,
    least(10, greatest(1, coalesce((properties->>'difficulty')::numeric, 1)))::integer as difficulty,
    coalesce(properties->>'timeSignature', '4/4') as time_signature,
    properties->>'patternId' as pattern_id,
    properties->>'patternLabel' as pattern_label,
    created_at as timestamp
  from public.analytics_events
  where profile_id = auth.uid()
    and event_name = 'free_practice_session'
    and properties ? 'skillId'
  order by created_at asc
  limit least(greatest(coalesce(p_limit, 500), 1), 2000);
end;
$$;
grant execute on function public.get_free_practice_sessions(integer) to authenticated;

-- ── Function: get_skill_scores ────────────────────────────────────────────────
create or replace function public.get_skill_scores()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_pulse numeric := 0;
  v_reading numeric := 0;
  v_subdivision numeric := 0;
  v_independence numeric := 0;
  v_memory numeric := 0;
begin
  if v_user is null then
    return '{"pulse":0,"reading":0,"subdivision":0,"independence":0,"memory":0}'::jsonb;
  end if;
  -- Pulse: avg score from human_metronome exercises (higher score = better)
  select coalesce(avg((e.answer->>'score')::numeric), 0) into v_pulse
  from public.app_exercise_attempts e
  join public.app_lesson_progress lp on lp.id = e.lesson_progress_id
  where lp.profile_id = v_user and e.exercise_type = 'human_metronome' and e.is_correct;
  -- Reading: avg score from dictation exercises
  select coalesce(avg(e.score::numeric), 0) into v_reading
  from public.app_exercise_attempts e
  join public.app_lesson_progress lp on lp.id = e.lesson_progress_id
  where lp.profile_id = v_user and e.exercise_type = 'dictation';
  -- Subdivision: score on tresillo/semicorchea lessons
  select coalesce(avg(score::numeric), 0) into v_subdivision
  from public.app_lesson_progress
  where profile_id = v_user and module_slug in ('subdivision', 'subdivisin');
  -- Independence: bimanual score
  select coalesce(avg(score::numeric), 0) into v_independence
  from public.app_lesson_progress
  where profile_id = v_user and module_slug = 'coordinacion-bimanual';
  -- Memory: call_response exercises
  select coalesce(avg(e.score::numeric), 0) into v_memory
  from public.app_exercise_attempts e
  join public.app_lesson_progress lp on lp.id = e.lesson_progress_id
  where lp.profile_id = v_user and e.exercise_type = 'call_response';
  return jsonb_build_object(
    'pulse', least(100, round(v_pulse)),
    'reading', least(100, round(v_reading)),
    'subdivision', least(100, round(v_subdivision)),
    'independence', least(100, round(v_independence)),
    'memory', least(100, round(v_memory))
  );
end;
$$;
grant execute on function public.get_skill_scores() to authenticated;

-- ── Function: get_weekly_leaderboard ─────────────────────────────────────────
create or replace function public.get_weekly_leaderboard()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_result jsonb;
begin
  select jsonb_agg(row order by row->>'xp_week' desc)
  into v_result
  from (
    select jsonb_build_object(
      'display_name', coalesce(p.display_name, 'Ritmista'),
      'xp_week', coalesce(sum(pl.xp_awarded), 0),
      'lessons_week', count(pl.id)
    ) as row
    from public.profiles p
    left join public.app_lesson_progress pl
      on pl.profile_id = p.id
      and pl.completed_at >= date_trunc('week', current_timestamp)
    group by p.id, p.display_name
    having coalesce(sum(pl.xp_awarded), 0) > 0
    order by sum(pl.xp_awarded) desc nulls last
    limit 20
  ) sub;
  return coalesce(v_result, '[]'::jsonb);
end;
$$;
grant execute on function public.get_weekly_leaderboard() to anon, authenticated;

-- ── Function: get_current_weekly_challenge ────────────────────────────────────
create or replace function public.get_current_weekly_challenge()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_week date := date_trunc('week', current_date)::date;
  v_challenge jsonb;
  v_user_attempt jsonb;
  v_user uuid := auth.uid();
begin
  select jsonb_build_object('id', id, 'pattern_slug', pattern_slug, 'pattern_label', pattern_label, 'bpm', bpm, 'target_score', target_score)
  into v_challenge from public.weekly_challenges where week_start = v_week;
  if v_challenge is null then
    insert into public.weekly_challenges(week_start, pattern_slug, pattern_label, bpm, target_score)
    values(v_week, 'negras-parejas', 'Negras a 80 BPM', 80, 85)
    on conflict(week_start) do nothing;
    select jsonb_build_object('id', id, 'pattern_slug', pattern_slug, 'pattern_label', pattern_label, 'bpm', bpm, 'target_score', target_score)
    into v_challenge from public.weekly_challenges where week_start = v_week;
  end if;
  if v_user is not null then
    select jsonb_build_object('score', score, 'error_ms', error_ms)
    into v_user_attempt
    from public.weekly_challenge_attempts
    where profile_id = v_user and challenge_id = (v_challenge->>'id')::uuid;
  end if;
  return jsonb_build_object(
    'challenge', v_challenge,
    'user_attempt', v_user_attempt,
    'week_start', v_week
  );
end;
$$;
grant execute on function public.get_current_weekly_challenge() to anon, authenticated;

-- ── Seed: insert current week challenge so it's ready ────────────────────────
insert into public.weekly_challenges(week_start, pattern_slug, pattern_label, bpm, target_score)
values(date_trunc('week', current_date)::date, 'negras-parejas', 'Negras a 80 BPM', 80, 85)
on conflict(week_start) do nothing;

-- ─── Fase 6: Badge auto-award ──────────────────────────────────────────────────

create or replace function public.check_and_award_badges(p_user uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := coalesce(p_user, auth.uid());
  v_xp integer; v_streak integer; v_lessons integer;
  v_awarded text[] := '{}';
  v_badge_key text;
  v_badge_id uuid;
begin
  if v_user is null then return '[]'::jsonb; end if;
  select xp, current_streak into v_xp, v_streak from public.profiles where id = v_user;
  select count(*) into v_lessons from public.app_lesson_progress
    where profile_id = v_user and status = 'completed';

  -- Define badge conditions
  for v_badge_key in
    select key from (values
      ('primer-pulso'),
      ('pulso-firme'),
      ('lector-ritmico'),
      ('oido-activo'),
      ('metronomo-humano'),
      ('maestro-del-compas')
    ) t(key)
  loop
    -- Skip if already awarded
    continue when exists(
      select 1 from public.user_badges ub
      join public.badges b on b.id = ub.badge_id
      where ub.profile_id = v_user and b.key = v_badge_key
    );

    -- Check condition
    if (v_badge_key = 'primer-pulso' and v_lessons >= 1) or
       (v_badge_key = 'pulso-firme' and v_xp >= 180) or
       (v_badge_key = 'lector-ritmico' and v_lessons >= 5) or
       (v_badge_key = 'oido-activo' and exists(
         select 1 from public.app_exercise_attempts ea
         join public.app_lesson_progress lp on lp.id = ea.lesson_progress_id
         where lp.profile_id = v_user and ea.exercise_type = 'dictation' and ea.is_correct)) or
       (v_badge_key = 'metronomo-humano' and exists(
         select 1 from public.app_exercise_attempts ea
         join public.app_lesson_progress lp on lp.id = ea.lesson_progress_id
         where lp.profile_id = v_user and ea.exercise_type = 'human_metronome' and ea.score >= 85)) or
       (v_badge_key = 'maestro-del-compas' and v_lessons >= 10)
    then
      select id into v_badge_id from public.badges where key = v_badge_key limit 1;
      if v_badge_id is not null then
        insert into public.user_badges(profile_id, badge_id)
        values(v_user, v_badge_id)
        on conflict do nothing;
        v_awarded := v_awarded || v_badge_key;
      end if;
    end if;
  end loop;

  return to_jsonb(v_awarded);
end;
$$;
grant execute on function public.check_and_award_badges(uuid) to authenticated;

-- Auto-check badges after lesson completion by wrapping complete_lesson
create or replace function public.complete_lesson_with_badges(
  p_module_slug text, p_lesson_slug text, p_score integer, p_xp integer, p_attempts jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_result jsonb; v_badges jsonb;
begin
  select complete_lesson(p_module_slug, p_lesson_slug, p_score, p_xp, p_attempts) into v_result;
  select check_and_award_badges() into v_badges;
  return v_result || jsonb_build_object('new_badges', v_badges);
end;
$$;
grant execute on function public.complete_lesson_with_badges(text,text,integer,integer,jsonb) to authenticated;

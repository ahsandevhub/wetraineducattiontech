-- Profiles table linked to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
  END IF;
END $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS policies
alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  );
$$;

DO $$
BEGIN
  BEGIN
    create policy "profiles select own or admin"
      on public.profiles
      for select
      using (auth.uid() = id or public.is_admin());
  EXCEPTION WHEN duplicate_object THEN null;
  END;

  BEGIN
    create policy "profiles insert own"
      on public.profiles
      for insert
      with check (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN null;
  END;

  BEGIN
    create policy "profiles update own no role change"
      on public.profiles
      for update
      using (auth.uid() = id)
      with check (
        auth.uid() = id
        and role = (select role from public.profiles where id = auth.uid())
      );
  EXCEPTION WHEN duplicate_object THEN null;
  END;

  BEGIN
    create policy "profiles admin update"
      on public.profiles
      for update
      using (public.is_admin())
      with check (public.is_admin());
  EXCEPTION WHEN duplicate_object THEN null;
  END;
END $$;

-- Optional RLS rules for orders and payments if tables exist
DO $$
begin
  if to_regclass('public.orders') is not null then
    execute 'alter table public.orders enable row level security';
    begin
      execute 'create policy "orders select own or admin" on public.orders for select using (user_id = auth.uid() or public.is_admin())';
    exception when duplicate_object then null; end;
    begin
      execute 'create policy "orders insert own" on public.orders for insert with check (user_id = auth.uid())';
    exception when duplicate_object then null; end;
    begin
      execute 'create policy "orders update own or admin" on public.orders for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin())';
    exception when duplicate_object then null; end;
  end if;

  if to_regclass('public.payments') is not null then
    execute 'alter table public.payments enable row level security';
    begin
      execute 'create policy "payments select own or admin" on public.payments for select using (user_id = auth.uid() or public.is_admin())';
    exception when duplicate_object then null; end;
    begin
      execute 'create policy "payments insert own" on public.payments for insert with check (user_id = auth.uid())';
    exception when duplicate_object then null; end;
    begin
      execute 'create policy "payments update own or admin" on public.payments for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin())';
    exception when duplicate_object then null; end;
  end if;
end $$;

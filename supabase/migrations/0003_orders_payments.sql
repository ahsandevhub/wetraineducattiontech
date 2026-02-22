-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_name text not null,
  amount numeric not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null,
  method text not null,
  status text not null default 'pending',
  reference text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.orders enable row level security;
alter table public.payments enable row level security;

-- Policies with safe guards
DO $$
begin
  begin
    execute 'create policy "orders select own or admin" on public.orders for select using (user_id = auth.uid() or public.is_admin())';
  exception when duplicate_object then null; end;

  begin
    execute 'create policy "orders insert own" on public.orders for insert with check (user_id = auth.uid())';
  exception when duplicate_object then null; end;

  begin
    execute 'create policy "orders update own or admin" on public.orders for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin())';
  exception when duplicate_object then null; end;

  begin
    execute 'create policy "payments select own or admin" on public.payments for select using (user_id = auth.uid() or public.is_admin())';
  exception when duplicate_object then null; end;

  begin
    execute 'create policy "payments insert own" on public.payments for insert with check (user_id = auth.uid())';
  exception when duplicate_object then null; end;

  begin
    execute 'create policy "payments update own or admin" on public.payments for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin())';
  exception when duplicate_object then null; end;
end $$;

-- Products, order items, and ordering metadata
-- Safe for non-production environments

-- Product categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'product_category' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.product_category AS ENUM (
      'marketing',
      'it',
      'course',
      'challenge'
    );
  END IF;
END $$;

-- Products/services table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  code text not null unique,
  category public.product_category not null,
  price numeric,
  currency text not null default 'BDT',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders: add order_no and currency
alter table public.orders
  add column if not exists order_no text,
  add column if not exists currency text default 'BDT';

create unique index if not exists orders_order_no_key on public.orders (order_no);

-- Payments: add provider and currency
alter table public.payments
  add column if not exists provider text,
  add column if not exists currency text default 'BDT';

-- Order items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1,
  unit_price numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (order_id, product_id)
);

-- Enable RLS
alter table public.products enable row level security;
alter table public.order_items enable row level security;

-- Policies (idempotent)
DO $$
begin
  begin
    execute 'create policy "products select all" on public.products for select using (true)';
  exception when duplicate_object then null; end;

  begin
    execute 'create policy "order_items select own or admin" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())))';
  exception when duplicate_object then null; end;

  begin
    execute 'create policy "order_items insert own" on public.order_items for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()))';
  exception when duplicate_object then null; end;

  begin
    execute 'create policy "order_items update own or admin" on public.order_items for update using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))) with check (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())))';
  exception when duplicate_object then null; end;
end $$;

-- Align schema with application usage

-- Orders: ensure order_no + currency exist
alter table public.orders
  add column if not exists order_no text,
  add column if not exists currency text default 'BDT';

create unique index if not exists orders_order_no_key on public.orders (order_no);

-- Payments: ensure provider, service, and currency exist
alter table public.payments
  add column if not exists provider text,
  add column if not exists service text,
  add column if not exists currency text default 'BDT';

-- Profiles: ensure country default matches app expectation
alter table public.profiles
  add column if not exists country text;

alter table public.profiles
  alter column country set default 'Bangladesh';

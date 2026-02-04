-- Add detailed address fields to profiles table
alter table public.profiles
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text,
  add column if not exists country text default 'BD';

-- Add comment for documentation
comment on column public.profiles.address is 'Street address, apartment, suite, etc.';
comment on column public.profiles.city is 'City name';
comment on column public.profiles.state is 'State or Province';
comment on column public.profiles.postal_code is 'Postal or ZIP code';
comment on column public.profiles.country is 'ISO 3166-1 alpha-2 country code';

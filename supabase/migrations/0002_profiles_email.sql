-- Add email column to profiles and keep it in sync with auth.users
alter table public.profiles
  add column if not exists email text unique;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.profiles
  set email = new.email,
      updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.sync_profile_email();

-- Backfill existing profiles
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Update handle_new_user to store email on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

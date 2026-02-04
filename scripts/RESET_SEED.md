# Supabase Reset + Seed (Non‑Production)

## Safety Guards

- The script refuses to run when any of these are set to production values:
  - `NODE_ENV=production`
  - `SUPABASE_ENV=production`
  - `VERCEL_ENV=production`
  - `RESET_SEED_ENV=production`
- You must explicitly set `RESET_SEED_ALLOW=true`.

## Modes

- **data-only** (default): wipes data in public tables, preserves `auth.users`.
- **full**: wipes public data **and** deletes `auth.users`.

## Auth Seeding

- By default, the script **does not** create auth users. It reuses existing users (if any) and seeds profiles for them.
- To create deterministic demo auth users, run with `--with-auth`.

## What Gets Seeded

- Products/services aligned to the site (Marketing, IT Services, Courses, Challenge Packages).
- Profiles with ISO country codes (e.g., `BD`).
- Orders, order items, and payments with valid statuses/providers.

## Run Order (Internals)

1. Environment guard checks.
2. Wipe tables (`TRUNCATE … CASCADE`), optionally delete `auth.users`.
3. Optional auth user creation.
4. Upsert profiles from auth users.
5. Upsert products.
6. Insert orders and order items.
7. Insert payments.
8. Print post‑seed verification counts.

## Example Usage

```bash
# data-only mode (preserve auth.users)
RESET_SEED_ALLOW=true node scripts/reset-seed.mjs --mode data-only

# full reset + create auth users
RESET_SEED_ALLOW=true node scripts/reset-seed.mjs --mode full --with-auth
```

## Required Environment Variables

- `SUPABASE_DB_URL`, `SUPABASE_POOLER_URL`, or `DATABASE_URL`
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (only if using `--with-auth`)

## Verification

The script outputs counts for:

- `profiles`
- `products`
- `orders`
- `order_items`
- `payments`

# Skill: Supabase

## Use When

- working on auth
- changing data access
- touching server actions or API routes
- considering migrations or RLS updates

## Project Facts

- identity source is `auth.users`
- Education users resolve through `profiles`
- CRM users resolve through `crm_users`
- HRM users resolve through `hrm_users`
- shared role lookup lives in `app/utils/auth/roles.ts`
- server client helpers live in `app/utils/supabase/*`
- environment and admin helpers live in `lib/supabase/*`

## Safe Workflow

1. inspect the target table, route, and role flow
2. confirm whether the action is a read, mutation, webhook, or cron task
3. preserve RLS-aware access unless there is a deliberate admin path
4. validate data before writing
5. test against the test database before any live migration

## Never Do

- bypass role checks with ad hoc queries
- edit previously applied migrations
- use production as the first environment for debugging
- weaken RLS just to get a page working

## Read Next

- `docs/DATABASE_RULES.md`
- `docs/UNIFIED_AUTH_FLOW.md`
- `docs/MIGRATION_GUIDE.md`
- `docs/DATABASE_MIGRATION_SAFETY.md`
- `docs/stack/supabase.md`
- `docs/stack/auth.md`

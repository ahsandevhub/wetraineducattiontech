# Database Rules

This project uses Supabase with Row Level Security and a shared auth system. Database changes are high risk.

## Non-Negotiable Rules

- `auth.users` is the identity source of truth.
- Education, CRM, HRM, and Store keep separate domain tables and roles.
- Do not bypass RLS in normal app flows.
- Do not write migrations casually or combine unrelated schema changes.
- Do not edit old migration files after they have been applied.

## Current Access Model

- Education profile data lives in `profiles`
- CRM access lives in `crm_users`
- HRM access lives in `hrm_users`
- Store access lives in `store_users`
- role resolution should flow through `app/utils/auth/roles.ts`

## Approved Read Paths

- server-side reads should use the existing Supabase server client helpers
- permission-aware pages should resolve roles with `getCurrentUserWithRoles()`
- route protection should continue to flow through middleware and existing guards

## Approved Write Paths

- prefer server actions inside `app/**/_actions/`
- use API routes for webhooks, uploads, cron, or explicit integration endpoints
- validate all inbound data before writing
- revalidate affected routes after successful writes where needed

## Migration Rules

1. Start with `npm run migrate:test`
2. verify schema, RLS, and role behavior on the test database
3. document any risky rollout or rollback notes
4. only then consider `npm run migrate:live`

See also:

- `docs/MIGRATION_GUIDE.md`
- `docs/DATABASE_MIGRATION_SAFETY.md`

## RLS Rules

- every new table should be evaluated for RLS immediately
- policy changes must be tested for at least the intended role and one unintended role
- never assume service-role behavior matches user-session behavior
- avoid introducing functions or queries that silently widen access

## MCP Safety

- use Supabase MCP against local or non-production environments first
- prefer read-only MCP access for investigation
- never let an AI tool run destructive database changes without explicit human intent

## Files To Inspect For DB Work

- `app/utils/auth/roles.ts`
- `app/utils/supabase/server.ts`
- `app/utils/supabase/middleware.ts`
- `lib/supabase/env.ts`
- `supabase/migrations/*`

# Supabase Stack Documentation

## Current Baseline

- `@supabase/supabase-js` `2.103.0`
- `@supabase/ssr` `0.8.0`
- `@supabase/auth-helpers-nextjs` `0.15.0`

## Project Rules

- `auth.users` is the identity source of truth
- app-side Supabase helpers live in `app/utils/supabase/*`
- environment/admin helpers live in `lib/supabase/*`
- preserve `getCurrentUserWithRoles()` as the shared role resolver
- treat auth callbacks, RLS, migrations, and admin helpers as high-risk

## Shared Data Boundaries

- Education data stays under Education-owned tables and routes
- CRM data stays under CRM-owned tables and routes
- HRM data stays under HRM-owned tables and routes
- Store data stays under Store-owned tables and routes
- shared infra does not mean shared business ownership

## MCP Reference

Official Supabase MCP guidance now uses the hosted server at:

- `https://mcp.supabase.com/mcp`

Important current details:

- hosted MCP now authenticates with browser-based OAuth by default
- personal access tokens are no longer required for normal interactive setup
- local CLI MCP is exposed at `http://localhost:54321/mcp`
- the most important URL query params are `project_ref`, `read_only`, and `features`

Recommended usage for this repo:

- prefer a non-production project
- prefer `read_only=true` unless you intentionally need write access
- restrict features when possible, for example `database,docs`

## Security Rules

- never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- never use user-editable metadata for authorization
- enable and test RLS on exposed tables
- verify both `SELECT` and `UPDATE` policy behavior
- keep destructive MCP/database work off production unless explicitly intended

## Workflow

- use local/dev projects first
- use server actions for in-app mutations where appropriate
- verify schema and auth changes after editing
- keep migration history clean and deliberate

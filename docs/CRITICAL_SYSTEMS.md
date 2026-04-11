# Critical Systems

These systems must not break during routine feature work or cleanup.

## Authentication

- Supabase auth session handling
- middleware-driven session refresh
- unified auth callback and email-link flows
- invite, verify-email, magic-link, and set-password screens

Reference:

- `docs/UNIFIED_AUTH_FLOW.md`
- `docs/AUTH_EMAIL_SETUP.md`
- `docs/SUPABASE_EMAIL_TEMPLATES.md`

## Role Resolution And Routing

- `getCurrentUserWithRoles()` is the shared role resolver
- route priority is Education > CRM > HRM > Store
- unauthorized users must land on `/unauthorized`
- module access must remain isolated

## Module Boundaries

- `/(landing)/*` is public marketing and conversion
- `/dashboard/customer/*` is Education
- `/dashboard/crm/*` is CRM
- `/dashboard/hrm/*` is HRM
- `/dashboard/store/*` is Store

Shared code must not blur business ownership between these areas.

## Database Safety

- RLS policies
- migration ordering
- auth-linked user tables
- payment and order records
- CRM ownership, HRM hierarchy data, and Store ledger/stock data

## Operational Systems

- HRM cron endpoints and `HRM_CRON_SECRET`
- payment flows and Stripe integration
- upload and admin endpoints
- certificate and enrollment records

## High-Risk Change Areas

- `middleware.ts`
- `app/utils/auth/*`
- `app/utils/supabase/*`
- `lib/supabase/*`
- `app/auth/*`
- `app/api/hrm/cron/*`
- payment routes and order processing

If a task touches any of the above, use extra inspection, smaller edits, and stronger verification.

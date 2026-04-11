# Debugging Guide

Use this workflow before applying speculative fixes.

## General Workflow

1. Reproduce the issue in the smallest possible route or action.
2. Identify the target module and user role.
3. Check whether the problem is auth, routing, data, UI, or environment.
4. Inspect the nearest existing implementation before changing code.
5. Fix the root cause, not only the visible symptom.

## Auth And Access Bugs

Check:

- `middleware.ts`
- `app/utils/supabase/middleware.ts`
- `app/utils/auth/roles.ts`
- the target page layout and route guard
- redirect behavior for users with multiple roles

Questions:

- Is the user authenticated?
- Does the user exist in the expected module table?
- Is the route using the correct guard and redirect?
- Is the issue in session exchange or permission resolution?

## Database And RLS Bugs

Check:

- the target query
- table policies
- whether the query runs under anon, user, or service-role context
- the latest relevant migration files

Questions:

- Is the data missing or just blocked by policy?
- Did a schema change drift from the current code?
- Is the write path using the correct server-side helper?

## UI And Form Bugs

Check:

- existing Shadcn form usage
- loading and error states
- mobile layout
- server-action response handling

Questions:

- Is the issue validation, state handling, or styling?
- Is the route using a shared pattern that should be reused?

## Cron And Background Bugs

Check:

- `docs/HRM_CRON.md`
- `lib/hrm/cron-auth.ts`
- cron route auth headers
- environment variables

Questions:

- Is `HRM_CRON_SECRET` configured?
- Is the endpoint protected but still reachable?
- Did data prerequisites for the cron job already exist?

## Useful Commands

```bash
npm run lint
npm run migrate:test
rg "getCurrentUserWithRoles" app
rg "createClient\\(" app lib
```

## Debugging Rules

- do not guess when the code can be inspected
- do not change schema to compensate for an application bug
- do not disable RLS to "prove" a fix
- do not fix cross-module bugs from only one module's perspective

# Skill: Next.js App Router

## Use When

- adding or changing pages, layouts, loading states, or route handlers
- deciding between a server action and an API route
- debugging route protection or redirects

## Project Facts

- public routes are primarily under `app/(landing)`
- protected app routes are under `app/dashboard`
- middleware delegates to `app/utils/supabase/middleware.ts`
- route access depends on `getCurrentUserWithRoles()`

## Safe Workflow

1. inspect the nearest route segment, layout, and sibling pages
2. preserve server-component defaults unless client interactivity is needed
3. use server actions for in-app mutations
4. use route handlers for integrations, uploads, callbacks, and cron endpoints
5. verify redirects and role checks after changes

## Watch For

- route-group boundaries
- accidental client-component expansion
- duplicated auth checks
- broken loading and error states

## Read Next

- `docs/AI_EXECUTION_FLOW.md`
- `docs/CRITICAL_SYSTEMS.md`
- `docs/product/routing-map.md`
- `docs/product/architecture.md`
- `docs/stack/nextjs.md`

# Next.js Stack Documentation

## Current Baseline

- Next.js `16.2.3`
- React `19`
- TypeScript `5`
- App Router only

## Source of Truth

- For any Next.js work, read the version-matched docs bundled in `node_modules/next/dist/docs/`
- `AGENTS.md` and `CLAUDE.md` already instruct agents to use those bundled docs

## Project Conventions

- Public routes live under `app/(landing)`
- Protected routes live under `app/dashboard`
- Server Components are the default
- Use Client Components only for browser interactivity
- Prefer Server Actions for in-app mutations
- Use route handlers for callbacks, uploads, cron, and integrations

## Runtime Structure

- Root layout: `app/layout.tsx`
- Dashboard routing shell: `app/dashboard/*`
- Root proxy file: `proxy.ts`
- Shared auth helpers: `app/utils/auth/*`
- Shared Supabase app helpers: `app/utils/supabase/*`
- Environment/admin Supabase helpers: `lib/supabase/*`

## Next.js MCP

Official Next.js guidance for `16.2.3`:

- `next-devtools-mcp` is configured in the root `.mcp.json`
- start the dev server with `npm run dev`
- the built-in runtime MCP endpoint is exposed by Next.js at `/_next/mcp`
- the MCP package auto-discovers the running Next.js instance

## Practical Rules

- Preserve route-group and module boundaries
- Prefer built-in file conventions over custom abstractions
- Keep `proxy.ts` behavior minimal and auth-focused
- Validate UI changes on mobile and desktop
- Treat warnings from Next.js runtime and devtools as actionable

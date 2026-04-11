# WeTrainEducation & Tech Platform

Multi-module business platform built on Next.js App Router with shared Supabase authentication and distinct business ownership across landing, Education, CRM, and HRM.

## Architecture

- `app/(landing)` contains public marketing and conversion pages
- `app/dashboard/customer` contains Education customer workflows
- `app/dashboard/crm` contains CRM sales workflows
- `app/dashboard/hrm` contains HRM employee workflows
- Shared auth, routing, UI, and infra live in `app/utils`, `lib`, and `components/ui`

## Stack

- Next.js `16.2.3`
- React `19`
- Tailwind CSS `4`
- Shadcn UI
- Supabase Auth + Postgres
- Stripe
- Vercel

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## MCP Setup

- Root MCP config lives in `.mcp.json`
- Workspace MCP config lives in `.vscode/mcp.json`
- Next.js MCP uses `next-devtools-mcp@latest`
- Supabase MCP uses the hosted server at `https://mcp.supabase.com/mcp`
- Supabase local MCP is available at `http://localhost:54321/mcp` when `supabase start` is running

## Documentation

- `AGENTS.md` is the primary agent instruction file
- `docs/README.md` maps the durable project docs
- `docs/modules/` covers module ownership and boundaries
- `docs/product/` keeps route and architecture reference docs
- `docs/stack/` keeps framework and integration references
- `skills/README.md` maps repo-local agent guides

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run migrate:test
npm run migrate:live
npm run seed:public
npm run seed:hrm
npm run seed:crm
npm run db:clean
```

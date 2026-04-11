<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# WeTrainEducation AI Agent Instructions

This file is the primary source of truth for AI agents working in this repository.

## Repository Shape

WeTrainEducation & Tech contains four major areas:

1. Public landing pages
2. Education customer system
3. CRM sales system
4. HRM employee system

All systems share Supabase authentication, but they do not share business ownership.

## Required Reading Order

Before substantial work, read in this order:

1. `AGENTS.md`
2. `docs/CRITICAL_SYSTEMS.md`
3. the relevant file in `skills/`
4. the relevant file in `docs/modules/`
5. the relevant file in `docs/stack/`
6. the target code

## Execution Priorities

When making decisions, prefer:

1. runtime safety
2. auth and database safety
3. existing code behavior
4. module boundaries
5. shared project patterns
6. documentation convenience

## Strict Rules

### Inspect Before Editing

- always inspect the target files first
- reuse existing helpers before creating new abstractions
- confirm whether the change belongs to landing, education, CRM, HRM, or shared systems

### Respect Boundaries

- landing routes live under `/(landing)`
- Education routes live under `/dashboard/customer`
- CRM routes live under `/dashboard/crm`
- HRM routes live under `/dashboard/hrm`
- do not move module-specific logic into shared code unless there is clear reuse

### Auth And Roles

- use `getCurrentUserWithRoles()` from `app/utils/auth/roles.ts`
- preserve route priority: Education > CRM > HRM
- preserve redirects to `/unauthorized` for blocked users
- inspect middleware before changing auth behavior

### Supabase Rules

- identity source of truth is `auth.users`
- app-side server Supabase helpers live in `app/utils/supabase/*`
- environment and admin helpers live in `lib/supabase/*`
- prefer server actions for app mutations
- treat migrations, RLS, and auth callbacks as high-risk changes

### UI Rules

- use `components/ui/*` and existing Shadcn patterns first
- preserve loading, empty, and error states
- keep the yellow brand direction unless a task is explicitly about theme changes
- verify mobile behavior for UI changes

### Documentation Rules

- update docs only when long-lived behavior or architecture changes
- avoid adding one-off reports, temporary checklists, or generic prompt templates
- `docs/` should remain a durable reference set, not a task history log

## AI Execution Flow

1. identify the target module and affected roles
2. inspect the nearby implementation
3. identify the safest existing pattern
4. make the smallest correct change
5. verify auth, routing, and data impact
6. update durable docs if needed

## MCP And Skills

- repo-local skills live in `skills/`
- workspace MCP config lives in `.vscode/mcp.json`
- use MCP for investigation carefully and prefer local or non-production environments
- do not use MCP or any AI tool to perform destructive database work without clear human intent

## High-Risk Areas

- `middleware.ts`
- `app/utils/auth/*`
- `app/utils/supabase/*`
- `lib/supabase/*`
- `app/auth/*`
- `app/api/hrm/cron/*`
- payment, order, certificate, invite, and user-management flows

## When To Pause And Clarify

Ask for clarification if:

- business logic is unclear
- a change crosses module boundaries in a non-obvious way
- role expectations are ambiguous
- a migration or policy change could affect existing data access

## Secondary Instruction Files

Other instruction files should reinforce this file, not compete with it. If guidance conflicts, follow `AGENTS.md`.

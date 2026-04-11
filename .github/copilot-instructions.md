# GitHub Copilot Instructions

Use `AGENTS.md` as the primary rule set for this repository.

## Working Order

1. read `AGENTS.md`
2. read `docs/CRITICAL_SYSTEMS.md`
3. read the relevant `skills/*.md`
4. inspect the target code

## Non-Negotiables

- keep landing, education, CRM, and HRM responsibilities separate
- use existing auth and Supabase helpers
- preserve role checks, middleware behavior, and RLS-aware access
- prefer server actions for in-app mutations
- avoid adding redundant docs or temporary AI prompt files

If guidance conflicts, follow `AGENTS.md`.

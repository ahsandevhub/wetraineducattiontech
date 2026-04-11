# Skills

These repo-local skills are short operating guides for AI agents. They are not replacements for code inspection.

## Skill Order

Use these in this order when relevant:

1. `module-boundaries.md`
2. one of `supabase.md`, `nextjs-app-router.md`, or `ui-system.md`
3. the matching docs in `docs/modules/` and `docs/stack/`

## Available Skills

- `supabase.md` for auth, RLS, migrations, and database safety
- `nextjs-app-router.md` for route, layout, and server-action patterns
- `ui-system.md` for Shadcn, forms, loading states, and theme usage
- `module-boundaries.md` for business-domain isolation and route ownership

## Rule

If a skill and a code file disagree, inspect the current implementation and update the skill only if the code is the intentional source of truth.

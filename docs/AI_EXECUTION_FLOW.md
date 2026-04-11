# AI Execution Flow

This repository is optimized for AI agents that need to work safely in a production business system.

## Primary Goal

Make the smallest correct change that preserves:

- authentication
- role boundaries
- Supabase data safety
- module isolation
- current business behavior

## Required Reading Order

Before making non-trivial changes, read in this order:

1. `AGENTS.md`
2. `docs/CRITICAL_SYSTEMS.md`
3. the relevant file in `docs/modules/`
4. the relevant file in `docs/stack/`
5. the target implementation files

## Execution Sequence

1. Identify the target module: landing, education, CRM, HRM, Store, or shared.
2. Confirm the auth and permission boundary for that work.
3. Inspect the existing code before proposing a pattern.
4. Reuse the existing folder structure and helpers.
5. Make focused changes.
6. Verify affected flows, especially auth, permissions, and data writes.
7. Update docs only if the architecture, workflow, or rules changed.

## Decision Priorities

When instructions conflict, prefer this order:

1. runtime safety and database safety
2. existing code behavior
3. `AGENTS.md`
4. `docs/CRITICAL_SYSTEMS.md`
5. module docs
6. stack docs
7. README and secondary instruction files

## Execution Rules

- Prefer inspection over assumption.
- Prefer server actions for mutations unless an API route already fits the integration.
- Prefer existing auth helpers over custom role logic.
- Prefer existing UI primitives over custom one-off components.
- Keep landing, education, CRM, HRM, and Store concerns separate.
- Never make broad refactors unless the task explicitly calls for them.

## Required Safety Checks

Before finishing, check the relevant subset of:

- login, registration, invite, magic link, and password flows
- role-based routing to education, CRM, HRM, and Store
- RLS-sensitive reads and writes
- cron or scheduled endpoints if touched
- responsive behavior if UI was changed

## When To Stop And Ask

Pause and ask for clarification if:

- a change affects more than one module in a non-obvious way
- the correct role or access policy is unclear
- a migration would change production data shape or permissions
- the docs and code disagree on business behavior

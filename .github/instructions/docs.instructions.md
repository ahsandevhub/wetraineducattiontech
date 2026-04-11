# Documentation Instructions

## Source Of Truth

Use `AGENTS.md` and `docs/README.md` first.

## Durable Structure

- `docs/modules/` for module behavior and boundaries
- `docs/product/` for architecture and permissions
- `docs/stack/` for implementation patterns
- top-level `docs/*.md` only for durable operational and AI-safety references

## Documentation Rules

- keep docs concrete and repository-specific
- update docs when long-lived behavior changes
- prefer merging overlapping docs into one durable reference
- do not add prompt-template docs or one-off completion reports
- remove stale references when a doc is deleted or merged

## Update Triggers

- auth or permission changes
- routing or module-boundary changes
- Supabase, RLS, migration, or cron changes
- new shared patterns that future contributors must follow
